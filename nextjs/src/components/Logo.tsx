import React from "react";

interface LogoProps {
  size?: "sm" | "md";
  showGlow?: boolean;
  className?: string;
}

export default function Logo({ size = "sm", showGlow = true, className = "" }: LogoProps) {
  const isSm = size === "sm";
  const containerSizeClass = isSm ? "w-8 h-8 rounded-[9px]" : "w-9 h-9 rounded-[11px]";
  const svgSize = isSm ? "18px" : "22px";
  const glowShadow = showGlow
    ? isSm
      ? "0 0 12px rgba(14,165,233,0.35)"
      : "0 0 16px rgba(14,165,233,0.4)"
    : "none";

  return (
    <div
      className={`bg-[#0EA5E9] flex items-center justify-center text-white shrink-0 ${containerSizeClass} ${className}`}
      style={{ boxShadow: glowShadow }}
    >
      <svg
        viewBox="0 0 100 100"
        style={{ width: svgSize, height: svgSize }}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="37.5" y="12.5" width="25" height="75" rx="12.5" fill="white" />
        <rect x="12.5" y="37.5" width="75" height="25" rx="12.5" fill="white" />
      </svg>
    </div>
  );
}
