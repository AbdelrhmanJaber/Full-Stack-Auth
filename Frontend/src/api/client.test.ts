import { describe, it, expect, vi, beforeEach } from 'vitest';
import { extractErrorMessage } from './client';
import { AxiosError, AxiosHeaders } from 'axios';

describe('extractErrorMessage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should extract a single string message from axios error', () => {
    const error = new AxiosError('Request failed', '400', undefined, undefined, {
      data: { message: 'Email already exists' },
      status: 400,
      statusText: 'Bad Request',
      headers: {},
      config: { headers: new AxiosHeaders() },
    });
    expect(extractErrorMessage(error)).toBe('Email already exists');
  });

  it('should extract the first message from an array', () => {
    const error = new AxiosError('Request failed', '400', undefined, undefined, {
      data: { message: ['Name is too short', 'Password is invalid'] },
      status: 400,
      statusText: 'Bad Request',
      headers: {},
      config: { headers: new AxiosHeaders() },
    });
    expect(extractErrorMessage(error)).toBe('Name is too short');
  });

  it('should return network error message for ERR_NETWORK', () => {
    const error = new AxiosError('Network Error', 'ERR_NETWORK');
    expect(extractErrorMessage(error)).toBe(
      'Unable to connect to the server. Please try again.',
    );
  });

  it('should return generic message for non-axios errors', () => {
    expect(extractErrorMessage(new Error('unknown'))).toBe(
      'Something went wrong. Please try again.',
    );
  });

  it('should return generic message for null/undefined', () => {
    expect(extractErrorMessage(null)).toBe(
      'Something went wrong. Please try again.',
    );
  });
});
