"use client";

export function AuthPatternBackground() {
  return (
    <div className="fixed inset-0 -z-20 overflow-hidden">
      <div className="absolute inset-0 bg-[var(--ds-background-100)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,var(--ds-gray-200),transparent_35%),radial-gradient(circle_at_bottom_right,var(--ds-gray-200),transparent_32%),linear-gradient(180deg,var(--ds-background-100),var(--ds-gray-100))]" />

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[12%] top-[6%] h-[31.25rem] w-[31.25rem] rounded-full bg-[var(--ds-gray-alpha-200)] blur-[9.375rem]" />
        <div className="absolute bottom-[6%] right-[14%] h-[26.25rem] w-[26.25rem] rounded-full bg-[var(--ds-gray-alpha-200)] blur-[9.375rem]" />
        <div className="absolute left-1/2 top-[34%] h-[31.25rem] w-[31.25rem] -translate-x-1/2 rounded-full bg-[var(--ds-blue-100)]/60 blur-[10.625rem]" />
      </div>

      <svg
        className="absolute inset-0 h-full w-full opacity-[0.12]"
        preserveAspectRatio="none"
        viewBox="0 0 1200 800"
      >
        <defs>
          <linearGradient id="authLine" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(82, 82, 91, 0.28)" />
            <stop offset="100%" stopColor="rgba(24, 24, 27, 0.08)" />
          </linearGradient>

          <radialGradient id="bigGlow" cx="50%" cy="50%">
            <stop offset="0%" stopColor="rgba(0, 112, 243, 0.16)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>

        <path d="M0 350 Q300 200 600 330 T1200 370" fill="none" stroke="url(#authLine)" strokeWidth="1.4" />
        <path d="M0 240 Q340 480 620 210 T1200 330" fill="none" opacity=".65" stroke="url(#authLine)" strokeWidth="1.15" />
        <path d="M0 520 Q360 370 820 580 T1200 460" fill="none" opacity=".55" stroke="url(#authLine)" strokeWidth="1.25" />

        <g fill="rgba(82, 82, 91, 0.18)">
          <circle cx="160" cy="110" r="1.8" />
          <circle cx="180" cy="122" r="1.4" />
          <circle cx="148" cy="128" r="1.4" />

          <circle cx="1020" cy="640" r="2" />
          <circle cx="998" cy="658" r="1.5" />
          <circle cx="1040" cy="665" r="1.5" />

          <circle cx="610" cy="95" r="1.7" />
          <circle cx="640" cy="112" r="1.4" />
        </g>

        <circle cx="200" cy="200" r="230" fill="url(#bigGlow)" opacity="0.20" />
        <circle cx="980" cy="580" r="260" fill="url(#bigGlow)" opacity="0.18" />
      </svg>
    </div>
  );
}
