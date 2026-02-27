import React from 'react';

interface FormProps
  extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export default function Form({
  children,
  onSubmit,
  className,
  ...props
}: FormProps) {
  return (
    <form
      onSubmit={onSubmit}
      className={`w-full space-y-4 ${className || ''}`}
      {...props}
    >
      {children}
    </form>
  );
}
