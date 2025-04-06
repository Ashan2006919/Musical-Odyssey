// src/app/register/page.js

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FaUserAlt, FaEnvelope, FaLock } from "react-icons/fa";
import { registerUser } from "../api/auth";
import { LineShadowText } from "@/components/magicui/line-shadow-text";
import { useTheme } from "next-themes";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const theme = useTheme();
  const shadowColor = theme.resolvedTheme === "dark" ? "white" : "black";

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      await registerUser({ username, email, password });
      setUsername("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      router.push("/home"); // Redirect after successful registration
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Top/Left side for the image */}
      <div className="w-full md:w-1/2 bg-gray-100 flex items-center justify-center mb-6 md:mb-0">
        <img
          src="/images/cartoon-boy-with-headphones-listening-to.jpg"
          alt="Login Illustration"
          className="max-w-full max-h-full object-cover"
        />
      </div>

      {/* Bottom/Right side for the registration form */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center px-6">
        <h1 className="text-7xl font-extrabold leading-tight tracking-tighter text-center">
          Join
          <LineShadowText
            className="italic text-primary ml-3 whitespace-nowrap mb-10"
            shadowColor={shadowColor}
          >
            Music Odyssey!
          </LineShadowText>
        </h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleRegister} className="w-full max-w-sm">
          <div className="relative mb-8">
            <FaUserAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <Input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="pl-10 h-10 w-full"
              required
            />
          </div>
          <div className="relative mb-8">
            <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 h-10 w-full"
              required
              autoComplete="email"
            />
          </div>
          <div className="relative mb-8">
            <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 h-10 w-full"
              required
              autoComplete="new-password"
            />
          </div>
          <div className="relative mb-8">
            <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <Input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pl-10 h-10 w-full"
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full flex items-center justify-center font-semibold text-lg h-9"
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </Button>
        </form>
        <p className="mt-4">
          - or - 
        </p>
        <div className="flex justify-center items-center mt-6 space-x-8">
          <img
            src="/icons/google.png"
            alt="Register with Google"
            className="w-9 h-9 cursor-pointer hover:opacity-80"
            title="Register with Google"
          />
          <img
            src="/icons/spotify.png"
            alt="Register with Spotify"
            className="w-9 h-9 cursor-pointer hover:opacity-80"
            title="Register with Spotify"
          />
          <img
            src="/icons/apple.png"
            alt="Register with Apple"
            className="w-9 h-9 cursor-pointer hover:opacity-80"
            title="Register with Apple"
          />
        </div>
        <p className="mt-5">
          Already have an account?{" "}
          <a href="/login" className="text-blue-500">
            Login
          </a>
        </p>
      </div>
    </div>
  );
}
