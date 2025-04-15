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

      {/* Testimonials Section */}
      <div className="mt-20">
        <AnimatedTestimonialsHome />
      </div>
      {/* Application Features Section */}
      <div className="mt-20">
        <FeaturesSectionHome />
      </div>
    </div>
  );
}
