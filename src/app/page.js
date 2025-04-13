"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LineShadowText } from "@/components/magicui/line-shadow-text";
import { useTheme } from "next-themes";
import { signIn } from "next-auth/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import Bubbles from "@/components/Bubbles";

export default function Home() {
  const { resolvedTheme } = useTheme();
  const shadowColor = resolvedTheme === "dark" ? "white" : "black";
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/home");
    }
  }, [status, router]);

  return (
    <div className="relative flex flex-col md:flex-row min-h-screen dark:bg-zinc-950 bg-white">
      {/* Animated Bubbles */}
      <Bubbles />

      {/* New Small Circle (Replaces the big blue one) */}
      <motion.div
        className="absolute bg-purple-500 rounded-full -z-5"
        style={{
          width: "200px",
          height: "200px",
          top: "-100px", // Start off-screen
          right: "-100px",
        }}
        initial={{ x: "100vw", y: 0, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 2, ease: "easeInOut" }}
      />

      {/* Top/Left side for the image with background */}
      <div className="w-full md:w-1/2 flex items-center justify-center mb-6 md:mb-0 relative z-0">
        {/* Animated Background for the Image */}
        <motion.div
          className="absolute bg-yellow-300 rounded-full -z-10"
          style={{
            width: "185px", // Start small
            height: "185px",
          }}
          initial={{ x: "-100vw", scale: 0.1, opacity: 0 }}
          animate={{ x: 0, scale: 4, opacity: 1 }} // Grows to 4x size
          transition={{ duration: 2, ease: "easeInOut" }}
        />

        {/* Image */}
        <motion.img
          src="/images/smartphone-3d.png"
          alt="Login Illustration"
          className="max-w-full max-h-full object-cover relative z-0"
          initial={{ x: "-100vw", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />
      </div>

      {/* Bottom/Right side for the login form */}
      <motion.div
        className="w-full md:w-1/2 flex flex-col items-center justify-center px-6 z-0"
        initial={{ x: "100vw", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 2, ease: "easeInOut" }}
      >
        {/* Animated Heading */}
        <motion.h1
          className="text-[clamp(2rem,10vw,5rem)] font-extrabold leading-tight tracking-tighter text-center"
          initial={{ y: "-100px", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        >
          Welcome to
          <LineShadowText
            className="italic text-primary ml-3 whitespace-nowrap"
            shadowColor={shadowColor}
          >
            Music Odyssey!
          </LineShadowText>
        </motion.h1>

        {/* Animated Description */}
        <motion.p
          className="mt-6 text-lg md:text-xl text-gray-600 dark:text-gray-200 max-w-md"
          initial={{ x: "100vw", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut", delay: 0.5 }}
        >
          Track every album you listen to, review each song, and build a
          timeline of your music journey. Proudly made by an 18-year-old music
          lover from Sri Lanka 🎧🇱🇰.
        </motion.p>

        {/* Animated Buttons */}
        <motion.div
          className="mt-10 flex gap-6"
          initial={{ x: "100vw", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut", delay: 0.7 }}
        >
          <Link href="/login">
            <Button className="px-6 py-2 text-xl w-full h-full">Login</Button>
          </Link>
          <Link href="/register">
            <Button
              variant="outline"
              className="px-6 py-2 text-xl w-full h-full"
            >
              Register
            </Button>
          </Link>
        </motion.div>

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
      </motion.div>
    </div>
  );
}
