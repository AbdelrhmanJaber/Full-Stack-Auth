import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePasswordStrength } from '../hooks/usePasswordStrength';

describe('usePasswordStrength', () => {
  it('should return score 0 for an empty password', () => {
    const { result } = renderHook(() => usePasswordStrength(''));
    expect(result.current.score).toBe(0);
    expect(result.current.percent).toBe(0);
  });

  it('should detect minimum 8 characters', () => {
    const { result } = renderHook(() => usePasswordStrength('12345678'));
    const check = result.current.checks.find((c) => c.label === '8+ characters');
    expect(check?.met).toBe(true);
  });

  it('should detect at least one letter', () => {
    const { result } = renderHook(() => usePasswordStrength('a'));
    const check = result.current.checks.find((c) => c.label === 'One letter');
    expect(check?.met).toBe(true);
  });

  it('should detect at least one number', () => {
    const { result } = renderHook(() => usePasswordStrength('1'));
    const check = result.current.checks.find((c) => c.label === 'One number');
    expect(check?.met).toBe(true);
  });

  it('should detect at least one special character', () => {
    const { result } = renderHook(() => usePasswordStrength('!'));
    const check = result.current.checks.find((c) => c.label === 'One special char');
    expect(check?.met).toBe(true);
  });

  it('should return score 4 and 100% for a fully valid password', () => {
    const { result } = renderHook(() => usePasswordStrength('P@ssw0rd!'));
    expect(result.current.score).toBe(4);
    expect(result.current.percent).toBe(100);
  });

  it('should return score 2 for a password with only letters and length', () => {
    const { result } = renderHook(() => usePasswordStrength('abcdefgh'));
    expect(result.current.score).toBe(2); // 8+ chars + letter
  });

  it('should fail all checks for a too-short number-only password', () => {
    const { result } = renderHook(() => usePasswordStrength('123'));
    expect(result.current.score).toBe(1); // only "one number" met
  });

  it('should return a green color for score 4', () => {
    const { result } = renderHook(() => usePasswordStrength('P@ssw0rd!'));
    expect(result.current.color).toBe('hsl(152, 68%, 52%)');
  });

  it('should return a red color for score 1', () => {
    const { result } = renderHook(() => usePasswordStrength('1'));
    expect(result.current.color).toBe('hsl(0, 84%, 60%)');
  });
});
