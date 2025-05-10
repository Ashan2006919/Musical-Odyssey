"use client";
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavbarHeader() {
  const pathname = usePathname(); // Get the current pathname
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    {
      name: "Home",
      link: "/",
      icon: "/icons/homeicon-3d.png",
    },
    {
      name: "Ratings",
      link: "/ratings",
      icon: "/icons/ratingicon-3d.png",
    },
    {
      name: "Artist Ranking", // New navigation item
      link: "/artist-ranking",
      icon: "/icons/rankingicon-3d.png", // Add an appropriate icon for artist ranking
    },
    {
      name: "Profile",
      link: "/profile",
      icon: "/icons/maleusericon-3d.png",
    },
    {
      name: "Settings",
      link: "/settings",
      icon: "/icons/settingsicon-3d.png",
    },
    {
      name: "Notifications",
      link: "/notifications",
      icon: "/icons/notificationicon-3d.png",
    },
  ];

  return (
    <div className="relative w-full">
      <Navbar>
        {/* Desktop Navigation */}
        <NavBody>
          <NavbarLogo />
          <NavItems items={navItems}>
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.link}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  pathname === item.link
                    ? "bg-blue-500 text-white"
                    : "text-neutral-600 dark:text-neutral-300"
                }`}
              >
                <img src={item.icon} alt={item.name} className="h-6 w-6" />
                <span>{item.name}</span>
              </Link>
            ))}
          </NavItems>
        </NavBody>

        {/* Mobile Navigation */}
        <MobileNav>
          <MobileNavHeader>
            <NavbarLogo />
            <MobileNavToggle
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
          </MobileNavHeader>

          <MobileNavMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          >
            {navItems.map((item, idx) => (
              <Link
                key={`mobile-link-${idx}`}
                href={item.link}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-lg ${
                  pathname === item.link
                    ? "bg-blue-500 text-white"
                    : "text-neutral-600 dark:text-neutral-300"
                }`}
              >
                <img src={item.icon} alt={item.name} className="h-6 w-6" />
                <span>{item.name}</span>
              </Link>
            ))}
          </MobileNavMenu>
        </MobileNav>
      </Navbar>
    </div>
  );
}
