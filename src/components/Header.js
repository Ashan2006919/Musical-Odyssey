"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Dialog,
  DialogPanel,
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Popover,
  PopoverButton,
  PopoverGroup,
  PopoverPanel,
} from "@headlessui/react";
import {
  ArrowPathIcon,
  Bars3Icon,
  ChartPieIcon,
  CursorArrowRaysIcon,
  FingerPrintIcon,
  SquaresPlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  ChevronDownIcon,
  PhoneIcon,
  PlayCircleIcon,
} from "@heroicons/react/20/solid";
import { FaListAlt } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { AvatarCircles } from "@/components/magicui/avatar-circles";
import { useTheme } from "next-themes";
import { LineShadowText } from "@/components/magicui/line-shadow-text";
import { signOut, useSession } from "next-auth/react";
import ProfilePage from "@/app/profile/page";
import { fetchPlaylistsData } from "@/utils/playlistData"; // Import shared playlist logic
import NightMode from "@/components/NighMode"; // Import the Dark Mode toggle

const products = [
  {
    name: "Analytics",
    description: "Get a better understanding of your traffic",
    href: "#",
    icon: ChartPieIcon,
  },
  {
    name: "Engagement",
    description: "Speak directly to your customers",
    href: "#",
    icon: CursorArrowRaysIcon,
  },
  {
    name: "Security",
    description: "Your customers’ data will be safe and secure",
    href: "#",
    icon: FingerPrintIcon,
  },
  {
    name: "Integrations",
    description: "Connect with third-party tools",
    href: "#",
    icon: SquaresPlusIcon,
  },
  {
    name: "Automations",
    description: "Build strategic funnels that will convert",
    href: "#",
    icon: ArrowPathIcon,
  },
];
const callsToAction = [
  { name: "Watch demo", href: "#", icon: PlayCircleIcon },
  { name: "Contact sales", href: "#", icon: PhoneIcon },
];

