import '@testing-library/jest-dom';

// Mock import.meta
Object.defineProperty(global, 'import', {
  value: {
    meta: {
      env: {
        VITE_API_BASE_URL: 'http://localhost:3000',
        VITE_PYTHON_API_URL: 'http://localhost:8000',
        VITE_SUPABASE_URL: 'https://schbbdodgajmbzeeriwd.supabase.co',
        VITE_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjaGJiZG9kZ2FqbWJ6ZWVyaXdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3MjMxNjMsImV4cCI6MjA3NDI5OTE2M30.AfrB3ZcQTqGkQzoMPIlINhmkcVvSq8ew29oVwypgKD0',
      },
    },
  },
  writable: true,
});

// Mock para TypeScript - declaración global
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface Global {
      import: {
        meta: {
          env: {
            VITE_API_BASE_URL?: string;
            VITE_PYTHON_API_URL?: string;
            VITE_SUPABASE_URL?: string;
            VITE_SUPABASE_ANON_KEY?: string;
          };
        };
      };
    }
  }
}

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  root: Element | null = null;
  rootMargin: string = '0px';
  thresholds: ReadonlyArray<number> = [0];

  constructor(
    public callback: IntersectionObserverCallback,
    public options?: IntersectionObserverInit
  ) {
    if (options) {
      this.root = (options.root as Element) || null;
      this.rootMargin = options.rootMargin || '0px';
      this.thresholds = Array.isArray(options.threshold) 
        ? options.threshold 
        : [options.threshold || 0];
    }
  }

  disconnect() {}
  observe() {}
  unobserve() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
} as unknown as typeof IntersectionObserver;

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock URL.createObjectURL and URL.revokeObjectURL
global.URL.createObjectURL = jest.fn(() => 'mocked-url');
global.URL.revokeObjectURL = jest.fn();

// Mock FileReader
global.FileReader = class FileReader {
  static readonly EMPTY = 0;
  static readonly LOADING = 1;
  static readonly DONE = 2;

  readonly EMPTY = 0;
  readonly LOADING = 1;
  readonly DONE = 2;

  result: string | ArrayBuffer | null = null;
  readyState: number = 0;
  onload: ((event: Event) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  onloadend: ((event: Event) => void) | null = null;
  onloadstart: ((event: Event) => void) | null = null;
  onprogress: ((event: Event) => void) | null = null;
  onabort: ((event: Event) => void) | null = null;

  // EventTarget methods
  addEventListener = jest.fn();
  removeEventListener = jest.fn();
  dispatchEvent = jest.fn();

  readAsDataURL() {
    this.readyState = 1;
    setTimeout(() => {
      this.result = 'data:image/jpeg;base64,test';
      this.readyState = 2;
      if (this.onload) {
        this.onload({ target: this } as unknown as Event);
      }
    }, 0);
  }

  readAsText() {
    this.readyState = 1;
    setTimeout(() => {
      this.result = 'test content';
      this.readyState = 2;
      if (this.onload) {
        this.onload({ target: this } as unknown as Event);
      }
    }, 0);
  }

  abort() {}
} as unknown as typeof FileReader;

// Mock fetch
global.fetch = jest.fn();

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};
global.localStorage = localStorageMock as unknown as Storage;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};
global.sessionStorage = sessionStorageMock as unknown as Storage;