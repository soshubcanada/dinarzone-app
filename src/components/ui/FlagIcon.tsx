const FLAG_MAP: Record<string, string> = {
  CA: "\u{1F1E8}\u{1F1E6}", // Canada
  DZ: "\u{1F1E9}\u{1F1FF}", // Algeria
  TN: "\u{1F1F9}\u{1F1F3}", // Tunisia
  QA: "\u{1F1F6}\u{1F1E6}", // Qatar
  AE: "\u{1F1E6}\u{1F1EA}", // UAE
  FR: "\u{1F1EB}\u{1F1F7}", // France
  MA: "\u{1F1F2}\u{1F1E6}", // Morocco
  US: "\u{1F1FA}\u{1F1F8}", // USA
  GB: "\u{1F1EC}\u{1F1E7}", // UK
};

interface FlagIconProps {
  countryCode: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-4xl",
};

export default function FlagIcon({
  countryCode,
  size = "md",
  className = "",
}: FlagIconProps) {
  const flag = FLAG_MAP[countryCode.toUpperCase()] || "\u{1F3F3}\u{FE0F}";

  return (
    <span className={`${sizeClasses[size]} leading-none ${className}`} role="img" aria-label={countryCode}>
      {flag}
    </span>
  );
}
