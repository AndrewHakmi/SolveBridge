export function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Логотип Проектория"
    >
      <defs>
        <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#A5B8FF" stopOpacity="1" />
          <stop offset="100%" stopColor="#6C8CFF" stopOpacity="0.7" />
        </radialGradient>
        <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
          <stop offset="60%" stopColor="#A5B8FF" stopOpacity="1" />
          <stop offset="100%" stopColor="#6C8CFF" stopOpacity="0.8" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="0.8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Hexagon outline */}
      <path
        d="M16 2.5 L27.5 9.25 L27.5 22.75 L16 29.5 L4.5 22.75 L4.5 9.25 Z"
        fill="#6C8CFF"
        fillOpacity="0.08"
        stroke="#6C8CFF"
        strokeWidth="1"
        strokeOpacity="0.35"
      />

      {/* Connection lines from center to outer nodes */}
      <line x1="16" y1="16" x2="16" y2="6.5"   stroke="#6C8CFF" strokeWidth="1" strokeOpacity="0.45" />
      <line x1="16" y1="16" x2="23.5" y2="10.5" stroke="#6C8CFF" strokeWidth="1" strokeOpacity="0.45" />
      <line x1="16" y1="16" x2="23.5" y2="21.5" stroke="#6C8CFF" strokeWidth="1" strokeOpacity="0.45" />
      <line x1="16" y1="16" x2="16" y2="25.5"   stroke="#6C8CFF" strokeWidth="1" strokeOpacity="0.45" />
      <line x1="16" y1="16" x2="8.5"  y2="21.5" stroke="#6C8CFF" strokeWidth="1" strokeOpacity="0.45" />
      <line x1="16" y1="16" x2="8.5"  y2="10.5" stroke="#6C8CFF" strokeWidth="1" strokeOpacity="0.45" />

      {/* Trajectory arc — career path (bottom-left → center → top-right) */}
      <path
        d="M8.5 21.5 Q16 14 23.5 10.5"
        stroke="#A5B8FF"
        strokeWidth="1.5"
        strokeOpacity="0.6"
        fill="none"
        strokeLinecap="round"
      />

      {/* Outer nodes */}
      <circle cx="16"  cy="6.5"  r="1.8" fill="url(#nodeGlow)" filter="url(#glow)" />
      <circle cx="23.5" cy="10.5" r="1.8" fill="url(#nodeGlow)" filter="url(#glow)" />
      <circle cx="23.5" cy="21.5" r="1.8" fill="url(#nodeGlow)" filter="url(#glow)" />
      <circle cx="16"  cy="25.5" r="1.8" fill="url(#nodeGlow)" filter="url(#glow)" />
      <circle cx="8.5" cy="21.5" r="1.8" fill="url(#nodeGlow)" filter="url(#glow)" />
      <circle cx="8.5" cy="10.5" r="1.8" fill="url(#nodeGlow)" filter="url(#glow)" />

      {/* Center hub node */}
      <circle cx="16" cy="16" r="3.2" fill="url(#centerGlow)" filter="url(#glow)" />
      <circle cx="16" cy="16" r="1.6" fill="#FFFFFF" fillOpacity="0.9" />
    </svg>
  )
}
