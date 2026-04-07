interface StepperProps {
  steps: string[];
  currentStep: number;
  className?: string;
}

export default function Stepper({
  steps,
  currentStep,
  className = "",
}: StepperProps) {
  return (
    <div className={`w-full ${className}`}>
      {/* Step indicators */}
      <div className="flex items-center justify-between">
        {steps.map((label, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isActive = stepNumber === currentStep;

          return (
            <div key={label} className="flex-1 flex flex-col items-center relative">
              {/* Connector line */}
              {index > 0 && (
                <div
                  className={`absolute top-4 -left-1/2 w-full h-0.5 -translate-y-1/2 ${
                    isCompleted || isActive
                      ? "bg-dz-green"
                      : "bg-dz-border"
                  }`}
                />
              )}

              {/* Circle */}
              <div
                className={`
                  relative z-10 flex items-center justify-center
                  w-8 h-8 rounded-full text-sm font-bold
                  transition-all duration-300
                  ${
                    isCompleted
                      ? "bg-dz-green text-white"
                      : isActive
                      ? "bg-dz-gold text-white ring-4 ring-dz-gold/20"
                      : "bg-dz-cream border-2 border-dz-border text-dz-text-muted"
                  }
                `}
              >
                {isCompleted ? (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  stepNumber
                )}
              </div>

              {/* Label */}
              <span
                className={`
                  mt-1.5 text-[10px] sm:text-xs text-center leading-tight
                  ${
                    isActive
                      ? "text-dz-gold font-semibold"
                      : isCompleted
                      ? "text-dz-green font-medium"
                      : "text-dz-text-muted"
                  }
                `}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
