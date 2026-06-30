import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOutIcon, ShieldIcon, ZapIcon, CalendarIcon } from '../components/Icons';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/sign-in', { replace: true });
  }

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
    : '?';

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    : '—';

  return (
    <div className="dashboard">
      {/* Background orbs */}
      <div className="dashboard__bg-orb dashboard__bg-orb--1" />
      <div className="dashboard__bg-orb dashboard__bg-orb--2" />

      {/* Navigation bar */}
      <nav className="dashboard__nav" id="dashboard-nav">
        <div className="dashboard__nav-logo">
          <div className="dashboard__nav-logo-icon">E</div>
          <span className="dashboard__nav-brand">
            Easy<span>Generator</span>
          </span>
        </div>

        <div className="dashboard__nav-actions">
          <div className="dashboard__user-chip" id="user-chip">
            <div className="dashboard__user-avatar">{initials}</div>
            <span className="dashboard__user-name">{user?.name}</span>
          </div>
          <button
            className="btn btn--ghost"
            onClick={handleLogout}
            id="logout-btn"
          >
            <LogOutIcon size={16} />
            Sign out
          </button>
        </div>
      </nav>

      {/* Main content */}
      <div className="dashboard__content">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <div className="dashboard__hero-badge" id="auth-status-badge">
            <span className="dashboard__hero-badge-dot" />
            Authenticated
          </div>

          <h1 className="dashboard__hero-title" id="welcome-heading">
            Welcome to the application
          </h1>

          <p className="dashboard__hero-subtitle">
            You're signed in as{' '}
            <strong style={{ color: 'hsl(var(--text-primary))' }}>
              {user?.email}
            </strong>
            . This is a protected page that requires authentication to access.
          </p>
        </motion.div>

        <motion.div
          className="dashboard__cards"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            delay: 0.15,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <div className="stat-card" id="card-security">
            <div className="stat-card__icon stat-card__icon--purple">
              <ShieldIcon size={20} />
            </div>
            <div className="stat-card__label">Security</div>
            <div className="stat-card__value">JWT Protected</div>
          </div>

          <div className="stat-card" id="card-status">
            <div className="stat-card__icon stat-card__icon--green">
              <ZapIcon size={20} />
            </div>
            <div className="stat-card__label">Session</div>
            <div className="stat-card__value">Active</div>
          </div>

          <div className="stat-card" id="card-member-since">
            <div className="stat-card__icon stat-card__icon--amber">
              <CalendarIcon size={20} />
            </div>
            <div className="stat-card__label">Member since</div>
            <div className="stat-card__value">{memberSince}</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <button
            className="btn btn--danger"
            onClick={handleLogout}
            id="logout-btn-hero"
          >
            <LogOutIcon size={16} />
            End session
          </button>
        </motion.div>
      </div>
    </div>
  );
}
