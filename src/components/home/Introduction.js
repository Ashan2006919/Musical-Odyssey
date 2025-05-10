"use client";
import React from "react";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import Image from "next/image";
import SupportedPlatforms from "@/components/home/SupportedPlatforms";
import { Button } from "@/components/ui/button";
import { LineShadowText } from "@/components/magicui/line-shadow-text";
import { useTheme } from "next-themes";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRef } from "react";
import { signIn } from "next-auth/react";
import Iphone15Pro from "@/components/magicui/iphone-15-pro";
import { Safari } from "@/components/magicui/safari";

export default function Introduction() {
  // Ref for the section to scroll to
  const introSectionRef = useRef(null);
  // Get the current theme to set shadow color
  const { resolvedTheme } = useTheme();
  const shadowColor = resolvedTheme === "dark" ? "white" : "black";
  const handleScroll = () => {
    introSectionRef.current.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="flex flex-col overflow-hidden">
      <div className="-mt-36 mb-10">
        <ContainerScroll
          titleComponent={
            <>
              {/* Animated Heading */}
              <motion.h1
                className="text-[clamp(2rem,10vw,5rem)] font-extrabold leading-tight tracking-tighter text-center mb-16"
                initial={{ y: "-100px", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              >
                Welcome to
                <LineShadowText
                  className="italic text-primary whitespace-nowrap"
                  shadowColor={shadowColor}
                >
                  Musical Odyssey !
                </LineShadowText>
              </motion.h1>
              <h1 className="text-4xl font-semibold text-black dark:text-white">
                Unleash the power of <br />
                <span className="text-4xl md:text-[6rem] font-bold mt-1 leading-none">
                  Scroll Animations
                </span>
              </h1>
            </>
          }
        >
          <Image
            src={`/images/Musical-Odyssey-intro.jpeg`}
            alt="hero"
            height={720}
            width={1400}
            className="mx-auto rounded-2xl object-cover h-full object-left-top"
            draggable={false}
          />
        </ContainerScroll>
      </div>
      {/* Supported Platforms Section */}
      <div className="-mt-28">
        <SupportedPlatforms />
      </div>

      <div className="flex flex-col md:flex-row">
        {/* Introduction and Login/Register Section */}
        {/* Overlayed Iphone15ProDemo and SafariDemo */}
        <div className="w-full md:w-1/2 flex items-center justify-center md:mb-0 relative z-0">
          <motion.div
            className="absolute items-center justify-center -right-10 z-10 h-5/6"
            initial={{ x: "-100vw", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          >
            <Iphone15Pro className="size-full" />
          </motion.div>
          <motion.div
            className="absolute left-5 items-center justify-center h-full"
            initial={{ x: "-100vw", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 2, ease: "easeInOut", delay: 0.5 }}
          >
            <Safari url="magicui.design" className="size-full" />
          </motion.div>
        </div>

        {/* Bottom/Right side for the login form */}
        <motion.div
          className="w-full md:w-1/2 flex flex-col items-center justify-center px-6 z-0 mb-10"
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
              className="italic text-primary whitespace-nowrap"
              shadowColor={shadowColor}
            >
              Musical Odyssey !
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
    </div>
  );
}
