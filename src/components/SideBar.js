"use client";
import React, { useState, useEffect } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import {
  IconHome,
  IconStar,
  IconSettings,
  IconUserBolt,
  IconMusic,
  IconBook,
  IconChevronDown,
} from "@tabler/icons-react";
import Link from "next/link";
import { motion } from "motion/react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { signOut } from "next-auth/react";

export default function SidebarComponent() {
  const [open, setOpen] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  const user = session?.user || {
    name: "Guest",
    email: "guest@example.com",
    image: "/images/default-profile.png",
  };

  const [predefinedPlaylists, setPredefinedPlaylists] = useState([]);
  const [userPlaylists, setUserPlaylists] = useState([]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

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

  const links = [
    {
      label: "Home",
      href: "/home",
      icon: (
        <IconHome className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Ratings",
      href: "/ratings",
      icon: (
        <IconStar className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Profile",
      href: "/profile",
      icon: (
        <IconUserBolt className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Settings",
      href: "/settings",
      icon: (
        <IconSettings className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
  ];

  const playlistItems = [
    {
      title: "Predefined Playlists",
      icon: IconBook,
      items: predefinedPlaylists.map((playlist) => ({
        title: playlist.name || playlist.title,
        url: playlist.href || "#",
        imageUrl: playlist.imageUrl,
      })),
    },
    {
      title: "Your Playlists",
      icon: IconMusic,
      items: userPlaylists.map((playlist) => ({
        title: playlist.name || playlist.title,
        url: playlist.href || "#",
        imageUrl: playlist.imageUrl,
      })),
    },
  ];

  return (
    <div className="flex">
      {/* Sidebar */}
      <div
        className={cn(
          `fixed top-0 left-0 h-screen flex flex-col overflow-hidden border-r border-neutral-200 bg-gray-100 dark:border-neutral-700 dark:bg-neutral-800 transition-all duration-300`,
          open ? "w-64" : "w-16"
        )}
      >
        <Sidebar open={open} setOpen={setOpen}>
          <SidebarBody className="justify-between gap-10">
            {/* Navigation Links and Playlist Items */}
            <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
              {open ? <Logo /> : <LogoIcon />}
              <div className="mt-8 flex flex-col gap-2">
                {/* Profile Section at the Top */}
                <div className="mt-4">
                  <Collapsible asChild defaultOpen={false} className="group/collapsible">
                    <div>
                      <CollapsibleTrigger asChild>
                        <SidebarLink
                          link={{
                            label: (
                              <div className="flex items-center">
                                {/* Always render the profile icon */}
                                <Avatar className="h-8 w-8 rounded-lg">
                                  <AvatarImage src={user.image} alt={user.name} />
                                  <AvatarFallback className="rounded-lg">
                                    {user.name[0]}
                                  </AvatarFallback>
                                </Avatar>
                                {/* Render name and email only when the sidebar is open */}
                                {open && (
                                  <div className="flex flex-col">
                                    <p className="font-medium">{user.name}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                      {user.email}
                                    </p>
                                  </div>
                                )}
                                {/* Render the dropdown chevron only when the sidebar is open */}
                                {open && (
                                  <IconChevronDown className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
                                )}
                              </div>
                            ),
                            href: "#",
                          }}
                        />
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="ml-4">
                          <SidebarLink
                            link={{
                              label: (
                                <div className="flex items-center gap-2">
                                  <BadgeCheck className="h-5 w-5" />
                                  <span>View Profile</span>
                                </div>
                              ),
                              href: "/profile",
                            }}
                          />
                          <SidebarLink
                            link={{
                              label: (
                                <div className="flex items-center gap-2">
                                  <Sparkles className="h-5 w-5" />
                                  <span>Upgrade to Pro</span>
                                </div>
                              ),
                              href: "#",
                            }}
                          />
                          <SidebarLink
                            link={{
                              label: (
                                <div className="flex items-center gap-2">
                                  <CreditCard className="h-5 w-5" />
                                  <span>Billing</span>
                                </div>
                              ),
                              href: "#",
                            }}
                          />
                          <SidebarLink
                            link={{
                              label: (
                                <div className="flex items-center gap-2">
                                  <Bell className="h-5 w-5" />
                                  <span>Notifications</span>
                                </div>
                              ),
                              href: "#",
                            }}
                          />
                          <SidebarLink
                            link={{
                              label: (
                                <div className="flex items-center gap-2">
                                  <LogOut className="h-5 w-5" />
                                  <span>Log out</span>
                                </div>
                              ),
                              href: "#",
                              onClick: () => {
                                signOut();
                                localStorage.removeItem("token");
                                router.push("/");
                              },
                            }}
                          />
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                </div>
                {/* Render navigation links */}
                {links.map((link, idx) => (
                  <SidebarLink key={idx} link={link} />
                ))}

                {/* Add a horizontal line to separate sections */}
                <hr className="my-4 border-t border-neutral-300 dark:border-neutral-600" />

                {/* Render playlist items */}
                {playlistItems.map((playlistSection) => (
                  <Collapsible
                    key={playlistSection.title}
                    asChild
                    defaultOpen={false}
                    className="group/collapsible"
                  >
                    <div>
                      <CollapsibleTrigger asChild>
                        <SidebarLink
                          link={{
                            label: (
                              <div className="flex items-center">
                                {playlistSection.icon && (
                                  <playlistSection.icon className="mr-2 h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
                                )}
                                {open && <span>{playlistSection.title}</span>}
                                {open && (
                                  <IconChevronDown className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
                                )}
                              </div>
                            ),
                            href: "#",
                          }}
                        />
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="ml-4">
                          {playlistSection.items.map((subItem, index) => (
                            <SidebarLink
                              key={subItem.title || index}
                              link={{
                                label: (
                                  <div className="flex items-center gap-2">
                                    {subItem.imageUrl && (
                                      <img
                                        src={subItem.imageUrl}
                                        alt={subItem.title}
                                        className="h-6 w-6 rounded object-cover"
                                      />
                                    )}
                                    <span>{subItem.title}</span>
                                  </div>
                                ),
                                href: subItem.url,
                              }}
                            />
                          ))}
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                ))}
              </div>
            </div>
          </SidebarBody>
        </Sidebar>
      </div>

      {/* Content Area */}
      <div
        className={cn(
          `flex-1 transition-all duration-300`,
          open ? "ml-64" : "ml-16"
        )}
      >
        {/* This will be the content area */}
      </div>
    </div>
  );
}

export const Logo = () => {
  return (
    <Link
      href="#"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
    >
      <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-black dark:bg-white" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium whitespace-pre text-black dark:text-white"
      >
        Acet Labs
      </motion.span>
    </Link>
  );
};

export const LogoIcon = () => {
  return (
    <Link
      href="#"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
    >
      <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-black dark:bg-white" />
    </Link>
  );
};
