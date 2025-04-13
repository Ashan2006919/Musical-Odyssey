"use client";

import {
  FaCalendarAlt,
  FaHome,
  FaPencilAlt,
  FaGithub,
  FaLinkedin,
  FaTwitter,
  FaYoutube,
  FaEnvelope,
  FaStar,
  FaUser,
  FaSpotify,
} from "react-icons/fa"; // Import Spotify icon
import Link from "next/link";
import React from "react";

import { ModeToggle } from "@/components/NighMode";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Dock, DockIcon } from "@/components/magicui/dock";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function Header() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname(); // Get the current pathname
  const user = session?.user || {};

  const Icons = {
    calendar: FaCalendarAlt,
    email: FaEnvelope,
    linkedin: FaLinkedin,
    x: FaTwitter,
    youtube: FaYoutube,
    github: FaGithub,
    spotify: FaSpotify,
  };

  const DATA = {
    navbar: [
      {
        href: "/",
        icon: () => (
          <img
            src="/icons/homeicon-3d.png"
            alt="Home"
            // Adjust size as needed
          />
        ),
        label: "Home",
      },
      {
        href: "/ratings",
        icon: () => <img src="/icons/ratingicon-3d.png" alt="Rating" />,
        label: "Ratings",
      }, // Added Ratings
      {
        href: "/profile",
        icon: () => <img src="/icons/maleusericon-3d.png" alt="Profile" />,
        label: "Profile",
      }, // Added Profile
    ],
    contact: {
      social: {
        Spotify: {
          name: "Spotify",
          url: "https://open.spotify.com/user/31w456o3ccwx76uzg7xi355ukb34",
          icon: () => <img src="/icons/spotify.png" alt="Spotify" />,
        },
        GitHub: {
          name: "GitHub",
          url: "https://github.com/Ashan2006919",
          icon: () => <img src="/icons/github.png" alt="Github" />,
        },
        email: {
          name: "Send Email",
          url: "ashanniwantha2@gmail.com",
          icon: () => <img src="/icons/gmailicon-3d.png" alt="Gmail" />,
        },
      },
    },
  };

  const isAuthPage =
    pathname === "/register" ||
    pathname === "/login" ||
    pathname === "/" ||
    pathname === "/otp-verification";

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  // Return null for authentication pages
  if (isAuthPage) {
    return null;
  }

  return (
    <div
      className="fixed bottom-0 left-0 w-full z-50 bg-transparent shadow-lg py-6"
    >
      <div className="flex flex-col items-center justify-center">
        <TooltipProvider>
          <Dock iconMagnification={80} iconDistance={300} className="dark:border-gray-400">
            {DATA.navbar.map((item) => (
              <DockIcon key={item.label} size={40}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      aria-label={item.label}
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "icon" }),
                        "size-16 rounded-full text-blue-500"
                      )}
                    >
                      <item.icon className="size-6" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-lg font-semibold">{item.label}</p>
                  </TooltipContent>
                </Tooltip>
              </DockIcon>
            ))}
            <Separator orientation="vertical" className="h-full dark:bg-gray-400" />
            {Object.entries(DATA.contact.social).map(([name, social]) => (
              <DockIcon key={name} size={70}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href={social.url}
                      aria-label={social.name}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "icon" }),
                        "size-16 rounded-full text-green-500"
                      )}
                    >
                      <social.icon className="size-6" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-lg font-semibold">{name}</p>
                  </TooltipContent>
                </Tooltip>
              </DockIcon>
            ))}
            <Separator orientation="vertical" className="h-full py-2 dark:bg-gray-400" />
            <DockIcon>
              <Tooltip>
                <TooltipTrigger asChild>
                  <ModeToggle className="rounded-full size-16" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-lg font-semibold">Theme</p>
                </TooltipContent>
              </Tooltip>
            </DockIcon>
          </Dock>
        </TooltipProvider>
      </div>
    </div>
  );
}
