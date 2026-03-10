import type { FormHTMLAttributes, ReactNode } from "react";


interface FormProps
  extends FormHTMLAttributes<HTMLFormElement> {
  children: ReactNode;
  onSubmit: NonNullable<FormHTMLAttributes<HTMLFormElement>["onSubmit"]>;
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
