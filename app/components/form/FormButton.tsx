import React from 'react';

interface FormButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  isLoading?: boolean;
}

export default function FormButton({
  children,
  isLoading = false,
  disabled,
  className,
  ...props
}: FormButtonProps) {
  return (
    <button
      type="submit"
      disabled={disabled || isLoading}
      className={`w-full font-halloween bg-gradient-to-r from-purple-700 to-purple-900 hover:bg-purple-700 disabled:bg-purple-900 disabled:cursor-not-allowed text-white font-lg cursor-pointer
         py-3 px-4 rounded-lg transition-colors duration-200 uppercase tracking-wide ${
        className || ''
      }`}
      {...props}
    >
      {isLoading ? 'Loading...' : children}
    </button>
  );
}
