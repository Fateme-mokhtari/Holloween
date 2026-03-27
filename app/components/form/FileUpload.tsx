"use client";

import React, { useRef, useState } from "react";

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
  label = "Upload File",
  icon = "📎",
  error,
  onFileChange,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setFileName(
        files.length === 1 ? files[0].name : `${files.length} files selected`,
      );
    } else {
      setFileName("");
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
        className={`flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-3 font-bold uppercase tracking-wide transition-colors cursor-pointer duration-200 ${
          fileName
            ? "border-orange-500/70 bg-orange-900/30 text-orange-200 hover:bg-orange-900/40"
            : "border-purple-500/70 bg-gray-800 text-purple-100 hover:bg-gray-700"
        }`}
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
