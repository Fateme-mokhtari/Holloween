import React from "react";

interface MapButtonProps {
  text: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export default function MapButton({
  text,
  icon,
  onClick,
  className,
}: MapButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-full font-semibold transition-colors duration-200 shadow-lg cursor-pointer ${className || ""}`}
    >
      {icon && <span className="text-lg">{icon}</span>}
      <span>{text}</span>
    </button>
  );
}
