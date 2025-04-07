// src/app/register/page.js

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FaUserAlt, FaEnvelope, FaLock, FaPencilAlt } from "react-icons/fa"; // Import the pencil icon
import { registerUser } from "../api/auth";
import { LineShadowText } from "@/components/magicui/line-shadow-text";
import { useTheme } from "next-themes";
import MagicLoginPopup from "@/components/MagicLoginPopup"; // Import the new component
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import Toastify styles

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [showLoginPopup, setShowLoginPopup] = useState(false); // State for showing the pop-up
  const router = useRouter();
  const theme = useTheme();
  const shadowColor = theme.resolvedTheme === "dark" ? "white" : "black";

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      setLoading(false);
      return;
    }

    // Show an info toast to indicate processing
    toast.info("Processing your registration. Please wait...");

    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("email", email);
      formData.append("password", password);
      if (profileImage) {
        formData.append("profileImage", profileImage);
      }

      const response = await fetch("/api/auth/register", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        if (data.message === "User already exists with this email.") {
          setShowLoginPopup(true); // Show the login pop-up
        } else {
          toast.error(data.message || "Registration failed");
        }
      } else {
        toast.success("Registration successful! Please check your email for the OTP.");
        setUsername("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setProfileImage(null);

        router.push(`/otp-verification?email=${email}`);
      }
    } catch (err) {
      toast.error(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageClick = () => {
    document.getElementById("profileImageInput").click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
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

        {/* Profile Image Upload */}
        <div className="relative mb-6 flex justify-center">
          <div
            className="w-24 h-24 rounded-full border-2 border-gray-300 flex items-center justify-center cursor-pointer overflow-hidden relative"
            onClick={handleImageClick}
          >
            {profileImage ? (
              <img
                src={URL.createObjectURL(profileImage)}
                alt="Profile Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src="/images/default-profile.png"
                alt="Default Profile"
                className="w-full h-full object-cover"
              />
            )}
            {/* Pencil Icon */}
            <div className="absolute bottom-2 right-2 bg-gray-500 rounded-full p-1 shadow-md">
              <FaPencilAlt className="text-black" />
            </div>
          </div>
          <input
            id="profileImageInput"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>

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

      {/* Show the login pop-up if needed */}
      {showLoginPopup && <MagicLoginPopup onClose={() => setShowLoginPopup(false)} />}
      <ToastContainer /> {/* Add ToastContainer to render notifications */}
    </div>
  );
}
