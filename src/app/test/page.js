"use client";

import { FaCalendarAlt, FaHome, FaPencilAlt, FaGithub, FaLinkedin, FaTwitter, FaYoutube, FaEnvelope, FaStar, FaUser, FaSpotify } from "react-icons/fa"; // Import Spotify icon
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
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

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
    { href: "/", icon: FaHome, label: "Home" },
    { href: "/ratings", icon: FaStar, label: "Ratings" }, // Added Ratings
    { href: "/profile", icon: FaUser, label: "Profile" }, // Added Profile
  ],
  contact: {
    social: {
      Spotify: {
        name: "Spotify",
        url: "https://open.spotify.com/user/31w456o3ccwx76uzg7xi355ukb34",
        icon: Icons.spotify,
      },
      GitHub: {
        name: "GitHub",
        url: "https://github.com/Ashan2006919",
        icon: Icons.github,
      },
      email: {
        name: "Send Email",
        url: "ashanniwantha2@gmail.com",
        icon: Icons.email,
      },
    },
  },
};

export default function DockDemo() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname(); // Get the current pathname
  const user = session?.user || {};

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
                      "size-12 rounded-full text-blue-500" // Add color
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
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      buttonVariants({ variant: "ghost", size: "icon" }),
                      "size-12 rounded-full text-green-500" // Add color
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
  );
}
