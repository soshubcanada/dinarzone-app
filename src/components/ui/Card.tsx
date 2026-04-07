type CardVariant = "default" | "elevated" | "dark" | "outline" | "glass";

interface CardProps {
  children: React.ReactNode;
  glass?: boolean;
  variant?: CardVariant;
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
  interactive?: boolean;
  className?: string;
  onClick?: () => void;
}

const paddingClasses = {
  none: "",
  sm: "p-3",
  md: "p-4 sm:p-5",
  lg: "p-6 sm:p-8",
};

const variantClasses: Record<CardVariant, string> = {
  default: "bg-white card-elevated border-transparent",
  elevated: "bg-white card-elevated border-transparent",
  dark: "bg-dz-dark-card text-white border-transparent",
  outline: "bg-white border border-dz-border/40",
  glass: "glass-premium",
};

export default function Card({
  children,
  glass = false,
  variant,
  padding = "md",
  hover = false,
  interactive = false,
  className = "",
  onClick,
}: CardProps) {
  // Determine variant: glass prop for backward compat, or explicit variant
  const resolvedVariant: CardVariant = glass ? "glass" : variant || "default";

  return (
    <div
      onClick={onClick}
      className={`
        rounded-2xl
        ${variantClasses[resolvedVariant]}
        ${paddingClasses[padding]}
        ${
          hover
            ? "transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
            : ""
        }
        ${interactive || onClick ? "card-press cursor-pointer" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
