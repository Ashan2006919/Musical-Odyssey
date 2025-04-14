"use client";
import Image from "next/image";
import React, { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useOutsideClick } from "@/hooks/use-outside-click";
import { useTheme } from "next-themes";
import { Input } from "@/components/ui/input";
import { AnimatedSubscribeButton } from "@/components/magicui/animated-subscribe-button";
import { ChevronRightIcon } from "lucide-react";
import Modal from "@/components/Modal"; // Import the Modal component
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { FaSpotify, FaStar } from "react-icons/fa";

export default function ExpandableCardDemo() {
  const [active, setActive] = useState(null);
  const ref = useRef(null);
  const id = useId();
  const [query, setQuery] = useState("");
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [error, setError] = useState("");
  const [albumData, setAlbumData] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === "Escape") {
        setActive(false);
      }
    }

    if (active && typeof active === "object") {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active]);

  useOutsideClick(ref, () => setActive(null));

  const handleSearch = async () => {
    if (!query.trim()) {
      setError("Please enter an album name.");
      return;
    }

    setLoadingSearch(true);
    setError("");
    setAlbumData(null);

    try {
      // Fetch Spotify access token
      const tokenResponse = await fetch("/api/spotify");
      const tokenData = await tokenResponse.json();

      if (!tokenResponse.ok) {
        throw new Error(
          `Error fetching token: ${tokenData.error || "Unknown error"}`
        );
      }

      const access_token = tokenData.access_token;
      if (!access_token) {
        setError("Failed to retrieve access token.");
        setLoadingSearch(false);
        return;
      }

      // Fetch multiple album results
      const searchResponse = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(
          query
        )}&type=album&limit=5`,
        {
          headers: { Authorization: `Bearer ${access_token}` },
        }
      );

      const searchData = await searchResponse.json();

      if (!searchResponse.ok) {
        throw new Error(
          `Error searching album: ${
            searchData.error?.message || "Unknown error"
          }`
        );
      }

      if (searchData.albums?.items.length === 0) {
        setError("No album found. Try a different name.");
        setLoadingSearch(false);
        return;
      }

      // Set the search results to state
      setSearchResults(searchData.albums.items); // Store all album options
      setIsModalOpen(true); // Open the modal to display options
    } catch (err) {
      console.error("Error fetching album:", err);
      setError(err.message || "Failed to fetch album data.");
    } finally {
      setLoadingSearch(false);
    }
  };

  return (
    <>
      {/* Animated Search Input, Search Button, and Filter Button */}
      <motion.div
        className="flex items-center justify-center gap-4 mt-8 w-full max-w-lg"
        initial={{ y: "-100px", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeInOut", delay: 0.5 }}
      >
        {/* Search Input */}
        <Input
          type="text"
          placeholder="Enter album name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="p-4 text-lg border rounded-md shadow-lg focus:ring-2 focus:ring-primary focus:outline-none w-full max-w-md h-11 transition-all duration-300 ease-in-out"
        />

        {/* Search Button */}
        <AnimatedSubscribeButton
          className="w-36 p-4 text-lg rounded-md shadow-lg bg-primary text-white hover:bg-primary-dark transition-all duration-300 ease-in-out flex items-center justify-center h-11"
          onClick={handleSearch}
        >
          <span className="group inline-flex items-center">
            <span>Search</span>
          </span>
          <span>
            <ChevronRightIcon className="ml-1 size-4 transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </AnimatedSubscribeButton>
      </motion.div>
  

      {/* Expanded Card View */}
      <AnimatePresence>
        {active && typeof active === "object" && (
          <div className="fixed inset-0 grid place-items-center z-[100]">
            <motion.div
              layoutId={`card-${active.title}-${id}`}
              className="w-full max-w-[500px] h-full md:h-fit md:max-h-[90%] flex flex-col bg-white dark:bg-neutral-900 sm:rounded-3xl overflow-hidden"
            >
              {/* Enlarged Album Cover */}
              <motion.div layoutId={`image-${active.title}-${id}`}>
                <Image
                  priority
                  width={500}
                  height={500}
                  src={active.src}
                  alt={active.title}
                  className="w-full h-80 lg:h-80 sm:rounded-tr-lg sm:rounded-tl-lg object-cover object-top"
                />
              </motion.div>

              <div>
                <div className="flex justify-between items-start p-4">
                  <div>
                    {/* Enlarged Album Title */}
                    <motion.h3
                      layoutId={`title-${active.title}-${id}`}
                      className="font-bold text-neutral-700 dark:text-neutral-200 text-lg"
                    >
                      {active.title}
                    </motion.h3>

                    {/* Enlarged Artist Name */}
                    <motion.p
                      layoutId={`description-${active.description}-${id}`}
                      className="text-neutral-600 dark:text-neutral-400 text-sm"
                    >
                      {active.description}
                    </motion.p>
                  </div>

                  {/* Call-to-Action Button */}
                  <motion.a
                    layoutId={`button-${active.title}-${id}`}
                    href={active.ctaLink}
                    target="_blank"
                    className="px-4 py-3 text-sm rounded-full font-bold bg-green-500 text-white"
                  >
                    {active.ctaText}
                  </motion.a>
                </div>

                {/* Additional Content */}
                <div className="pt-4 relative px-4">
                  <motion.div
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="text-neutral-600 text-xs md:text-sm lg:text-base h-40 md:h-fit pb-10 flex flex-col items-start gap-4 overflow-auto dark:text-neutral-400"
                  >
                    {typeof active.content === "function"
                      ? active.content()
                      : active.content}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
   
      <AnimatePresence>
        {active && typeof active === "object" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 h-full w-full z-10"
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {active && typeof active === "object" ? (
          <div className="fixed inset-0 grid place-items-center z-[100]">
            <motion.button
              key={`button-${active.title}-${id}`}
              layout
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
                transition: {
                  duration: 0.05,
                },
              }}
              className="flex absolute top-2 right-2 lg:hidden items-center justify-center bg-white rounded-full h-6 w-6"
              onClick={() => setActive(null)}
            >
              <CloseIcon />
            </motion.button>
            <motion.div
              layoutId={`card-${active.title}-${id}`}
              ref={ref}
              className="w-full max-w-[500px]  h-full md:h-fit md:max-h-[90%]  flex flex-col bg-white dark:bg-neutral-900 sm:rounded-3xl overflow-hidden"
            >
              <motion.div layoutId={`image-${active.title}-${id}`}>
                <Image
                  priority
                  width={200}
                  height={200}
                  src={active.src}
                  alt={active.title}
                  className="w-full h-80 lg:h-80 sm:rounded-tr-lg sm:rounded-tl-lg object-cover object-top"
                />
              </motion.div>

              <div>
                <div className="flex justify-between items-start p-4">
                  <div className="">
                    <motion.h3
                      layoutId={`title-${active.title}-${id}`}
                      className="font-bold text-neutral-700 dark:text-neutral-200"
                    >
                      {active.title}
                    </motion.h3>
                    <motion.p
                      layoutId={`description-${active.description}-${id}`}
                      className="text-neutral-600 dark:text-neutral-400"
                    >
                      {active.description}
                    </motion.p>
                  </div>

                  <motion.a
                    layoutId={`button-${active.title}-${id}`}
                    href={active.ctaLink}
                    target="_blank"
                    className="px-4 py-3 text-sm rounded-full font-bold bg-green-500 text-white"
                  >
                    {active.ctaText}
                  </motion.a>
                </div>
                <div className="pt-4 relative px-4">
                  <motion.div
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-neutral-600 text-xs md:text-sm lg:text-base h-40 md:h-fit pb-10 flex flex-col items-start gap-4 overflow-auto dark:text-neutral-400 [mask:linear-gradient(to_bottom,white,white,transparent)] [scrollbar-width:none] [-ms-overflow-style:none] [-webkit-overflow-scrolling:touch]"
                  >
                    {typeof active.content === "function"
                      ? active.content()
                      : active.content}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
      <ul className="max-w-2xl mx-auto w-full gap-4">
        {searchResults.length > 0 ? (
          searchResults.map((album) => (
            <motion.div
              layoutId={`card-${album.name}-${id}`}
              key={`card-${album.name}-${id}`}
              onClick={() =>
                setActive({
                  title: album.name,
                  description: album.artists[0]?.name,
                  src: album.images[0]?.url,
                  ctaText: "View",
                  ctaLink: album.external_urls.spotify,
                  content: () => (
                    <p>
                      Album by {album.artists[0]?.name}. Explore more on{" "}
                      <a
                        href={album.external_urls.spotify}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 underline"
                      >
                        Spotify
                      </a>
                      .
                    </p>
                  ),
                })
              }
              className="p-4 flex flex-col md:flex-row justify-between items-center hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-xl cursor-pointer"
            >
              <div className="flex gap-4 flex-col md:flex-row">
                <motion.div
                  layoutId={`image-${album.name}-${id}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <Image
                    width={100}
                    height={100}
                    src={album.images[0]?.url}
                    alt={album.name}
                    className="h-40 w-40 md:h-14 md:w-14 rounded-lg object-cover object-top"
                  />
                </motion.div>
                <div>
                  <motion.h3
                    layoutId={`title-${album.name}-${id}`}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="font-medium text-neutral-800 dark:text-neutral-200 text-center md:text-left"
                  >
                    {album.name}
                  </motion.h3>
                  <motion.p
                    layoutId={`description-${album.name}-${id}`}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-neutral-600 dark:text-neutral-400 text-center md:text-left"
                  >
                    {album.artists[0]?.name}
                  </motion.p>
                </div>
              </div>
              <motion.button
                layoutId={`button-${album.name}-${id}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="px-4 py-2 text-sm rounded-full font-bold bg-gray-100 hover:bg-green-500 hover:text-white text-black"
              >
                View
              </motion.button>
            </motion.div>
          ))
        ) : (
          <p className="text-center text-neutral-600 dark:text-neutral-400">
            No results found.
          </p>
        )}
      </ul>

      {/* Search Results Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="p-4">
          <h2 className="text-lg font-bold text-neutral-800 dark:text-neutral-200 mb-4">
            Search Results
          </h2>
          {searchResults.length > 0 ? (
            <ul className="space-y-4">
              {searchResults.map((album) => (
                <motion.div
                  layoutId={`card-${album.name}-${id}`}
                  key={`card-${album.name}-${id}`}
                  onClick={() => {
                    setActive({
                      title: album.name,
                      description: album.artists[0]?.name,
                      src: album.images[0]?.url,
                      ctaText: "View",
                      ctaLink: album.external_urls.spotify,
                      content: () => (
                        <p>
                          Album by {album.artists[0]?.name}. Explore more on{" "}
                          <a
                            href={album.external_urls.spotify}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 underline"
                          >
                            Spotify
                          </a>
                          .
                        </p>
                      ),
                    });
                    setIsModalOpen(false); // Close modal when an album is selected
                  }}
                  className="p-4 flex flex-col md:flex-row justify-between items-center hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-xl cursor-pointer"
                >
                  <div className="flex gap-4 flex-col md:flex-row">
                    <motion.div
                      layoutId={`image-${album.name}-${id}`}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                    >
                      <Image
                        width={100}
                        height={100}
                        src={album.images[0]?.url}
                        alt={album.name}
                        className="h-40 w-40 md:h-14 md:w-14 rounded-lg object-cover object-top"
                      />
                    </motion.div>
                    <div>
                      <motion.h3
                        layoutId={`title-${album.name}-${id}`}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="font-medium text-neutral-800 dark:text-neutral-200 text-center md:text-left"
                      >
                        {album.name}
                      </motion.h3>
                      <motion.p
                        layoutId={`description-${album.name}-${id}`}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-neutral-600 dark:text-neutral-400 text-center md:text-left"
                      >
                        {album.artists[0]?.name}
                      </motion.p>
                    </div>
                  </div>
                  <motion.button
                    layoutId={`button-${album.name}-${id}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="px-4 py-2 text-sm rounded-full font-bold bg-gray-100 hover:bg-green-500 hover:text-white text-black"
                  >
                    View
                  </motion.button>
                </motion.div>
              ))}
            </ul>
          ) : (
            <p className="text-center text-neutral-600 dark:text-neutral-400">
              No results found.
            </p>
          )}
        </div>
      </Modal>
    </>
  );
}

export const CloseIcon = () => {
  return (
    <motion.svg
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      exit={{
        opacity: 0,
        transition: {
          duration: 0.05,
        },
      }}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 text-black"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M18 6l-12 12" />
      <path d="M6 6l12 12" />
    </motion.svg>
  );
};