const playlistIds = [
  "20Rh8cqhAsvpL5rGZ19qqZ",
  "7GTwvfS41Q0EAUbOZmKFcH",
  "0Qd4PXjVn6VyqxUW5Ws9Ok",
  "2qUmxZfsE6mYcmtMN8MZ79",
  "6oPpajvXtHxogBdX6kE5rT",
];

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("/images/default-profile.png"); // Default profile image
  const [playlists, setPlaylists] = useState([]);
  const [userPlaylists, setUserPlaylists] = useState([]);
  const pathname = usePathname();
  const router = useRouter();
  const theme = useTheme();
  const shadowColor = theme.resolvedTheme === "dark" ? "white" : "black";

  const { data: session, status } = useSession();
  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  const isAuthPage =
    pathname === "/register" ||
    pathname === "/login" ||
    pathname === "/" ||
    pathname === "/otp-verification";

  // Fetch the user's profile image (or use default if not available)
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token"); // Assuming the token is stored in localStorage
        if (token) {
          const response = await fetch("/api/user/profile", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const data = await response.json();
          if (data.profileImageUrl) {
            setAvatarUrl(data.profileImageUrl); // Set the user's uploaded profile image
          }
        }
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
      }
    };

    fetchUserProfile();
  }, []);

  // Fetch predefined playlists
  useEffect(() => {
    const fetchPredefinedPlaylists = async () => {
      try {
        const tokenResponse = await fetch("/api/spotify");
        const { access_token } = await tokenResponse.json();

        const fetchedPlaylists = await fetchPlaylistsData(access_token); // Use shared logic
        setPlaylists(fetchedPlaylists);
      } catch (error) {
        console.error("Error fetching predefined playlists:", error);
      }
    };

    fetchPredefinedPlaylists();
  }, []);

  // Fetch user-added playlists
  useEffect(() => {
    const fetchUserPlaylists = async () => {
      try {
        const response = await fetch(
          `/api/getUserPlaylists?userOmid=${session?.user?.omid}`
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
  if (isAuthPage) {
    return null;
  }

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm">
      <nav
        aria-label="Global"
        className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8"
      >
        <div className="flex lg:flex-1">
          <a href="/home" className="-m-16 p-1.5 flex items-center gap-3">
            <img
              alt="Odyssey Music Logo"
              src="/icons/musical-odyssey-md.png"
              className="h-10 w-auto"
            />
            <h1 className="text-5xl font-extrabold leading-tight tracking-tighter">
              <LineShadowText
                className="italic text-primary whitespace-nowrap"
                shadowColor={shadowColor}
              >
                Musical Odyssey!
              </LineShadowText>
            </h1>
          </a>
        </div>
        <div className="flex lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon aria-hidden="true" className="h-6 w-6" />
          </button>
        </div>
        <PopoverGroup className="hidden lg:flex lg:gap-x-4 lg:justify-center lg:items-center ml-20">
          <Popover className="relative">
            <PopoverButton className="flex items-center gap-x-1 text-sm font-semibold text-gray-900">
              Our Playlists
              <ChevronDownIcon
                aria-hidden="true"
                className="h-5 w-5 flex-none text-gray-400"
              />
            </PopoverButton>
            <PopoverPanel className="absolute top-full -left-8 z-50 mt-3 w-screen max-w-md overflow-hidden rounded-3xl bg-white ring-1 shadow-lg ring-gray-900/5">
              <div className="p-4 max-h-72 overflow-y-auto">
                {playlists.map((playlist) => (
                  <div
                    key={playlist.id}
                    className="group relative flex items-center gap-x-6 rounded-lg p-4 text-sm hover:bg-gray-50"
                  >
                    <div className="flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white">
                      <img
                        src={playlist.imageUrl}
                        alt={playlist.name}
                        className="h-11 w-11 rounded-lg object-cover"
                      />
                    </div>
                    <div className="flex-auto">
                      <a
                        href={playlist.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block font-semibold text-gray-900"
                      >
                        {playlist.name}
                        <span className="absolute inset-0" />
                      </a>
                      <p className="mt-1 text-gray-600">
                        {playlist.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </PopoverPanel>
          </Popover>

          {/* User Playlists */}
          <Popover className="relative">
            <PopoverButton className="flex items-center gap-x-1 text-sm font-semibold text-gray-900">
              Your Playlists
              <ChevronDownIcon
                aria-hidden="true"
                className="h-5 w-5 flex-none text-gray-400"
              />
            </PopoverButton>
            <PopoverPanel className="absolute top-full -left-8 z-50 mt-3 w-screen max-w-md overflow-hidden rounded-3xl bg-white ring-1 shadow-lg ring-gray-900/5">
              <div className="p-4 max-h-72 overflow-y-auto">
                {userPlaylists.map((playlist) => (
                  <div
                    key={playlist.id}
                    className="group relative flex items-center gap-x-6 rounded-lg p-4 text-sm hover:bg-gray-50"
                  >
                    <div className="flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white">
                      <img
                        src={playlist.imageUrl}
                        alt={playlist.name}
                        className="h-11 w-11 rounded-lg object-cover"
                      />
                    </div>
                    <div className="flex-auto">
                      <a
                        href={playlist.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block font-semibold text-gray-900"
                      >
                        {playlist.name}
                        <span className="absolute inset-0" />
                      </a>
                      <p className="mt-1 text-gray-600">
                        {playlist.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </PopoverPanel>
          </Popover>
          <div className="flex items-center gap-x-8">
            <a
              href="/ratings"
              className="text-sm font-semibold text-orange-500"
            >
              View Ratings
            </a>
            <a href="/profile" className="text-sm font-semibold text-gray-900">
              Dashboard
            </a>
          </div>
        </PopoverGroup>
        <div className="hidden lg:flex lg:flex-1 items-center gap-8 relative left-72 mr-2">
          {/* Add the NightMode toggle here */}
          <NightMode />

          {/* Profile Picture with Hover Text */}
          <div className="relative group">
            <button
              onClick={(e) => {
                e.preventDefault(); // Prevents any default link behavior
                router.push("/profile");
              }}
              className="rounded-full border-4 border-orange-500 hover:border-red-600 text-white transition-all"
            >
              <img
                alt="profile image"
                src={session?.user?.image || "/images/default-profile.png"} // Use user's profile image or default
                className="h-10 w-10 rounded-full cursor-pointer"
                onClick={() => router.push("/profile")}
              />
              <div
                className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 px-3 py-1 bg-gray-800 text-white text-sm font-semibold rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                style={{ zIndex: 10 }}
              >
                Profile
              </div>
            </button>
          </div>

          {/* Logout Icon with Hover Text */}
          <div className="relative group -mt-2">
            <button
              onClick={() => {
                signOut(); // Call the signOut function from next-auth
                localStorage.removeItem("token"); // Remove the token from localStorage
                router.push("/"); // Redirect to the login page
              }}
              className="p-1.5 rounded-full bg-red-500 hover:bg-red-600 text-white transition-all"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
            <div
              className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 px-3 py-1 bg-gray-800 text-white text-sm font-semibold rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
              style={{ zIndex: 10 }}
            >
              Log Out
            </div>
          </div>
        </div>
      </nav>
      <Dialog
        open={mobileMenuOpen}
        onClose={setMobileMenuOpen}
        className="lg:hidden"
      >
        <div className="fixed inset-0 z-50" />
        <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div className="flex items-center justify-between">
            <a href="/home" className="-m-1.5 p-1.5 flex items-center gap-3">
              <img
                alt="Odyssey Music Logo"
                src="/icons/musical-odyssey-md.png"
                className="h-10 w-auto"
              />
              <h1 className="text-4xl font-extrabold leading-tight tracking-tighter">
                <LineShadowText
                  className="italic text-primary whitespace-nowrap"
                  shadowColor={shadowColor}
                >
                  Musical Odyssey!
                </LineShadowText>
              </h1>
            </a>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="-m-2.5 rounded-md p-2.5 text-gray-700"
            >
              <span className="sr-only">Close menu</span>
              <XMarkIcon aria-hidden="true" className="h-6 w-6" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/10">
              <div className="space-y-2 py-6">
                {/* My Playlists Section */}
                <Disclosure as="div" className="-mx-3">
                  <DisclosureButton className="group flex w-full items-center justify-between rounded-lg py-2 pr-3.5 pl-3 text-base font-semibold text-gray-900 hover:bg-gray-50">
                    My Playlists
                    <ChevronDownIcon
                      aria-hidden="true"
                      className="h-5 w-5 flex-none group-data-open:rotate-180"
                    />
                  </DisclosureButton>
                  <DisclosurePanel className="mt-2 space-y-2">
                    {playlists.map((playlist) => (
                      <a
                        key={playlist.id}
                        href={playlist.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-x-4 rounded-lg py-2 pr-3 pl-6 text-sm font-semibold text-gray-900 hover:bg-gray-50"
                      >
                        <img
                          src={playlist.imageUrl}
                          alt={playlist.name}
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                        <div>
                          <p>{playlist.name}</p>
                          <p className="text-xs text-gray-600">
                            {playlist.description}
                          </p>
                        </div>
                      </a>
                    ))}
                  </DisclosurePanel>
                </Disclosure>

                {/* Other Menu Items */}
                <a
                  href="#"
                  className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold text-gray-900 hover:bg-gray-50"
                >
                  Features
                </a>
                <Button
                  onClick={() => router.push("/ratings")}
                  className="px-4 py-2 text-lg flex items-center justify-center gap-2 transition-all bg-violet-500 hover:bg-violet-600 text-white rounded-lg"
                >
                  <FaListAlt /> View Ratings
                </Button>
              </div>
              <div className="py-6">
                <Button
                  onClick={() => {
                    signOut(); // Call the signOut function from next-auth
                    localStorage.removeItem("token"); // Remove the token from localStorage
                    router.push("/"); // Redirect to the login page
                  }}
                  className="px-4 py-2 text-lg flex items-center justify-center gap-2 transition-all bg-red-500 hover:bg-red-600 text-white rounded-lg"
                >
                  <XMarkIcon className="h-5 w-5" /> Log Out
                </Button>
              </div>
            </div>
          </div>
        </DialogPanel>
      </Dialog>
    </header>
  );
};

export default Header;
