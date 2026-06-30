import { useMemo } from 'react';

export interface PasswordCheck {
  label: string;
  met: boolean;
}

export interface PasswordStrength {
  score: number;         // 0-4
  percent: number;       // 0-100
  color: string;
  checks: PasswordCheck[];
}

/**
 * Evaluate password complexity against the backend requirements.
 */
export function usePasswordStrength(password: string): PasswordStrength {
  return useMemo(() => {
    const checks: PasswordCheck[] = [
      { label: '8+ characters', met: password.length >= 8 },
      { label: 'One letter', met: /[a-zA-Z]/.test(password) },
      { label: 'One number', met: /\d/.test(password) },
      { label: 'One special char', met: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password) },
    ];

    const score = checks.filter((c) => c.met).length;
    const percent = (score / 4) * 100;

    const colors: Record<number, string> = {
      0: 'hsl(0, 0%, 30%)',
      1: 'hsl(0, 84%, 60%)',
      2: 'hsl(38, 92%, 50%)',
      3: 'hsl(45, 93%, 47%)',
      4: 'hsl(152, 68%, 52%)',
    };

    return { score, percent, color: colors[score], checks };
  }, [password]);
}
