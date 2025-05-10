"use client";

import { useState, useEffect } from "react";
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
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { motion } from "framer-motion";
import Bubbles from "@/components/Bubbles";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [showLoginPopup, setShowLoginPopup] = useState(false); // State for showing the pop-up
  const router = useRouter();
  const theme = useTheme();
  const shadowColor = theme.resolvedTheme === "dark" ? "white" : "black";
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      // Redirect to the home page if the user is already logged in
      router.push("/home");
    }
  }, [status, router]);

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
    console.log("Registering user:", {
      name,
      email,
      password,
      profileImage,
    });

    try {
      // Create a FormData object to handle file uploads
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("provider", "credentials"); // Specify the provider as "credentials"
      if (profileImage) {
        formData.append("profileImage", profileImage);
      }

      const response = await fetch("/api/auth/register", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        if (data.message.includes("User already exists")) {
          setShowLoginPopup(true); // Show the login pop-up
        } else {
          toast.error(data.message || "Registration failed");
        }
      } else {
        toast.success(
          "Registration successful! Please check your email for the OTP."
        );
        setName("");
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
    <div className="relative flex flex-col md:flex-row min-h-screen dark:bg-zinc-950 bg-white">
      {/* Animated Bubbles */}
      <Bubbles />

      {/* New Small Circle 1 */}
      <motion.div
        className="absolute bg-cyan-400 rounded-full z-5"
        style={{
          width: "200px",
          height: "200px",
          top: "-85px",
          right: "-90px",
        }}
        initial={{ x: "100vw", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 2, ease: "easeInOut" }}
      />

      {/* Top/Left side for the image */}
      <div className="w-full md:w-1/2 flex items-center justify-center mb-6 md:mb-0 relative z-0">
        {/* Animated Background for the Image */}
        <motion.div
          className="absolute bg-gradient-to-r from-blue-700 to-purple-500 rounded-full -z-10"
          style={{
            width: "200px",
            height: "200px",
            top: "10px", // Start off-screen
            left: "0px",

          }}
          initial={{ x: "-100vw", scale: 0.2, opacity: 0 }}
          animate={{ x: 0, scale: 4, opacity: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />

        {/* Image */}
        <motion.img
          src="images/musicvideo-3d.png"
          alt="Register Illustration"
          className="max-w-full max-h-full object-cover relative z-0"
          initial={{ x: "-100vw", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />
      </div>

      {/* Bottom/Right side for the register form */}
      <motion.div
        className="w-full md:w-1/2 flex flex-col items-center justify-center px-6 z-20 sm:mt-10"
        initial={{ x: "100vw", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      >
        <h1 className="text-7xl font-extrabold leading-tight tracking-tighter text-center">

          <LineShadowText
            className="italic text-primary ml-3 whitespace-nowrap mb-10"
            shadowColor={shadowColor}
          >
            Musical Odyssey!
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
              placeholder="name"
              value={name}
              onChange={(e) => setname(e.target.value)}
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
        <p className="mt-4">- or continue with -</p>
        <div className="flex justify-center items-center mt-6 space-x-8">
          <Button variant="outline" className="w-full py-5">
            <img
              src="/icons/google.png"
              alt="Login with Google"
              className="w-8 h-auto cursor-pointer hover:opacity-80"
              title="Login with Google"
              onClick={() => signIn("google", { callbackUrl: "/home" })} // Redirect to home after login
            />
          </Button>
          <Button variant="outline" className="w-full py-5">
            <img
              src="/icons/spotify.png"
              alt="Login with Spotify"
              className="w-8 h-auto cursor-pointer hover:opacity-80"
              title="Login with Spotify"
              onClick={() => signIn("spotify", { callbackUrl: "/home" })} // Redirect to home after login
            />
          </Button>
          <Button variant="outline" className="w-full py-5">
            <img
              src="/icons/github.png"
              alt="Register with GitHub"
              className="w-8 h-auto cursor-pointer hover:opacity-80"
              title="Register with GitHub"
              onClick={() => signIn("github", { callbackUrl: "/home" })} // Redirect to home after login
            />
          </Button>
        </div>
        <div className="mt-5 text-center">
          <Link href="/login">
            <p className="px-6 py-1 mb-3">Already have an account?: <span className="text-blue-500 underline"> Login </span></p>
          </Link>
        </div>
      </motion.div>
      {/* Show the login pop-up if needed */}
      {showLoginPopup && (
        <MagicLoginPopup onClose={() => setShowLoginPopup(false)} />
      )}
      <ToastContainer /> {/* Add ToastContainer to render notifications */}
    </div>
  );
}
