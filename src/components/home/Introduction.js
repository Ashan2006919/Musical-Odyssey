"use client";
import React from "react";
import { ContainerScroll } from "../ui/container-scroll-animation";
import Image from "next/image";
import { Button } from "../ui/button";
import { motion } from "framer-motion";
import { useRef } from "react";
import { LineShadowText } from "../magicui/line-shadow-text";
import { useTheme } from "next-themes";

export default function HeroScrollHome() {
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
      <ContainerScroll
        titleComponent={
          <>
            {/* Get Started Button */}
            <motion.div
              className="mt-10 flex justify-center"
              initial={{ y: "100px", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1.5, ease: "easeInOut", delay: 0.7 }}
            >
              <Button className="px-6 py-3 text-xl" onClick={handleScroll}>
                Get Started
              </Button>
            </motion.div>

            {/* Animated Heading */}
            <motion.h1
              className="text-[clamp(2rem,10vw,5rem)] font-extrabold leading-tight tracking-tighter text-center"
              initial={{ y: "-100px", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            >
              Welcome to <br />
              <LineShadowText
                className="italic text-primary whitespace-nowrap"
                shadowColor={shadowColor}
              >
                Musical Odyssey !
              </LineShadowText>
            </motion.h1>
          </>
        }
      >
        <Image
          src={"/images/Musical-Odyssey-intro.jpeg"}
          alt="hero"
          height={720}
          width={1400}
          className="mx-auto rounded-2xl object-cover h-full object-left-top"
          draggable={false}
        />
      </ContainerScroll>
    </div>
  );
}
