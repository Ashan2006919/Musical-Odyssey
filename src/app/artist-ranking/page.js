"use client";

import { motion } from "framer-motion";
import { Suspense } from "react";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import axios from "axios";
import { MagicCard } from "@/components/magicui/magic-card";
import { LineShadowText } from "@/components/magicui/line-shadow-text";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowUp,
  faArrowDown,
  faUndo,
  faSearch,
  faChartLine,
  faHome,
} from "@fortawesome/free-solid-svg-icons";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ArtistRankingRatingLabel from "@/components/ArtistRankingRatingLabel";
import RatingLabel from "@/components/RatingLabel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import LeaderboardDialog from "@/components/LeaderboardDialog";
import { ArtistSkeleton } from "@/components/ArtistSkeleton";

const ArtistRankingPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [artistData, setArtistData] = useState([]);
  const [filteredArtists, setFilteredArtists] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");
  const [loading, setLoading] = useState(true);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [isViewRatingsDialogOpen, setIsViewRatingsDialogOpen] = useState(false);
  const [isRankingDialogOpen, setIsRankingDialogOpen] = useState(false);
  const { theme } = useTheme();

  const resolvedTheme = theme?.resolvedTheme || "light";
  const shadowColor = resolvedTheme === "dark" ? "white" : "black";

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchArtistRankings = async () => {
      if (!session?.user?.omid) {
        toast.error("User ID (OMID) is missing. Please log in again.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `/api/getArtistRankings?userOmid=${session.user.omid}`
        );
        const data = response.data;

        setArtistData(data);
        setFilteredArtists(data);
      } catch (error) {
        console.error("Error fetching artist rankings:", error);
        toast.error("Failed to load artist rankings.");
      } finally {
        setLoading(false);
      }
    };

    fetchArtistRankings();
  }, [session?.user?.omid]);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = artistData.filter((artist) =>
      artist.name?.toLowerCase().includes(query)
    );
    setFilteredArtists(filtered);
  };

  const handleSortChange = (option) => {
    let newSortDirection = sortDirection;
    let newSortOption = sortOption;

    if (sortOption === option) {
      newSortDirection = sortDirection === "asc" ? "desc" : "asc";
      setSortDirection(newSortDirection);
    } else {
      newSortOption = option;
      newSortDirection = "asc";
      setSortOption(option);
      setSortDirection("asc");
    }

    setFilteredArtists((prev) => {
      const sorted = [...prev].sort((a, b) => {
        const directionMultiplier = newSortDirection === "asc" ? 1 : -1;
        switch (option) {
          case "averageRating":
            return directionMultiplier * (a.averageRating - b.averageRating);
          case "artistName":
            return directionMultiplier * a.name.localeCompare(b.name);
          default:
            return 0;
        }
      });
      return sorted;
    });
  };

  const handleViewRatingsClick = async (artist) => {
    // artist.albums should be an array of { albumId, averageRating }
    if (!artist.albums || artist.albums.length === 0) {
      setSelectedArtist({ ...artist, albums: [] });
      setIsViewRatingsDialogOpen(true);
      return;
    }

    // Fetch album details for each albumId
    const albumsWithDetails = await Promise.all(
      artist.albums.map(async (album) => {
        try {
          const res = await axios.get(
            `/api/spotify/albumDetails?albumId=${album.albumId}`
          );
          const albumData = res.data;
          return {
            albumId: album.albumId,
            name: albumData.name,
            image: albumData.images?.[0]?.url,
            spotifyUrl: albumData.external_urls?.spotify,
            averageRating: album.averageRating,
          };
        } catch (err) {
          // fallback if fetch fails
          return {
            albumId: album.albumId,
            name: "Unknown Album",
            image: "/images/default-album.png",
            spotifyUrl: "",
            averageRating: album.averageRating,
          };
        }
      })
    );

    setSelectedArtist({ ...artist, albums: albumsWithDetails });
    setIsViewRatingsDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="py-5">
        <div className="container mx-auto pb-10">
          <motion.h1
            className="text-[clamp(2rem,10vw,5rem)] font-extrabold leading-tight tracking-tighter text-center mb-10"
            initial={{ y: "-100px", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          >
            Your Ranked
            <LineShadowText
              className="italic text-primary ml-3 whitespace-nowrap"
              shadowColor={shadowColor}
            >
              Artists!
            </LineShadowText>
          </motion.h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-16">
            {Array.from({ length: 6 }).map((_, index) => (
              <ArtistSkeleton key={index} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-5">
      <ToastContainer />
      <div className="container mx-auto pb-10 px-4 sm:px-6 lg:px-8">
        {/* Page Title */}
        <motion.h1
          className="text-[clamp(2rem,10vw,5rem)] font-extrabold leading-tight tracking-tighter text-center mb-10"
          initial={{ y: "-100px", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        >
          Your Ranked
          <LineShadowText
            className="italic text-primary ml-3 whitespace-nowrap"
            shadowColor={shadowColor}
          >
            Artists!
          </LineShadowText>
        </motion.h1>

        {/* Search, Filter, and Sort */}
        <motion.div
          className="mb-10 -mt-4 flex justify-center items-center gap-4"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <button
            onClick={() => {
              setSearchQuery("");
              setSortOption("");
              setFilteredArtists(artistData);
              router.push("/artist-ranking");
            }}
            className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-md transition-all"
            title="Reset Filters"
          >
            <FontAwesomeIcon icon={faUndo} className="text-lg" />
          </button>

          <Input
            type="text"
            placeholder="Search by artist name..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full max-w-md px-4 py-2 border rounded-lg"
          />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Sort By</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuItem onClick={() => handleSortChange("rating")}>
                Rating{" "}
                <FontAwesomeIcon
                  icon={
                    sortOption === "rating" && sortDirection === "asc"
                      ? faArrowUp
                      : faArrowDown
                  }
                  className="ml-2"
                />
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange("name")}>
                Name{" "}
                <FontAwesomeIcon
                  icon={
                    sortOption === "name" && sortDirection === "asc"
                      ? faArrowUp
                      : faArrowDown
                  }
                  className="ml-2"
                />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </motion.div>

        {/* Artist Cards or No Content Message */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.7 }}
        >
          {filteredArtists.length > 0 ? (
            filteredArtists
              .sort((a, b) => b.averageRating - a.averageRating)
              .map((artist, index) => (
                <MagicCard
                  className="cursor-pointer flex-col whitespace-nowrap shadow-md rounded-lg overflow-hidden relative transition-transform duration-300 hover:scale-105 hover:shadow-lg"
                  gradientColor={
                    resolvedTheme === "dark" ? "#262626" : "#D9D9D955"
                  }
                  key={artist.name}
                >
                  <div className="relative">
                    {/* Ranking Badge */}
                    <div
                      className="absolute top-2 left-2 bg-blue-500 text-white text-lg font-bold py-2 px-4 rounded-full shadow-md z-10 cursor-pointer"
                      onClick={() => setIsRankingDialogOpen(true)}
                    >
                      #{index + 1}
                    </div>

                    {/* Artist Image as Link */}
                    {artist.spotifyProfile ? (
                      <a
                        href={artist.spotifyProfile}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <img
                          src={artist.image || "/images/default-artist.png"}
                          alt={artist.name}
                          className="w-full aspect-square object-cover"
                        />
                      </a>
                    ) : (
                      <img
                        src={artist.image || "/images/default-artist.png"}
                        alt={artist.name}
                        className="w-full aspect-square object-cover"
                      />
                    )}
                  </div>

                  {/* Artist Name as Link */}
                  <div className="flex justify-between items-center mt-4 px-4">
                    {artist.spotifyProfile ? (
                      <a
                        href={artist.spotifyProfile}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-3xl font-bold text-blue-600 hover:underline text-wrap"
                      >
                        {artist.name}
                      </a>
                    ) : (
                      <span className="text-3xl font-bold text-wrap">
                        {artist.name}
                      </span>
                    )}
                    <ArtistRankingRatingLabel rating={artist.averageRating} />
                  </div>
                  <p className="text-gray-700 dark:text-gray-200 text-lg font-semibold px-4">
                    Average Rating:{" "}
                    <span className="font-medium text-gray-700 dark:text-gray-200">
                      {artist.averageRating.toFixed(1)}
                    </span>
                  </p>

                  {/* Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 mt-4 px-4 pb-4">
                    <Button
                      className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2 w-full sm:w-auto"
                      onClick={() => handleViewRatingsClick(artist)}
                    >
                      <FontAwesomeIcon icon={faSearch} /> View Ratings
                    </Button>
                    <Button
                      className="bg-orange-500 hover:bg-orange-600 text-white flex items-center gap-2 w-full sm:w-auto"
                      onClick={() =>
                        console.log(`View Trends for ${artist.name}`)
                      }
                    >
                      <FontAwesomeIcon icon={faChartLine} /> View Trends
                    </Button>
                  </div>
                </MagicCard>
              ))
          ) : (
            <motion.div
              className="text-center mt-6 flex flex-col items-center justify-center col-span-full"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.7 }}
            >
              <p className="text-lg text-gray-600 mb-6">
                You haven't ranked any artists yet. Start exploring and ranking
                your favorite artists now!
              </p>
              <Button
                onClick={() => router.push("/")}
                className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white text-lg font-semibold rounded-lg shadow-md transition-all flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faHome} className="text-xl" />
                Go to Home Page
              </Button>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* View Ratings Dialog */}
      {selectedArtist && (
        <Dialog
          open={isViewRatingsDialogOpen}
          onOpenChange={setIsViewRatingsDialogOpen}
        >
          <DialogContent className="max-w-[90%] sm:max-w-[600px] px-2 sm:px-8 flex flex-col mx-1 sm:mx-auto rounded-lg">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                Album Ratings for {selectedArtist.name}
              </DialogTitle>
              <div className="flex justify-end mb-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">Sort By</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuLabel>Sort Albums</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        const sortedAlbums = [...selectedArtist.albums].sort(
                          (a, b) =>
                            sortOption === "rating" && sortDirection === "asc"
                              ? a.averageRating - b.averageRating
                              : b.averageRating - a.averageRating
                        );
                        setSortOption("rating");
                        setSortDirection((prev) =>
                          prev === "asc" ? "desc" : "asc"
                        );
                        setSelectedArtist({
                          ...selectedArtist,
                          albums: sortedAlbums,
                        });
                      }}
                    >
                      Rating{" "}
                      <FontAwesomeIcon
                        icon={
                          sortOption === "rating" && sortDirection === "asc"
                            ? faArrowUp
                            : faArrowDown
                        }
                        className="ml-2"
                      />
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        const sortedAlbums = [...selectedArtist.albums].sort(
                          (a, b) =>
                            sortOption === "albumName" &&
                            sortDirection === "asc"
                              ? a.name.localeCompare(b.name)
                              : b.name.localeCompare(a.name)
                        );
                        setSortOption("albumName");
                        setSortDirection((prev) =>
                          prev === "asc" ? "desc" : "asc"
                        );
                        setSelectedArtist({
                          ...selectedArtist,
                          albums: sortedAlbums,
                        });
                      }}
                    >
                      Album Name{" "}
                      <FontAwesomeIcon
                        icon={
                          sortOption === "albumName" && sortDirection === "asc"
                            ? faArrowUp
                            : faArrowDown
                        }
                        className="ml-2"
                      />
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        setSortOption("");
                        setSortDirection("asc");
                        setSelectedArtist({
                          ...selectedArtist,
                          albums: [...selectedArtist.albums],
                        });
                        }}
                      >
                        Clear Sorting
                      </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    </div>
                  </DialogHeader>
                  <hr />
                  <div className="grid gap-4 pb-4 overflow-y-auto flex-grow max-h-[400px] px-4">
                    {selectedArtist.albums?.map((album) => (
                    <div
                      key={album.albumId}
                      className="flex items-center justify-between py-2 rounded-lg shadow-sm"
                    >
                      <div className="flex items-center gap-4">
                      <img
                        src={album.image || "/images/default-album.png"}
                        alt={album.name}
                        className="h-12 w-12 rounded-lg border-2 border-gray-300 dark:border-blue-400 transition-colors"
                      />
                      <div>
                        {/* Album Name as Link */}
                      {album.spotifyUrl ? (
                        <a
                          href={album.spotifyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-lg font-semibold text-blue-600 hover:underline"
                        >
                          {album.name}
                        </a>
                      ) : (
                        <span className="text-base font-semibold text-gray-600 dark:text-gray-300">
                          {album.name}
                        </span>
                      )}
                      <p
                        className="text-sm text-gray-500 cursor-pointer hover:underline"
                        onClick={() => {
                          navigator.clipboard.writeText(album.albumId);
                          toast.success("Album ID copied to clipboard!");
                        }}
                      >
                        #{album.albumId}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-semibold">
                      {album.averageRating.toFixed(1)}
                    </p>
                    <RatingLabel rating={album.averageRating} />
                  </div>
                </div>
              ))}
            </div>
            <DialogFooter className="flex flex-col gap-4">
              <div className="flex justify-end gap-4">
                <Button
                  variant="outline"
                  onClick={() => setIsViewRatingsDialogOpen(false)}
                >
                  Close
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Leaderboard Dialog */}
      <LeaderboardDialog
        isOpen={isRankingDialogOpen}
        onClose={() => setIsRankingDialogOpen(false)}
        artists={filteredArtists}
      />
    </div>
  );
};

const ArtistRankingPageWrapper = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ArtistRankingPage />
    </Suspense>
  );
};

export default ArtistRankingPageWrapper;
