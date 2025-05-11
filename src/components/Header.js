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
      {
        href: "/settings",
        icon: () => <img src="/icons/settingsicon-3d.png" alt="Settings" />,
        label: "Settings",
      }, // Added Settings
      {
        href: "/artist-ranking",
        icon: () => (
          <img src="/icons/rankingicon-3d.png" alt="Artist Ranking" />
        ),
        label: "Artist Ranking",
      }, // Added Artist Ranking
    ],
    contact: {
      social: {},
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
    <div className="fixed bottom-0 left-0 w-full z-50 bg-transparent shadow-lg py-6">
      <div className="flex flex-col items-center justify-center">
        <TooltipProvider>
          <Dock direction="middle">
            {DATA.navbar.map((item) => (
              <DockIcon key={item.label}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      aria-label={item.label}
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "icon" }),
                        "size-12 rounded-full"
                      )}
                    >
                      <item.icon className="size-4" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{item.label}</p>
                  </TooltipContent>
                </Tooltip>
              </DockIcon>
            ))}
            <Separator orientation="vertical" className="h-full" />
            {Object.entries(DATA.contact.social).map(([name, social]) => (
              <DockIcon key={name}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href={social.url}
                      aria-label={social.name}
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "icon" }),
                        "size-12 rounded-full"
                      )}
                    >
                      <social.icon className="size-4" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{name}</p>
                  </TooltipContent>
                </Tooltip>
              </DockIcon>
            ))}
            <Separator orientation="vertical" className="h-full py-2" />
            <DockIcon>
              <Tooltip>
                <TooltipTrigger asChild>
                  <ModeToggle className="rounded-full" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Theme</p>
                </TooltipContent>
              </Tooltip>
            </DockIcon>
          </Dock>
        </TooltipProvider>
      </div>
    </div>
  );
}
