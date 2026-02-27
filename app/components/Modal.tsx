"use client";

import React from "react";

interface ModalProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
}

export default function Modal({ children, isOpen, onClose }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-[6000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border-2 border-purple-600 rounded-2xl w-full max-w-md p-6 shadow-[0_0_50px_rgba(147,51,234,0.3)] relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-orange-600/20 rounded-full blur-3xl"></div>
    
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
            aria-label="Close modal"
          >
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Modal Content */}
          <div className="mt-2">{children}</div>
 
      </div>
    </div>
  );
}
