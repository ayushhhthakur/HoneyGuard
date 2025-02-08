export const logo = [
  '300 50',
  `<g>
    <defs>
      <!-- Cyber gradient -->
      <linearGradient id="cyberGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#80d0ff;stop-opacity:0.3"/>
        <stop offset="100%" style="stop-color:#020c1b;stop-opacity:0.9"/>
      </linearGradient>
      <!-- Glow effect -->
      <filter id="cyberGlow">
        <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>

    <!-- Cyber Shield Base -->
    <path d="M35 5 
             L15 5 
             L15 25 
             L25 35
             L35 25 
             Z" 
          style="fill:url(#cyberGradient); stroke:#80d0ff; stroke-width:1.5"/>

    <!-- Digital Circuit Pattern -->
    <g style="stroke:#80d0ff; stroke-width:0.8; opacity:0.6">
      <path d="M25 10 L25 15 M22 12 L28 12" />
      <path d="M20 15 L30 15" />
      <path d="M18 20 L32 20" />
      <path d="M20 25 L30 25" />
    </g>

    <!-- Hexagon Security Grid -->
    <path d="M25 15 L21 17 L21 21 L25 23 L29 21 L29 17 Z" 
          style="fill:none; stroke:#80d0ff; stroke-width:1; opacity:0.8"/>

    <!-- Center Monitoring Point -->
    <circle cx="25" cy="19" r="1.5" 
            style="fill:#80d0ff; filter:url(#cyberGlow)"/>

    <!-- Text Section -->
    <g style="fill:#80d0ff">
      <!-- Company Name -->
      <text x="45" y="23" 
            style="font-family: 'Segoe UI', system-ui, sans-serif; font-size: 18px; font-weight: 600; letter-spacing: 1px">
        HONEYGUARD
      </text>
      <!-- Tagline -->
      <text x="45" y="32" 
            style="font-family: 'Segoe UI', system-ui, sans-serif; font-size: 8px; font-weight: 400; letter-spacing: 3px; opacity: 0.7">
        THREAT DETECTION
      </text>
    </g>
  </g>`
]
