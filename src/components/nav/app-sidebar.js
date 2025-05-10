"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
  ChevronDown,
  ChevronUp,
  Music,
} from "lucide-react";
import { NavMain } from "@/components/nav/nav-main";
import { NavProjects } from "@/components/nav/nav-projects";
import { NavUser } from "./nav-user";
import { TeamSwitcher } from "@/components/nav/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useState, useEffect } from "react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter, usePathname } from "next/navigation";

export function AppSidebar({ ...props }) {
  const [predefinedPlaylists, setPredefinedPlaylists] = useState([]);
  const [userPlaylists, setUserPlaylists] = useState([]);
  const { data: session, status, update } = useSession();
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

  // Updated data structure to include playlists
  const data = {
    user: {
      name: user.name || "Guest",
      email: user.email || "guest@example.com",
      avatar: user.image || "/images/default-profile.png",
    },
    teams: [
      {
        name: "Acme Inc",
        logo: GalleryVerticalEnd,
        plan: "Enterprise",
      },
      {
        name: "Acme Corp.",
        logo: AudioWaveform,
        plan: "Startup",
      },
      {
        name: "Evil Corp.",
        logo: Command,
        plan: "Free",
      },
    ],
    navMain: [
      {
        title: "Playground",
        url: "#",
        icon: SquareTerminal,
        isActive: true,
        items: [
          {
            title: "History",
            url: "#",
          },
          {
            title: "Starred",
            url: "#",
          },
          {
            title: "Settings",
            url: "#",
          },
        ],
      },
      {
        title: "Models",
        url: "#",
        icon: Bot,
        items: [
          {
            title: "Genesis",
            url: "#",
          },
          {
            title: "Explorer",
            url: "#",
          },
          {
            title: "Quantum",
            url: "#",
          },
        ],
      },
      {
        title: "Predefined Playlists",
        icon: BookOpen,
        items: [], // Placeholder for predefined playlists
      },
      {
        title: "Your Playlists",
        icon: Settings2,
        items: [], // Placeholder for user playlists
      },
    ],
    projects: [
      {
        name: "Design Engineering",
        url: "#",
        icon: Frame,
      },
      {
        name: "Sales & Marketing",
        url: "#",
        icon: PieChart,
      },
      {
        name: "Travel",
        url: "#",
        icon: Map,
      },
    ],
  };

  // Fetch predefined playlists
  useEffect(() => {
    const fetchPredefinedPlaylists = async () => {
      try {
        const response = await fetch(`/api/admin/predefinedPlaylists`);
        const data = await response.json();
        setPredefinedPlaylists(data.playlists || []);
      } catch (error) {
        console.error("Error fetching predefined playlists:", error);
      }
    };

    fetchPredefinedPlaylists();
  }, []);

  // Fetch user playlists
  useEffect(() => {
    const fetchUserPlaylists = async () => {
      try {
        if (!session?.user?.omid) return;

        const response = await fetch(
          `/api/getUserPlaylists?userOmid=${session.user.omid}`
        );
        const data = await response.json();
        setUserPlaylists(data.playlists || []);
      } catch (error) {
        console.error("Error fetching user playlists:", error);
      }
    };

    if (session?.user?.omid) {
      fetchUserPlaylists();
    }
  }, [session?.user?.omid]);

  // Separate playlists and regular navigation items
  const navItems = data.navMain.filter(
    (section) =>
      section.title !== "Predefined Playlists" &&
      section.title !== "Your Playlists"
  );

  const playlistItems = [
    {
      title: "Predefined Playlists",
      icon: BookOpen, // Icon for predefined playlists
      items: predefinedPlaylists.map((playlist) => ({
        title: playlist.name || playlist.title,
        url: playlist.href || "#",
        imageUrl: playlist.imageUrl,
      })),
    },
    {
      title: "Your Playlists",
      icon: Music, // Icon for user playlists
      items: userPlaylists.map((playlist) => ({
        title: playlist.name || playlist.title,
        url: playlist.href || "#",
        imageUrl: playlist.imageUrl,
      })),
    },
  ];
  
  if (isAuthPage) {
    return null;
  }

  return (
    <Sidebar collapsible="icon" {...props} className="mr-5">
      <SidebarTrigger />
      <SidebarHeader>
        <NavUser user={data.user} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain navItems={navItems} playlistItems={playlistItems} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <TeamSwitcher teams={data.teams} />
      </SidebarFooter>
      <SidebarRail className="-mr-6 outline-none" />
    </Sidebar>
  );
}
