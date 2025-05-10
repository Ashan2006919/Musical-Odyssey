// src/app/login/page.js

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FaSignInAlt } from "react-icons/fa";
import { LineShadowText } from "@/components/magicui/line-shadow-text";
import { useTheme } from "next-themes";
import {
  FaEnvelope,
  FaLock,
  FaGoogle,
  FaSpotify,
  FaApple,
} from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import Toastify styles
import { signIn } from "next-auth/react";
import Link from "next/link";
import { motion } from "framer-motion";
import Bubbles from "@/components/Bubbles";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();
  const theme = useTheme();
  const shadowColor = theme.resolvedTheme === "dark" ? "white" : "black";

  useEffect(() => {
    if (status === "authenticated") {
      // Redirect to the home page if the user is already logged in
      router.push("/home");
    }
  }, [status, router]);

  if (status === "loading") {
    return <p>Loading...</p>; // Show a loading state while checking the session
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        redirect: false, // Prevent automatic redirection
        email,
        password,
      });

      if (!result || result.error) {
        if (result.error === "CredentialsSignin") {
          // Check if the error message indicates an unverified account
          toast.info("Your account is not verified. Redirecting to verification...");
          router.push(`/otp-verification?email=${encodeURIComponent(email)}`);
        } else {
          toast.error(result.error || "Invalid credentials. Please try again.");
        }
      } else {
        toast.success("Login successful! Redirecting...");
        router.push("/home");
      }
    } catch (err) {
      toast.error(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col md:flex-row min-h-screen dark:bg-zinc-950 bg-white">
      {/* Animated Bubbles */}
      <Bubbles />

      {/* New Small Circle 1 */}
      <motion.div
        className="absolute bg-orange-500 rounded-full z-5"
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
          className="absolute bg-yellow-300 rounded-full -z-10"
          style={{
            width: "200px",
            height: "200px",
            top: "-40px", // Start off-screen
            left: "-10px",

          }}
          initial={{ x: "-100vw", scale: 0.2, opacity: 0 }}
          animate={{ x: 0, scale: 4, opacity: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />

        {/* Image */}
        <motion.img
          src="images/listeningsong-3d.png"
          alt="Login Illustration"
          className="max-w-full max-h-full object-cover relative z-0"
          initial={{ x: "-100vw", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />
      </div>

      {/* Bottom/Right side for the login form */}
      <motion.div
        className="w-full md:w-1/2 flex flex-col items-center justify-center px-6 z-20"
        initial={{ x: "100vw", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      >
        {/* Animated Heading */}
        <motion.h1
          className="text-5xl font-extrabold leading-tight tracking-tighter text-center"
          initial={{ y: "-100px", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        >
          Welcome to
          <LineShadowText
            className="italic text-primary ml-3 whitespace-nowrap mb-10"
            shadowColor={shadowColor}
          >
            Music Odyssey!
          </LineShadowText>
        </motion.h1>

        {/* Animated Form */}
        <motion.form
          onSubmit={handleLogin}
          className="w-full max-w-sm"
          initial={{ x: "100vw", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut", delay: 0.5 }}
        >
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
              autoComplete="current-password"
            />
          </div>
          <Button
            type="submit"
            className="w-full flex items-center justify-center font-semibold text-lg h-9"
            disabled={loading}
          >
            <FaSignInAlt className="mr-2" />
            {loading ? "Logging in..." : "Login"}
          </Button>
        </motion.form>

        {/* Animated "or continue with" Text */}
        <motion.p
          className="mt-4"
          initial={{ y: "100px", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut", delay: 1 }}
        >
          - or continue with -
        </motion.p>

        {/* Animated Social Login Buttons */}
        <motion.div
          className="flex justify-center items-center mt-6 space-x-8"
          initial={{ y: "100px", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut", delay: 1.2 }}
        >
          <Button variant="outline" className="w-full py-5">
            <img
              src="/icons/google.png"
              alt="Login with Google"
              className="w-8 h-auto cursor-pointer hover:opacity-80"
              title="Login with Google"
              onClick={() => signIn("google", { callbackUrl: "/home" })}
            />
          </Button>
          <Button variant="outline" className="w-full py-5">
            <img
              src="/icons/spotify.png"
              alt="Login with Spotify"
              className="w-8 h-auto cursor-pointer hover:opacity-80"
              title="Login with Spotify"
              onClick={() => signIn("spotify", { callbackUrl: "/home" })}
            />
          </Button>
          <Button variant="outline" className="w-full py-5">
            <img
              src="/icons/github.png"
              alt="Register with GitHub"
              className="w-8 h-auto cursor-pointer hover:opacity-80"
              title="Register with GitHub"
              onClick={() => signIn("github", { callbackUrl: "/home" })}
            />
          </Button>
        </motion.div>

        {/* Animated Register Link */}
        <motion.div
          className="mt-5 text-center"
          initial={{ y: "100px", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut", delay: 1.4 }}
        >
          <Link href="/register">
            <p className="px-6 py-2">
              Don&apos;t have an account?:{" "}
              <span className="text-blue-500 underline"> Register </span>
            </p>
          </Link>
        </motion.div>
      </motion.div>
      <ToastContainer /> {/* Add ToastContainer to render notifications */}
    </div>
  );
}
