"use client";

import { usePathname } from "next/navigation";
import { FaSpotify, FaSoundcloud, FaApple, FaYoutube } from "react-icons/fa";
import { useTheme } from "next-themes";
import { LineShadowText } from "@/components/magicui/line-shadow-text";

const Footer = () => {
  const theme = useTheme();
  const shadowColor = theme.resolvedTheme === "dark" ? "white" : "black";
  const pathname = usePathname();
  const isAuthPage =
    pathname === "/register" ||
    pathname === "/login" ||
    pathname === "/" ||
    pathname === "/otp-verification";

  if (isAuthPage) {
    return null;
  }

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-300 dark:border-gray-700">
      <div className="mx-auto w-full max-w-screen-xl p-4 py-6 lg:py-8">
        <div className="md:flex md:justify-between">
          <div className="mb-6 md:mb-0">
            <a href="/home" className="flex items-center">
              <img
                alt="Odyssey Music Logo"
                src="/icons/musical-odyssey-md.png"
                className="h-20 w-auto mr-8"
              />
              <h1 className="text-[clamp(2rem,10vw,5rem)] font-extrabold leading-tight tracking-tighter text-center -ml-4">
                <LineShadowText
                  className="italic text-primary ml-3 whitespace-nowrap"
                  shadowColor={shadowColor}
                >
                  Musical Odyssey!
                </LineShadowText>
              </h1>
            </a>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:gap-6 sm:grid-cols-3">
            <div>
              <h2 className="mb-6 text-sm font-semibold text-gray-900 uppercase dark:text-white">
                Resources
              </h2>
              <ul className="text-gray-500 dark:text-gray-400 font-medium">
                <li className="mb-4">
                  <a href="https://www.spotify.com" className="hover:underline">
                    Spotify
                  </a>
                </li>
                <li>
                  <a href="https://genius.com" className="hover:underline">
                    Genius
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h2 className="mb-6 text-sm font-semibold text-gray-900 uppercase dark:text-white">
                Follow us
              </h2>
              <ul className="text-gray-500 dark:text-gray-400 font-medium">
                <li className="mb-4">
                  <a
                    href="https://www.soundcloud.com"
                    className="hover:underline"
                  >
                    SoundCloud
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.apple.com/music"
                    className="hover:underline"
                  >
                    Apple Music
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h2 className="mb-6 text-sm font-semibold text-gray-900 uppercase dark:text-white">
                Legal
              </h2>
              <ul className="text-gray-500 dark:text-gray-400 font-medium">
                <li className="mb-4">
                  <a href="#" className="hover:underline">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Terms & Conditions
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <hr className="my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8" />
        <div className="sm:flex sm:items-center sm:justify-between">
          <span className="text-sm text-gray-500 sm:text-center dark:text-gray-400">
            © {new Date().getFullYear()}{" "}
            <a href="/home" className="hover:underline">
              Odyssey Music™
            </a>
            . All Rights Reserved.
          </span>
          <div className="flex mt-4 sm:justify-center sm:mt-0">
            <a
              href="https://open.spotify.com/user/31w456o3ccwx76uzg7xi355ukb34?si=405ba34b38b5435f"
              className="text-gray-500 hover:text-gray-900 dark:hover:text-white"
            >
              <FaSpotify className="w-4 h-4" />
              <span className="sr-only">Spotify page</span>
            </a>
            <a
              href="https://www.soundcloud.com"
              className="text-gray-500 hover:text-gray-900 dark:hover:text-white ms-5"
            >
              <FaSoundcloud className="w-4 h-4" />
              <span className="sr-only">SoundCloud page</span>
            </a>
            <a
              href="https://www.apple.com/music"
              className="text-gray-500 hover:text-gray-900 dark:hover:text-white ms-5"
            >
              <FaApple className="w-4 h-4" />
              <span className="sr-only">Apple Music account</span>
            </a>
            <a
              href="https://www.youtube.com"
              className="text-gray-500 hover:text-gray-900 dark:hover:text-white ms-5"
            >
              <FaYoutube className="w-4 h-4" />
              <span className="sr-only">YouTube account</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
