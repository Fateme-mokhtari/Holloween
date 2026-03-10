'use client';

import React, { useRef, useState } from 'react';

interface FileUploadProps {
  accept?: string;
  multiple?: boolean;
  label?: string;
  icon?: React.ReactNode;
  error?: { message?: string };
  onFileChange?: (files: FileList | null) => void;
}

export default function FileUpload({
  accept,
  multiple = true,
  label = 'Upload File',
  icon = '📎',
  error,
  onFileChange,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState('');

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setFileName(
        files.length === 1 ? files[0].name : `${files.length} files selected`
      );
    } else {
      setFileName('');
    }
    onFileChange?.(files);
  };

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={handleChange}
      />
      <button
        type="button"
        onClick={handleClick}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 uppercase tracking-wide flex items-center justify-center gap-2"
      >
        <span>{icon}</span>
        <span>{fileName || label}</span>
      </button>
      {error?.message && (
        <p className="text-red-500 text-sm mt-1">{error.message}</p>
      )}
    </div>
  );
}

