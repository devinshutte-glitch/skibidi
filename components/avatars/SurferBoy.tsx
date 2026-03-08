export default function SurferBoy({ size = 120, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background circle */}
      <circle cx="60" cy="60" r="58" fill="#0ea3dc" opacity="0.15" />

      {/* Body */}
      <ellipse cx="60" cy="85" rx="22" ry="18" fill="#FDBCB4" />

      {/* Board shorts */}
      <ellipse cx="60" cy="90" rx="20" ry="12" fill="#0283ba" />
      <line x1="60" y1="78" x2="60" y2="102" stroke="#0ea3dc" strokeWidth="1.5" opacity="0.5" />

      {/* Head */}
      <circle cx="60" cy="48" r="22" fill="#F5C6A0" />

      {/* Hair */}
      <ellipse cx="60" cy="36" rx="20" ry="10" fill="#4A3728" />
      <ellipse cx="42" cy="42" rx="5" ry="8" fill="#4A3728" />
      <ellipse cx="78" cy="42" rx="5" ry="8" fill="#4A3728" />

      {/* Sunglasses */}
      <rect x="45" y="43" width="11" height="8" rx="3" fill="#1A1A2E" opacity="0.9" />
      <rect x="64" y="43" width="11" height="8" rx="3" fill="#1A1A2E" opacity="0.9" />
      <line x1="56" y1="47" x2="64" y2="47" stroke="#1A1A2E" strokeWidth="2" />
      <line x1="44" y1="47" x2="42" y2="46" stroke="#1A1A2E" strokeWidth="2" />
      <line x1="75" y1="47" x2="77" y2="46" stroke="#1A1A2E" strokeWidth="2" />
      <rect x="46" y="44" width="9" height="6" rx="2" fill="#0ea3dc" opacity="0.4" />
      <rect x="65" y="44" width="9" height="6" rx="2" fill="#0ea3dc" opacity="0.4" />

      {/* Smile */}
      <path d="M53 57 Q60 63 67 57" stroke="#C0604A" strokeWidth="2" fill="none" strokeLinecap="round" />

      {/* Ears */}
      <ellipse cx="38" cy="49" rx="4" ry="5" fill="#F5C6A0" />
      <ellipse cx="82" cy="49" rx="4" ry="5" fill="#F5C6A0" />

      {/* Arms */}
      <ellipse cx="36" cy="82" rx="7" ry="13" fill="#F5C6A0" transform="rotate(10 36 82)" />
      <ellipse cx="84" cy="82" rx="7" ry="13" fill="#F5C6A0" transform="rotate(-10 84 82)" />

      {/* Surfboard under arm */}
      <ellipse cx="25" cy="92" rx="4" ry="20" fill="#38bcee" transform="rotate(25 25 92)" />
      <ellipse cx="25" cy="92" rx="2.5" ry="16" fill="#7dd4f5" opacity="0.6" transform="rotate(25 25 92)" />

      {/* Tan lines hint */}
      <path d="M46 74 Q60 70 74 74" stroke="#E8967A" strokeWidth="1" fill="none" opacity="0.3" />
    </svg>
  )
}
