import { CheckCircleIcon } from "@heroicons/react/solid"; // Example icon, adjust based on your setup

export default function SuccessToast({ message }) {
  return (
    <div className="flex items-center space-x-3">
      <CheckCircleIcon className="w-6 h-6 text-green-500" />
      <span className="text-green-700 font-medium">{message}</span>
    </div>
  );
}