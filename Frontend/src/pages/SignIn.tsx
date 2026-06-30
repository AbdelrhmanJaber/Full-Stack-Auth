import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { extractErrorMessage } from '../api/client';
import AuthLayout from '../components/AuthLayout';
import {
  MailIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  AlertCircleIcon,
} from '../components/Icons';

export default function SignIn() {
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  // Simple client-side checks
  const [touched, setTouched] = useState({ email: false, password: false });

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const passwordValid = password.length > 0;

  const canSubmit = emailValid && passwordValid && !loading;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (!canSubmit) return;

    setServerError('');
    setLoading(true);

    try {
      await signIn({ email: email.trim(), password });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setServerError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue where you left off."
    >
      <form onSubmit={handleSubmit} noValidate id="sign-in-form">
        {serverError && (
          <div className="server-error" role="alert" id="signin-server-error">
            <AlertCircleIcon size={16} />
            {serverError}
          </div>
        )}

        {/* Email */}
        <div className="form-group">
          <label className="form-group__label" htmlFor="signin-email">
            Email address
          </label>
          <div className="form-group__input-wrap">
            <input
              id="signin-email"
              type="email"
              className={`form-group__input ${
                touched.email && !emailValid ? 'form-group__input--error' : ''
              }`}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, email: true }))}
              autoComplete="email"
              autoFocus
            />
            <MailIcon className="form-group__icon" />
          </div>
          {touched.email && !emailValid && email.length > 0 && (
            <span className="form-group__error" id="signin-email-error">
              <AlertCircleIcon /> Enter a valid email address
            </span>
          )}
        </div>

        {/* Password */}
        <div className="form-group">
          <label className="form-group__label" htmlFor="signin-password">
            Password
          </label>
          <div className="form-group__input-wrap">
            <input
              id="signin-password"
              type={showPw ? 'text' : 'password'}
              className={`form-group__input ${
                touched.password && !passwordValid
                  ? 'form-group__input--error'
                  : ''
              }`}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, password: true }))}
              autoComplete="current-password"
            />
            <LockIcon className="form-group__icon" />
            <button
              type="button"
              className="form-group__toggle-pw"
              onClick={() => setShowPw((p) => !p)}
              aria-label={showPw ? 'Hide password' : 'Show password'}
              id="signin-toggle-pw"
            >
              {showPw ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
            </button>
          </div>
          {touched.password && !passwordValid && (
            <span className="form-group__error" id="signin-password-error">
              <AlertCircleIcon /> Password is required
            </span>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="btn btn--primary"
          disabled={!canSubmit}
          id="signin-submit"
        >
          {loading ? <span className="btn__spinner" /> : 'Sign in'}
        </button>
      </form>

      <p className="form-footer">
        Don&apos;t have an account?{' '}
        <Link to="/sign-up" id="goto-signup">
          Create one
        </Link>
      </p>
    </AuthLayout>
  );
}
