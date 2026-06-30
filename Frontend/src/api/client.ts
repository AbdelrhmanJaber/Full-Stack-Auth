import axios from 'axios';
import type {
  ApiEnvelope,
  AuthResponse,
  SignInPayload,
  SignUpPayload,
  User,
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
});

// Attach JWT automatically on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401 → clear stale tokens
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  },
);

/**
 * Extract user-facing error message from the backend error shape.
 *
 * The NestJS backend responds with:
 *  - `{ message: string }` for simple errors
 *  - `{ message: string[] }` for validation errors
 */
export function extractErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (data) {
      if (Array.isArray(data.message)) {
        return data.message[0];
      }
      if (typeof data.message === 'string') {
        return data.message;
      }
    }
    if (error.code === 'ERR_NETWORK') {
      return 'Unable to connect to the server. Please try again.';
    }
  }
  return 'Something went wrong. Please try again.';
}

/* ---- Auth endpoints ---- */

export async function signUp(payload: SignUpPayload): Promise<AuthResponse> {
  const { data } = await api.post<ApiEnvelope<AuthResponse>>(
    '/auth/sign-up',
    payload,
  );
  return data.data;
}

export async function signIn(payload: SignInPayload): Promise<AuthResponse> {
  const { data } = await api.post<ApiEnvelope<AuthResponse>>(
    '/auth/sign-in',
    payload,
  );
  return data.data;
}

export async function getMe(): Promise<User> {
  const { data } = await api.get<ApiEnvelope<User>>('/auth/me');
  return data.data;
}

export default api;
