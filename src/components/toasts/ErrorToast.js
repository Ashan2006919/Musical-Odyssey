// src/components/toasts/ErrorToast.js
import { ExclamationCircleIcon } from "@heroicons/react/solid"; // Ensure this import is correct

export default function ErrorToast({ message }) {
  return (
    <div className="flex items-center space-x-3">
      <ExclamationCircleIcon className="w-6 h-6 text-red-500" />
      <span className="text-red-700 font-medium">{message}</span>
    </div>
  );
}
