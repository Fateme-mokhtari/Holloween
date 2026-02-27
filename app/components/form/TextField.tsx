import React from 'react';
import { UseFormRegisterReturn, FieldError } from 'react-hook-form';

interface TextFieldProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  register?: UseFormRegisterReturn;
  error?: FieldError;
  label?: string;
}

export default function TextField({
  register,
  error,
  label,
  className,
  ...props
}: TextFieldProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-purple-300 text-sm font-bold mb-1">
          {label}
        </label>
      )}
      <input
        {...(register || {})}
        {...props}
        className={`w-full bg-black/50 border border-purple-800 rounded-lg p-3 text-white focus:outline-none focus:border-orange-500 transition-colors ${
          error ? 'border-red-500' : ''
        } ${className || ''}`}
      />
      {error && (
        <p className="text-red-500 text-sm mt-1">{error.message}</p>
      )}
    </div>
  );
}
