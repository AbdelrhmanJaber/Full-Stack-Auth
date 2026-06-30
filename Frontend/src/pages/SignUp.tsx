import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { extractErrorMessage } from '../api/client';
import AuthLayout from '../components/AuthLayout';
import PasswordStrengthMeter from '../components/PasswordStrengthMeter';
import { usePasswordStrength } from '../hooks/usePasswordStrength';
import {
  MailIcon,
  LockIcon,
  UserIcon,
  EyeIcon,
  EyeOffIcon,
  AlertCircleIcon,
} from '../components/Icons';

export default function SignUp() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
  });

  const strength = usePasswordStrength(password);

  // Validation
  const nameValid = name.trim().length >= 3;
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const passwordValid = strength.score === 4;

  const canSubmit = nameValid && emailValid && passwordValid && !loading;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setTouched({ name: true, email: true, password: true });
    if (!canSubmit) return;

    setServerError('');
    setLoading(true);

    try {
      await signUp({ name: name.trim(), email: email.trim(), password });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setServerError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join thousands of content creators worldwide."
      sideTitle={'Design smarter.\nTeach better.'}
      sideDescription="EasyGenerator empowers you to create interactive e-learning content without needing technical expertise."
    >
      <form onSubmit={handleSubmit} noValidate id="sign-up-form">
        {serverError && (
          <div className="server-error" role="alert" id="signup-server-error">
            <AlertCircleIcon size={16} />
            {serverError}
          </div>
        )}

        {/* Full name */}
        <div className="form-group">
          <label className="form-group__label" htmlFor="signup-name">
            Full name
          </label>
          <div className="form-group__input-wrap">
            <input
              id="signup-name"
              type="text"
              className={`form-group__input ${
                touched.name && !nameValid ? 'form-group__input--error' : ''
              }`}
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, name: true }))}
              autoComplete="name"
              autoFocus
            />
            <UserIcon className="form-group__icon" />
          </div>
          {touched.name && !nameValid && (
            <span className="form-group__error" id="signup-name-error">
              <AlertCircleIcon /> Name must be at least 3 characters
            </span>
          )}
        </div>

        {/* Email */}
        <div className="form-group">
          <label className="form-group__label" htmlFor="signup-email">
            Email address
          </label>
          <div className="form-group__input-wrap">
            <input
              id="signup-email"
              type="email"
              className={`form-group__input ${
                touched.email && !emailValid ? 'form-group__input--error' : ''
              }`}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, email: true }))}
              autoComplete="email"
            />
            <MailIcon className="form-group__icon" />
          </div>
          {touched.email && !emailValid && email.length > 0 && (
            <span className="form-group__error" id="signup-email-error">
              <AlertCircleIcon /> Enter a valid email address
            </span>
          )}
        </div>

        {/* Password */}
        <div className="form-group">
          <label className="form-group__label" htmlFor="signup-password">
            Password
          </label>
          <div className="form-group__input-wrap">
            <input
              id="signup-password"
              type={showPw ? 'text' : 'password'}
              className={`form-group__input ${
                touched.password && !passwordValid
                  ? 'form-group__input--error'
                  : ''
              }`}
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, password: true }))}
              autoComplete="new-password"
            />
            <LockIcon className="form-group__icon" />
            <button
              type="button"
              className="form-group__toggle-pw"
              onClick={() => setShowPw((p) => !p)}
              aria-label={showPw ? 'Hide password' : 'Show password'}
              id="signup-toggle-pw"
            >
              {showPw ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
            </button>
          </div>
          <PasswordStrengthMeter
            strength={strength}
            visible={password.length > 0}
          />
          {touched.password && !passwordValid && password.length > 0 && (
            <span className="form-group__error" id="signup-password-error">
              <AlertCircleIcon /> Password doesn't meet all requirements
            </span>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="btn btn--primary"
          disabled={!canSubmit}
          id="signup-submit"
        >
          {loading ? <span className="btn__spinner" /> : 'Create account'}
        </button>
      </form>

      <p className="form-footer">
        Already have an account?{' '}
        <Link to="/sign-in" id="goto-signin">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
