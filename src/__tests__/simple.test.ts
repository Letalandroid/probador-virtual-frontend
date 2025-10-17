describe('Simple test', () => {
  it('should work with Jest types', () => {
    const mockFn = jest.fn();
    expect(mockFn).toBeDefined();
    expect(typeof mockFn).toBe('function');
  });
});
