"use client";

export function AuthPatternBackground() {
  return (
    <div className="fixed inset-0 -z-20 overflow-hidden">

      {/* BASE BACKDROP — very Apple grey */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-[#f8f9fb] to-[#eef1f4]" />

      {/* FLOATING ABSTRACT MOTION SHAPES */}
      <div className="absolute inset-0 pointer-events-none">

        {/* soft grey orb left */}
        <div className="absolute top-[5%] left-[12%] w-[520px] h-[520px] 
                        bg-[#dfe4ea]/55 rounded-full blur-[160px]" />

        {/* right dim orb */}
        <div className="absolute bottom-[5%] right-[15%] w-[450px] h-[450px]
                        bg-[#d6dae2]/45 rounded-full blur-[160px]" />

        {/* hint of blue like iCloud login */}
        <div className="absolute top-[35%] left-1/2 -translate-x-1/2 
                        w-[520px] h-[520px] bg-primary/10 rounded-full blur-[170px]" />
      </div>


      {/* APPLE ABSTRACT GLYPH WAVE (super subtle, elegant) */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.14]"
        preserveAspectRatio="none"
        viewBox="0 0 1200 800"
      >
        <defs>
          <linearGradient id="authLine" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(80,110,140,0.45)" />
            <stop offset="100%" stopColor="rgba(110,140,170,0.25)" />
          </linearGradient>

          <radialGradient id="bigGlow" cx="50%" cy="50%">
            <stop offset="0%" stopColor="rgba(120,160,200,0.25)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>

        {/* flowing macOS-style curves */}
        <path d="M0 350 Q300 200 600 330 T1200 370" stroke="url(#authLine)" strokeWidth="1.6" fill="none"/>
        <path d="M0 240 Q340 480 620 210 T1200 330" stroke="url(#authLine)" strokeWidth="1.2" fill="none" opacity=".65"/>
        <path d="M0 520 Q360 370 820 580 T1200 460" stroke="url(#authLine)" strokeWidth="1.4" fill="none" opacity=".55"/>

        {/* ultra faint dotted clusters — like iOS wallpaper */}
        <g fill="rgba(120,150,180,0.25)">
          <circle cx="160" cy="110" r="1.8" />
          <circle cx="180" cy="122" r="1.4" />
          <circle cx="148" cy="128" r="1.4" />

          <circle cx="1020" cy="640" r="2" />
          <circle cx="998" cy="658" r="1.5" />
          <circle cx="1040" cy="665" r="1.5" />

          <circle cx="610" cy="95" r="1.7" />
          <circle cx="640" cy="112" r="1.4" />
        </g>

        {/* subtle volumetric depth */}
        <circle cx="200" cy="200" r="230" fill="url(#bigGlow)" opacity="0.20" />
        <circle cx="980" cy="580" r="260" fill="url(#bigGlow)" opacity="0.18" />
      </svg>
    </div>
  );
}
