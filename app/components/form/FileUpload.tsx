'use client';

import React, { useRef } from 'react';
import { FieldError } from 'react-hook-form';

interface FileUploadProps {
  register?: any;
  error?: FieldError;
  label?: string;
  icon?: React.ReactNode;
  accept?: string;
  name?: string;
}

export default function FileUpload({
  register,
  error,
  label = 'Upload File',
  icon = '📎',
  accept,
  name,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = React.useState<string>('');

  const handleClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
    }
  };

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        type="file"
        name={name}
        onChange={handleFileChange}
        accept={accept}
        multiple
        className="hidden"
        {...(register || {})}
      />
      <button
        type="button"
        onClick={handleClick}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 uppercase tracking-wide flex items-center justify-center gap-2"
      >
        <span>{icon}</span>
        <span>{fileName || label}</span>
      </button>
      {error && (
        <p className="text-red-500 text-sm mt-1">{error.message}</p>
      )}
    </div>
  );
}
