"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MagicCard } from "@/components/magicui/magic-card";
import { useTheme } from "next-themes";
import { IoClose } from "react-icons/io5"; // Import a close icon

export default function MagicLoginPopup({ onClose }) {
  const { theme } = useTheme();

  const handleLogin = () => {
    window.location.href = "/login"; // Redirect to login page
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-96 relative">
        <MagicCard gradientColor={theme === "dark" ? "#262626" : "#D9D9D955"}>
          <CardHeader>
            <button
              className="absolute -top-1 -right-3 text-gray-500 hover:text-gray-700"
              onClick={onClose}
            >
              <IoClose size={24} />
            </button>
            <CardTitle>Login</CardTitle>
            <CardDescription>
              User already exists. Please log in to your account.
            </CardDescription>
          </CardHeader>
          <hr className="-mt-3 mb-3" />
          <CardContent>
            <p className="text-center text-gray-500">
              Use your credentials to access your account.
            </p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button onClick={handleLogin} className="w-full">
              Go to Login
            </Button>
            <Button variant="outline" onClick={onClose} className="ml-2">
              Cancel
            </Button>
          </CardFooter>
        </MagicCard>
      </Card>
    </div>
  );
}