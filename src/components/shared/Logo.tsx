"use client";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: { icon: 24, text: "text-lg" },
  md: { icon: 32, text: "text-xl" },
  lg: { icon: 40, text: "text-2xl" },
};

export function Logo({ className = "", showText = true, size = "md" }: LogoProps) {
  const { icon, text } = sizeMap[size];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="40" height="40" rx="8" fill="#0D7377" />
        <path
          d="M10 28L16 12L22 22L28 16L30 20"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="16" cy="12" r="2" fill="white" />
        <circle cx="22" cy="22" r="2" fill="white" />
        <circle cx="28" cy="16" r="2" fill="white" />
        <path
          d="M12 30H28"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="2 2"
        />
      </svg>
      {showText && (
        <span className={`font-heading font-bold ${text}`} style={{ fontFamily: "var(--font-heading-custom)" }}>
          <span className="text-[#0D7377]">ClinicalTrials</span>
          <span className="text-[#1B2A4A]">.Tools</span>
        </span>
      )}
    </div>
  );
}
