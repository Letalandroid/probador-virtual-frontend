// Environment configuration
// Handle both Vite (import.meta.env) and Jest (process.env) environments
const getEnvVar = (key: string, defaultValue: string): string => {
  // In Jest environment, use process.env
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || defaultValue;
  }
  // In Vite environment, use import.meta.env
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[key] || defaultValue;
  }
  return defaultValue;
};

export const config = {
  apiBaseUrl: getEnvVar('VITE_API_BASE_URL', 'http://localhost:3000'),
  pythonApiUrl: getEnvVar('VITE_PYTHON_API_URL', 'http://localhost:8000'),
  supabaseUrl: getEnvVar('VITE_SUPABASE_URL', 'https://schbbdodgajmbzeeriwd.supabase.co'),
  supabaseAnonKey: getEnvVar('VITE_SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjaGJiZG9kZ2FqbWJ6ZWVyaXdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3MjMxNjMsImV4cCI6MjA3NDI5OTE2M30.AfrB3ZcQTqGkQzoMPIlINhmkcVvSq8ew29oVwypgKD0'),
};

