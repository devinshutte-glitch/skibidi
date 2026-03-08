export default function DadIcon({ size = 80, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="40" cy="40" r="38" fill="#2d7a3c" opacity="0.15" />
      <circle cx="40" cy="32" r="16" fill="#F5C6A0" />
      {/* Hat */}
      <ellipse cx="40" cy="24" rx="17" ry="6" fill="#2d7a3c" />
      <rect x="24" y="19" width="32" height="8" rx="2" fill="#2d7a3c" />
      {/* Eyes */}
      <circle cx="35" cy="31" r="3" fill="white" />
      <circle cx="45" cy="31" r="3" fill="white" />
      <circle cx="35.5" cy="31.5" r="1.8" fill="#4A3728" />
      <circle cx="45.5" cy="31.5" r="1.8" fill="#4A3728" />
      {/* Beard */}
      <path d="M30 38 Q40 45 50 38 L52 42 Q40 52 28 42 Z" fill="#6B4C2A" opacity="0.7" />
      {/* Smile */}
      <path d="M35 38 Q40 42 45 38" stroke="#8B4513" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* Body */}
      <ellipse cx="40" cy="60" rx="16" ry="12" fill="#2d7a3c" />
    </svg>
  )
}
