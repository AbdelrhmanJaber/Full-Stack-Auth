import type { PasswordStrength } from '../hooks/usePasswordStrength';

interface Props {
  strength: PasswordStrength;
  visible: boolean;
}

export default function PasswordStrengthMeter({ strength, visible }: Props) {
  if (!visible) return null;

  return (
    <div className="pw-strength">
      <div className="pw-strength__bar-track">
        <div
          className="pw-strength__bar-fill"
          style={{
            width: `${strength.percent}%`,
            backgroundColor: strength.color,
          }}
        />
      </div>
      <div className="pw-strength__checks">
        {strength.checks.map((check) => (
          <span
            key={check.label}
            className={`pw-check ${check.met ? 'pw-check--met' : ''}`}
          >
            <span className="pw-check__dot" />
            {check.label}
          </span>
        ))}
      </div>
    </div>
  );
}
