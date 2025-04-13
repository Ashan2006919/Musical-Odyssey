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

export default function Home() {
  const { resolvedTheme } = useTheme();
  const shadowColor = resolvedTheme === "dark" ? "white" : "black";
  const router = useRouter();
  const { data: session, status } = useSession();

    useEffect(() => {
      if (status === "authenticated") {
        // Redirect to the home page if the user is already logged in
        router.push("/home");
      }
    }, [status, router]);

  return (
    <div className="flex flex-col md:flex-row min-h-screen dark:bg-zinc-950 bg-white">
      {/* Top/Left side for the image */}
      <div className="w-full md:w-1/2 flex items-center justify-center mb-6 md:mb-0">
        <img
          src="/images/smartphone-3d.png"
          alt="Login Illustration"
          className="max-w-full max-h-full object-cover"
        />
      </div>

      {/* Bottom/Right side for the login form */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center px-6">
        {/* Title */}
        <h1 className="text-[clamp(2rem,10vw,5rem)] font-extrabold leading-tight tracking-tighter text-center">
          Welcome to
          <LineShadowText
            className="italic text-primary ml-3 whitespace-nowrap"
            shadowColor={shadowColor}
          >
            Music Odyssey!
          </LineShadowText>
        </h1>

        <p className="mt-6 text-lg md:text-xl text-gray-600 dark:text-gray-200 max-w-md">
          Track every album you listen to, review each song, and build a
          timeline of your music journey. Proudly made by an 18-year-old music
          lover from Sri Lanka 🎧🇱🇰.
        </p>

        <div className="mt-10 flex gap-6">
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
        </div>

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
      </div>
    </div>
  );
}
