interface FormLabelProps {
  children: React.ReactNode;
  htmlFor?: string;
}

export default function FormLabel({ children, htmlFor }: FormLabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-purple-300 text-sm font-bold mb-1"
    >
      {children}
    </label>
  );
}
