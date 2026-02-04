import type { ApiClient } from './interface';
import { mockApi } from './mock';
import { realApi } from './real';

/**
 * API client singleton.
 * Controlled by VITE_API_MODE env variable: 'mock' (default) | 'real'
 */
const mode = import.meta.env.VITE_API_MODE || 'mock';

export const api: ApiClient = mode === 'real' ? realApi : mockApi;

export type { ApiClient };
