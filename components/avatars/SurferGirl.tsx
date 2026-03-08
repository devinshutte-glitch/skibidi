export default function SurferGirl({ size = 120, className = '' }: { size?: number; className?: string }) {
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
      <circle cx="60" cy="60" r="58" fill="#FF6B4D" opacity="0.15" />

      {/* Body */}
      <ellipse cx="60" cy="85" rx="22" ry="18" fill="#FF8C69" />

      {/* Swimsuit */}
      <ellipse cx="60" cy="85" rx="16" ry="14" fill="#FF4A2A" />

      {/* Head */}
      <circle cx="60" cy="48" r="22" fill="#FDBCB4" />

      {/* Hair */}
      <ellipse cx="60" cy="38" rx="22" ry="14" fill="#8B4513" />
      <ellipse cx="40" cy="52" rx="6" ry="14" fill="#8B4513" />
      <ellipse cx="80" cy="52" rx="6" ry="14" fill="#8B4513" />

      {/* Tropical flowers in hair */}
      <circle cx="45" cy="34" r="5" fill="#FFD700" />
      <circle cx="42" cy="31" r="3" fill="#FF6B4D" />
      <circle cx="48" cy="31" r="3" fill="#FF6B4D" />
      <circle cx="48" cy="37" r="3" fill="#FF6B4D" />
      <circle cx="42" cy="37" r="3" fill="#FF6B4D" />

      {/* Eyes */}
      <circle cx="52" cy="47" r="4" fill="white" />
      <circle cx="68" cy="47" r="4" fill="white" />
      <circle cx="53" cy="48" r="2.5" fill="#4A3728" />
      <circle cx="69" cy="48" r="2.5" fill="#4A3728" />
      <circle cx="54" cy="47" r="1" fill="white" />
      <circle cx="70" cy="47" r="1" fill="white" />

      {/* Smile */}
      <path d="M53 56 Q60 62 67 56" stroke="#C0604A" strokeWidth="2" fill="none" strokeLinecap="round" />

      {/* Freckles */}
      <circle cx="49" cy="53" r="1.5" fill="#E8967A" opacity="0.6" />
      <circle cx="45" cy="55" r="1" fill="#E8967A" opacity="0.6" />
      <circle cx="71" cy="53" r="1.5" fill="#E8967A" opacity="0.6" />
      <circle cx="75" cy="55" r="1" fill="#E8967A" opacity="0.6" />

      {/* Arms */}
      <ellipse cx="36" cy="82" rx="7" ry="14" fill="#FDBCB4" transform="rotate(15 36 82)" />
      <ellipse cx="84" cy="82" rx="7" ry="14" fill="#FDBCB4" transform="rotate(-15 84 82)" />

      {/* Surfboard */}
      <ellipse cx="95" cy="88" rx="5" ry="22" fill="#FF4A2A" transform="rotate(-20 95 88)" />
      <ellipse cx="95" cy="88" rx="3" ry="18" fill="#FF8C69" opacity="0.6" transform="rotate(-20 95 88)" />
    </svg>
  )
}
