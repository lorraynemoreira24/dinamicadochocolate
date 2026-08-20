import React from "react";

interface NiboLogoProps {
  className?: string;
  variant?: "white" | "colored" | "chocolate";
  withText?: boolean;
}

export const NiboLogo: React.FC<NiboLogoProps> = ({
  className = "h-8",
  variant = "white",
  withText = true,
}) => {
  const markColor =
    variant === "white"
      ? "#ffffff"
      : variant === "chocolate"
      ? "#542a0c"
      : "#003b8e";

  const textColor =
    variant === "white"
      ? "#ffffff"
      : variant === "chocolate"
      ? "#381c08"
      : "#003b8e";

  if (!withText) {
    return (
      <svg
        viewBox="0 0 100 100"
        className={`aspect-square fill-current ${className}`}
        style={{ color: markColor }}
        aria-label="Nibo Logo"
      >
        {/* Bottom Left Dot */}
        <circle cx="28" cy="68" r="14" />
        {/* Connected Top-Left to Bottom-Right Node (Pill shape) */}
        <path
          d="M 52,24 
             C 45,24 40,29 40,36 
             C 40,41 42,46 46,50 
             L 60,65 
             C 62,67 64,71 64,76 
             C 64,84 71,91 80,91 
             C 89,91 96,84 96,76 
             C 96,68 90,62 82,62 
             C 78,62 74,64 71,67 
             L 57,51 
             C 54,48 52,43 52,38 
             C 52,30 46,24 52,24 Z"
          fillRule="evenodd"
        />
        <circle cx="48" cy="36" r="14" />
        <circle cx="80" cy="74" r="14" />
        {/* Organic bridge connecting the top node and right node */}
        <path
          d="M 46,45 C 50,55 60,62 70,68 C 65,58 55,51 46,45 Z"
        />
      </svg>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Nibo Iconic 3 Connected Spheres Symbol */}
      <svg
        viewBox="0 0 100 100"
        className="h-full aspect-square shrink-0 fill-current"
        style={{ color: markColor }}
        aria-label="Nibo Logo"
      >
        {/* Bottom Left Dot */}
        <circle cx="28" cy="68" r="14" />
        {/* Connected Top-Left to Bottom-Right Node (Pill shape) */}
        <path
          d="M 52,24 
             C 45,24 40,29 40,36 
             C 40,41 42,46 46,50 
             L 60,65 
             C 62,67 64,71 64,76 
             C 64,84 71,91 80,91 
             C 89,91 96,84 96,76 
             C 96,68 90,62 82,62 
             C 78,62 74,64 71,67 
             L 57,51 
             C 54,48 52,43 52,38 
             C 52,30 46,24 52,24 Z"
          fillRule="evenodd"
        />
        <circle cx="48" cy="36" r="14" />
        <circle cx="80" cy="74" r="14" />
        {/* Organic bridge connecting the top node and right node */}
        <path
          d="M 46,45 C 50,55 60,62 70,68 C 65,58 55,51 46,45 Z"
        />
      </svg>

      {/* Typography: nibo */}
      <span
        className="font-black text-2xl tracking-tighter leading-none select-none font-sans"
        style={{ color: textColor }}
      >
        nibo
      </span>
    </div>
  );
};
