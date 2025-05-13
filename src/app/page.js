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
import AnimatedTestimonialsHome from "@/components/home/Testimonials";
import CardHoverEffectHome from "@/components/home/Features";
import Introduction from "@/components/home/Introduction";
import FeaturesSectionHome from "@/components/home/Features";
import { AuroraBackground } from "@/components/ui/aurora-background";
import SupportedPlatforms from "@/components/home/SupportedPlatforms";
import { FaSpotify, FaSoundcloud, FaApple } from "react-icons/fa"; // Import icons for footer

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
    <div className="relative flex flex-col min-h-screen dark:bg-zinc-950 bg-white">
      {/* Animated Background for the Image */}
      <Bubbles />
      <motion.div
        className="absolute bg-yellow-300 rounded-full blur-3xl opacity-60 -z-10"
        style={{
          width: "200px",
          height: "200px",
          top: "-50px",
          left: "10px",
        }}
        initial={{ x: "-100vw", scale: 0.1, opacity: 0 }}
        animate={{ x: 0, scale: 4, opacity: 1 }}
        transition={{ duration: 2, ease: "easeInOut" }}
      />
      {/* Hero Section with Scroll Animation */}
      <Introduction />

      {/* Testimonials Section 
      <div className="mt-20">
        <AnimatedTestimonialsHome />
      </div>
      */}
      
      {/* Application Features Section */}
      <div className="mt-20">
        <FeaturesSectionHome />
      </div>

      {/* Footer Section */}
      <footer className="border-t border-gray-300 dark:border-gray-700 shadow-sm flex shrink-0 items-center gap-2 transition-[width,height] ease-linear">
        <div className="mx-auto w-full max-w-screen-xl p-4 py-6 lg:py-8">
          <div className="md:flex md:justify-between">
            <div className="mb-6 md:mb-0">
              <a href="/home" className="flex items-center">
                <img
                  alt="Odyssey Music Logo"
                  src="/icons/musical-odyssey-md.png"
                  className="h-20 w-auto mr-8"
                />
                <h1 className="text-[clamp(2rem,10vw,5rem)] font-extrabold leading-tight tracking-tighter text-center -ml-4">
                  <LineShadowText
                    className="italic text-primary ml-3 whitespace-nowrap"
                    shadowColor={shadowColor}
                  >
                    Musical Odyssey!
                  </LineShadowText>
                </h1>
              </a>
            </div>
            <div className="grid grid-cols-2 gap-8 sm:gap-6 sm:grid-cols-3">
              <div>
                <h2 className="mb-6 text-sm font-semibold text-gray-900 uppercase dark:text-white">
                  Resources
                </h2>
                <ul className="text-gray-500 dark:text-gray-400 font-medium">
                  <li className="mb-4">
                    <a
                      href="https://open.spotify.com/user/31w456o3ccwx76uzg7xi355ukb34"
                      target="_blank"
                      className="hover:underline"
                    >
                      Spotify
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://genius.com/AshanNiwantha"
                      target="_blank"
                      className="hover:underline"
                    >
                      Genius
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h2 className="mb-6 text-sm font-semibold text-gray-900 uppercase dark:text-white">
                  Follow us
                </h2>
                <ul className="text-gray-500 dark:text-gray-400 font-medium">
                  <li className="mb-4">
                    <a
                      href="https://www.tiktok.com/@ashan.niwantha0?_t=ZS-8vO9YpeIbrO&_r=1"
                      className="hover:underline"
                      target="_blank"
                    >
                      Tik Tok
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://www.instagram.com/mr.ashan_99?igsh=M3l0dGtyZ2NqODV2"
                      className="hover:underline"
                      target="_blank"
                    >
                      Instagram
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h2 className="mb-6 text-sm font-semibold text-gray-900 uppercase dark:text-white">
                  Legal
                </h2>
                <ul className="text-gray-500 dark:text-gray-400 font-medium">
                  <li className="mb-4">
                    <a href="#" target="_blank" className="hover:underline">
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    <a href="#" target="_blank" className="hover:underline">
                      Terms & Conditions
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <hr className="my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8" />
          <div className="sm:flex sm:items-center sm:justify-between">
            <span className="text-sm text-gray-500 sm:text-center dark:text-gray-400">
              © {new Date().getFullYear()}{" "}
              <a href="/home" className="hover:underline">
                Odyssey Music™
              </a>
              . All Rights Reserved.
            </span>
            <div className="flex mt-4 sm:justify-center sm:mt-0">
              <a
                href="https://open.spotify.com"
                className="text-gray-500 hover:text-gray-900 dark:hover:text-white"
              >
                <FaSpotify className="w-4 h-4" />
                <span className="sr-only">Spotify page</span>
              </a>
              <a
                href="https://www.soundcloud.com"
                className="text-gray-500 hover:text-gray-900 dark:hover:text-white ms-5"
              >
                <FaSoundcloud className="w-4 h-4" />
                <span className="sr-only">SoundCloud page</span>
              </a>
              <a
                href="https://www.apple.com/music"
                className="text-gray-500 hover:text-gray-900 dark:hover:text-white ms-5"
              >
                <FaApple className="w-4 h-4" />
                <span className="sr-only">Apple Music account</span>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
