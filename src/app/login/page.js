// src/app/login/page.js

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FaSignInAlt } from "react-icons/fa";
import { loginUser } from "../api/auth";
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
import CredentialsProvider from "next-auth/providers/credentials";
import Link from "next/link";

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

    toast.info("Processing your login. Please wait...");

    try {
      const result = await signIn("credentials", {
        redirect: false, // Prevent automatic redirection
        email,
        password,
      });
      console.log("Login result:", result); // Debugging line

      if (!result) {
        toast.error("Something went wrong. Please try again.");
        return;
      }

      if (result.error) {
        let errorMessage = "Email or Password invalid!";
        try {
          const parsed = JSON.parse(result.error);
          errorMessage = parsed.message || errorMessage;
        } catch (e) {
          // fallback for generic errors like "CredentialsSignin"
          if (result.error === "CredentialsSignin") {
            errorMessage = "Invalid email or password.";
          }
        }

        toast.error(errorMessage);
      } else {
        toast.success("Login successful! Redirecting...");
        setEmail("");
        setPassword("");
        setTimeout(() => {
          router.push("/home"); // Redirect after successful login
        }, 2000);
      }
    } catch (err) {
      toast.error(err.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Top/Left side for the image */}
      <div className="w-full md:w-1/2 flex items-center justify-center mb-6 md:mb-0">
        <img
          src="/images/boy-with-headphones-listening-to.jpg"
          alt="Register Illustration"
          className="max-w-full max-h-full object-cover"
        />
      </div>
      {/* Bottom/Right side for the login form */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center px-6">
        <h1 className=" text-5xl font-extrabold leading-tight tracking-tighter text-center">
          Welcome to
          <LineShadowText
            className="italic text-primary ml-3 whitespace-nowrap mb-10"
            shadowColor={shadowColor}
          >
            Music Odyssey!
          </LineShadowText>
        </h1>
        <form onSubmit={handleLogin} className="w-full max-w-sm">
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
          <Link href="/register">
            <p className="px-6 py-2">
              Don&apos;t have an account?:{" "}
              <span className="text-blue-500 underline"> Register </span>
            </p>
          </Link>
        </div>
      </div>
      <ToastContainer /> {/* Add ToastContainer to render notifications */}
    </div>
  );
}
