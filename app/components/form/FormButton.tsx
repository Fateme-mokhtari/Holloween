import { ButtonHTMLAttributes, ReactNode } from "react";

interface FormButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  isLoading?: boolean;
  variant?: "primary" | "secondary";
}

export default function FormButton({
  children,
  isLoading = false,
  variant = "primary",
  disabled,
  className,
  ...props
}: FormButtonProps) {
  const variantClasses =
    variant === "secondary"
      ? "border border-purple-500/70 bg-gray-800 text-purple-100 hover:bg-gray-700"
      : "bg-gradient-to-r from-purple-700 to-purple-900 text-white hover:bg-purple-700";

  return (
    <button
      type="submit"
      disabled={disabled || isLoading}
      className={`w-full cursor-pointer rounded-lg px-4 py-3 font-creepster text-xl uppercase tracking-wide transition-colors duration-200 disabled:cursor-not-allowed disabled:bg-purple-900 ${variantClasses} ${
        className || ""
      }`}
      {...props}
    >
      {isLoading ? "Loading..." : children}
    </button>
  );
}
