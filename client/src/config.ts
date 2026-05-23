/**
 * Client Configuration Settings
 * Automatically resolved from Vite environment variables (.env files) in production/development,
 * with standard safe fallbacks.
 */
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
