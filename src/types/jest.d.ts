/// <reference types="jest" />

declare global {
  const jest: typeof import('jest');
  const global: typeof globalThis & {
    jest: typeof import('jest');
  };
}

export {};
