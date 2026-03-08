'use client'

export default function OceanBackground({ children, className = '' }: {
  children?: React.ReactNode
  className?: string
}) {
  return (
    <div className={`min-h-dvh relative overflow-hidden ${className}`}
      style={{ background: 'linear-gradient(180deg, #38bcee 0%, #0ea3dc 40%, #0283ba 80%, #036996 100%)' }}
    >
      {/* Animated waves */}
      <div className="absolute bottom-0 left-0 right-0 z-0">
        <svg viewBox="0 0 1440 200" className="w-full" preserveAspectRatio="none" style={{ height: '120px' }}>
          <path
            d="M0,100 C240,40 480,160 720,100 C960,40 1200,160 1440,100 L1440,200 L0,200 Z"
            fill="#faf2ca"
            opacity="0.6"
          />
          <path
            d="M0,130 C360,70 720,190 1080,130 C1260,100 1380,150 1440,130 L1440,200 L0,200 Z"
            fill="#faf2ca"
            opacity="0.8"
          />
          <path
            d="M0,160 C480,120 960,180 1440,160 L1440,200 L0,200 Z"
            fill="#f5e599"
          />
        </svg>
      </div>

      {/* Palm tree decorations */}
      <div className="absolute top-0 left-0 opacity-20 pointer-events-none">
        <svg width="80" height="140" viewBox="0 0 80 140">
          <rect x="36" y="60" width="8" height="80" rx="4" fill="#2d7a3c" />
          <ellipse cx="20" cy="50" rx="28" ry="12" fill="#2d7a3c" transform="rotate(-20 20 50)" />
          <ellipse cx="60" cy="45" rx="28" ry="12" fill="#246330" transform="rotate(20 60 45)" />
          <ellipse cx="40" cy="35" rx="22" ry="10" fill="#2d7a3c" transform="rotate(-5 40 35)" />
        </svg>
      </div>
      <div className="absolute top-0 right-0 opacity-20 pointer-events-none" style={{ transform: 'scaleX(-1)' }}>
        <svg width="80" height="140" viewBox="0 0 80 140">
          <rect x="36" y="60" width="8" height="80" rx="4" fill="#2d7a3c" />
          <ellipse cx="20" cy="50" rx="28" ry="12" fill="#2d7a3c" transform="rotate(-20 20 50)" />
          <ellipse cx="60" cy="45" rx="28" ry="12" fill="#246330" transform="rotate(20 60 45)" />
          <ellipse cx="40" cy="35" rx="22" ry="10" fill="#2d7a3c" transform="rotate(-5 40 35)" />
        </svg>
      </div>

      {/* Floating bubbles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white opacity-10 animate-float"
            style={{
              width: `${20 + i * 15}px`,
              height: `${20 + i * 15}px`,
              left: `${10 + i * 15}%`,
              top: `${20 + i * 10}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + i * 0.5}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10">{children}</div>
    </div>
  )
}
