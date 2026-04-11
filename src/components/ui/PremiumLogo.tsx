import React from "react";

interface LogoProps {
  variant?: "icon" | "full";
  className?: string;
  size?: number;
}

export default function PremiumLogo({
  variant = "full",
  className = "",
  size = 48,
}: LogoProps) {
  const Icon = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="drop-shadow-[0_8px_16px_rgba(0,0,0,0.4)]"
    >
      <defs>
        <linearGradient
          id="emeraldMatte"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#004D26" />
          <stop offset="100%" stopColor="#070B14" />
        </linearGradient>

        <linearGradient
          id="brushedGold"
          x1="0%"
          y1="100%"
          x2="100%"
          y2="0%"
        >
          <stop offset="0%" stopColor="#9A7A31" />
          <stop offset="50%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#B8923B" />
        </linearGradient>

        <filter id="innerShadow">
          <feOffset dy="2" dx="-2" />
          <feGaussianBlur stdDeviation="2" result="offset-blur" />
          <feComposite
            operator="out"
            in="SourceGraphic"
            in2="offset-blur"
            result="inverse"
          />
          <feFlood floodColor="black" floodOpacity="0.5" result="color" />
          <feComposite
            operator="in"
            in="color"
            in2="inverse"
            result="shadow"
          />
          <feComposite operator="over" in="shadow" in2="SourceGraphic" />
        </filter>
      </defs>

      {/* Squircle background */}
      <rect width="120" height="120" rx="28" fill="url(#emeraldMatte)" />

      {/* Gold ring */}
      <circle
        cx="60"
        cy="60"
        r="42"
        stroke="url(#brushedGold)"
        strokeWidth="2"
        opacity="0.3"
      />

      {/* Geometric D with integrated arrow */}
      <g filter="url(#innerShadow)">
        {/* D stem */}
        <rect
          x="42"
          y="36"
          width="12"
          height="48"
          rx="2"
          fill="url(#brushedGold)"
        />

        {/* D curve */}
        <path
          d="M 54 36 C 80 36 92 48 92 60 C 92 72 80 84 54 84 L 54 72 C 70 72 78 66 78 60 C 78 54 70 48 54 48 Z"
          fill="url(#brushedGold)"
        />

        {/* Upward arrow cutout */}
        <path
          d="M 64 68 L 64 54 L 58 54 L 68 42 L 78 54 L 72 54 L 72 68 Z"
          fill="#070B14"
        />
      </g>
    </svg>
  );

  if (variant === "icon") {
    return <div className={className}>{Icon}</div>;
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {Icon}
      <div className="flex flex-col">
        <span
          className="font-sans font-black tracking-[0.15em] text-white leading-none"
          style={{ fontSize: size * 0.45 }}
        >
          DINARZONE
        </span>
        <span
          className="font-sans font-bold tracking-widest text-[#00A84D] uppercase mt-1 opacity-80"
          style={{ fontSize: size * 0.16 }}
        >
          Remittance
        </span>
      </div>
    </div>
  );
}
