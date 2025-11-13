import { ApiService } from '../../lib/api';
import { config } from '@/config/env';

const SAMPLE_BASE64_IMAGE =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=';

describe('ApiService ↔ Python API integration', () => {
  let api: ApiService;

  beforeEach(() => {
    localStorage.clear();
    api = new ApiService();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('performs virtual try-on flow against Python API', async () => {
    const mockPayload = { success: true, result_url: 'https://example.com/result.png' };
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => mockPayload,
    } as Response);

    const response = await api.virtualTryOn(
      SAMPLE_BASE64_IMAGE,
      SAMPLE_BASE64_IMAGE,
      'shirt',
      { color: 'red' },
    );

    expect(fetchMock).toHaveBeenCalledWith(
      `${config.pythonApiUrl}/virtual-try-on`,
      expect.objectContaining({
        method: 'POST',
        body: expect.any(FormData),
      }),
    );

    const body = fetchMock.mock.calls[0][1]?.body as FormData;
    expect(body.get('clothing_type')).toBe('shirt');
    expect(body.get('style_preferences')).toBe(JSON.stringify({ color: 'red' }));
    expect(body.get('person_image')).toBeInstanceOf(Blob);
    expect(body.get('clothing_image')).toBeInstanceOf(Blob);
    expect(response.data).toEqual(mockPayload);
  });

  it('propagates Python API errors when torso detection fails', async () => {
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({}),
    } as Response);

    const response = await api.detectTorso(SAMPLE_BASE64_IMAGE);

    expect(fetchMock).toHaveBeenCalledWith(
      `${config.pythonApiUrl}/detect-torso`,
      expect.objectContaining({
        method: 'POST',
        body: expect.any(FormData),
      }),
    );
    expect(response.error).toContain('500');
    const body = fetchMock.mock.calls[0][1]?.body as FormData;
    expect(body.get('person_image')).toBeInstanceOf(Blob);
  });

  it('checks AI health endpoint successfully', async () => {
    const mockPayload = { status: 'ok', message: 'Python API healthy' };
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => mockPayload,
    } as Response);

    const response = await api.checkAiHealth();

    expect(fetchMock).toHaveBeenCalledWith(`${config.pythonApiUrl}/health`);
    expect(response.data).toEqual(mockPayload);
  });
});
