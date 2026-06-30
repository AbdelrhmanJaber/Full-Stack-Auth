import type { ReactNode } from 'react';

interface Props {
  title: string;
  subtitle: string;
  children: ReactNode;
  sideTitle?: string;
  sideDescription?: string;
}

/**
 * Shared layout shell for authentication pages — split pane with decorative
 * gradient side panel on desktop.
 */
export default function AuthLayout({
  title,
  subtitle,
  children,
  sideTitle = 'Build. Share.\nGrow faster.',
  sideDescription = 'Create engaging e-learning content that captivates your audience and accelerates knowledge transfer.',
}: Props) {
  return (
    <div className="auth-layout">
      {/* Decorative side panel */}
      <aside className="auth-layout__side" aria-hidden="true">
        <div className="auth-layout__grid" />
        <div className="auth-layout__orb auth-layout__orb--1" />
        <div className="auth-layout__orb auth-layout__orb--2" />
        <div className="auth-layout__orb auth-layout__orb--3" />

        <div className="auth-layout__side-content">
          <h2 className="auth-layout__side-title">
            {sideTitle.split('\n').map((line, i) => (
              <span key={i}>
                {line}
                {i < sideTitle.split('\n').length - 1 && <br />}
              </span>
            ))}
          </h2>
          <p className="auth-layout__side-desc">{sideDescription}</p>
        </div>
      </aside>

      {/* Form area */}
      <main className="auth-layout__main">
        <div className="auth-form-wrapper">
          {/* Logo */}
          <div className="logo">
            <div className="logo__icon">E</div>
            <div className="logo__text">
              Easy<span>Generator</span>
            </div>
          </div>

          {/* Header */}
          <div className="form-header">
            <h1 className="form-header__title">{title}</h1>
            <p className="form-header__subtitle">{subtitle}</p>
          </div>

          {children}
        </div>
      </main>
    </div>
  );
}
