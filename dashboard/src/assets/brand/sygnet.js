export const sygnet = [
  '50 50',
  `<g>
    <defs>
      <!-- Cyber gradient -->
      <linearGradient id="cyberGradientIcon" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#80d0ff;stop-opacity:0.3"/>
        <stop offset="100%" style="stop-color:#020c1b;stop-opacity:0.9"/>
      </linearGradient>
      <!-- Glow effect -->
      <filter id="cyberGlowIcon">
        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>

    <!-- Cyber Shield Base -->
    <path d="M40 10 
             L10 10 
             L10 35 
             L25 45
             L40 35 
             Z" 
          style="fill:url(#cyberGradientIcon); stroke:#80d0ff; stroke-width:2"/>

    <!-- Digital Circuit Pattern -->
    <g style="stroke:#80d0ff; stroke-width:1; opacity:0.6">
      <path d="M25 15 L25 25 M15 20 L35 20" />
      <path d="M20 25 L30 25" />
      <path d="M17 30 L33 30" />
    </g>

    <!-- Hexagon Security Grid -->
    <path d="M25 22 L19 25 L19 31 L25 34 L31 31 L31 25 Z" 
          style="fill:none; stroke:#80d0ff; stroke-width:1.2; opacity:0.8"/>

    <!-- Center Monitoring Point -->
    <circle cx="25" cy="28" r="2" 
            style="fill:#80d0ff; filter:url(#cyberGlowIcon)"/>

    <!-- Scanning Line -->
    <line x1="15" y1="15" x2="35" y2="15" 
          style="stroke:#80d0ff; stroke-width:0.5; opacity:0.4">
      <animate attributeName="y1" values="15;35;15" dur="3s" repeatCount="indefinite"/>
      <animate attributeName="y2" values="15;35;15" dur="3s" repeatCount="indefinite"/>
    </line>
  </g>`
]
