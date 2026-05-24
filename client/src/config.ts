/**
 * Client Configuration Settings
 * Automatically resolved from Vite environment variables (.env files) in production/development,
 * with standard safe fallbacks.
 */
const rawUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Self-correcting URL parser: automatically guarantees the URL terminates with '/api' 
// even if the Vercel environment variable was added without it (e.g. 'https://example.com' -> 'https://example.com/api')
export const API_BASE_URL = rawUrl.endsWith('/api') 
  ? rawUrl 
  : `${rawUrl.replace(/\/$/, '')}/api`;
