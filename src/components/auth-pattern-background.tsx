"use client";

export function AuthPatternBackground() {
  return (
    <div className="fixed inset-0 -z-20 overflow-hidden">
      {/* Base gradient orbs */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-500 to-blue-700 opacity-5"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-cyan-400/5 rounded-full blur-3xl"></div>

      {/* Abstract SVG pattern */}
      <svg className="absolute inset-0 w-full h-full opacity-40" preserveAspectRatio="xMidYMid slice" viewBox="0 0 1200 800">
        <defs>
          {/* Sophisticated mesh gradient */}
          <linearGradient id="authGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="35%" stopColor="#7c3aed" />
            <stop offset="70%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
          
          {/* Subtle radial gradient for depth */}
          <radialGradient id="authDepthGlow" cx="40%" cy="40%">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#1e40af" stopOpacity="0" />
          </radialGradient>

          {/* Smooth line gradient */}
          <linearGradient id="authLineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
        </defs>

        {/* Base gradient fill */}
        <rect width="1200" height="800" fill="url(#authGradient)" opacity="0.08" />
        
        {/* Geometric shapes - large flowing curves */}
        <path d="M0,400 Q300,200 600,350 T1200,400" stroke="url(#authLineGradient)" strokeWidth="2" fill="none" opacity="0.2" />
        <path d="M0,250 Q300,500 600,200 T1200,350" stroke="url(#authLineGradient)" strokeWidth="1.5" fill="none" opacity="0.12" />
        <path d="M0,550 Q400,400 800,600 T1200,500" stroke="url(#authLineGradient)" strokeWidth="2" fill="none" opacity="0.15" />
        
        {/* Subtle hexagons/geometric elements */}
        <g opacity="0.06" stroke="url(#authLineGradient)" fill="none" strokeWidth="1">
          <polygon points="200,150 250,125 300,150 300,200 250,225 200,200" />
          <polygon points="900,600 950,575 1000,600 1000,650 950,675 900,650" />
          <polygon points="400,700 430,685 460,700 460,730 430,745 400,730" />
        </g>

        {/* Elegant dot clusters */}
        <g fill="url(#authLineGradient)" opacity="0.12">
          <circle cx="150" cy="100" r="3" />
          <circle cx="170" cy="110" r="2" />
          <circle cx="140" cy="120" r="2" />
          
          <circle cx="1000" cy="650" r="3" />
          <circle cx="1020" cy="660" r="2" />
          <circle cx="985" cy="665" r="2" />
          
          <circle cx="600" cy="80" r="2.5" />
          <circle cx="620" cy="95" r="2" />
        </g>

        {/* Large subtle orbs for depth */}
        <circle cx="200" cy="200" r="200" fill="url(#authDepthGlow)" opacity="0.06" />
        <circle cx="1000" cy="600" r="250" fill="url(#authDepthGlow)" opacity="0.05" />
      </svg>
    </div>
  );
}
