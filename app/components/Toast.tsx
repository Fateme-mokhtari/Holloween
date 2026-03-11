"use client";

import { toast, ToastContainer, ToastOptions } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const baseOptions: ToastOptions = {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: "dark",
};

export function setSuccessToast(message: string, options?: ToastOptions) {
  toast.success(message, { ...baseOptions, ...options });
}

// Alias with your requested spelling
export const setSuccsessToast = setSuccessToast;

export function setErrorToast(message: string, options?: ToastOptions) {
  toast.error(message, { ...baseOptions, ...options });
}

export function setWarningToast(message: string, options?: ToastOptions) {
  toast.warning(message, { ...baseOptions, ...options });
}

export function setInfoToast(message: string, options?: ToastOptions) {
  toast.info(message, { ...baseOptions, ...options });
}

export default function ToastProvider() {
  return <ToastContainer />;
}