type BadgeColor = "green" | "gold" | "red" | "gray";

interface BadgeProps {
  color?: BadgeColor;
  children: React.ReactNode;
  className?: string;
}

const colorClasses: Record<BadgeColor, string> = {
  green: "bg-dz-success/10 text-dz-success border-dz-success/20",
  gold: "bg-dz-gold/10 text-dz-gold border-dz-gold/20",
  red: "bg-dz-red/10 text-dz-red border-dz-red/20",
  gray: "bg-dz-text-muted/10 text-dz-text-muted border-dz-text-muted/20",
};

export default function Badge({
  color = "gray",
  children,
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1 px-2.5 py-0.5
        text-xs font-semibold rounded-full border
        ${colorClasses[color]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
