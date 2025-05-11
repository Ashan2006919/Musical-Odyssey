"use client";

import { motion } from "framer-motion"; // Import Framer Motion
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import ProfileDetails from "@/components/profile-components/profile-details";
import { Input } from "@/components/ui/input";
import AddPlaylistDialog from "@/components/AddPlaylistDialog";
import { LineShadowText } from "@/components/magicui/line-shadow-text";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaTrash } from "react-icons/fa";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faArrowUp,
  faArrowDown,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import RatingLabel from "@/components/RatingLabel"; // Import the RatingLabel component
import { MagicCard } from "@/components/magicui/magic-card";
import TiltedCard from "@/blocks/Components/TiltedCard/TiltedCard";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { FaGoogle, FaGithub, FaSpotify, FaUser } from "react-icons/fa"; // Import provider icons
import Flags from "react-world-flags"; // Import country flags
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";

countries.registerLocale(enLocale); // Register the English locale

const ProfilePage = () => {
  const { data: session, status, update } = useSession();
  const [profileImage, setProfileImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [date, setDate] = useState(new Date());
  const [userPlaylists, setUserPlaylists] = useState([]);
  const [predefinedPlaylists, setPredefinedPlaylists] = useState([]);
  const [filteredPredefinedPlaylists, setFilteredPredefinedPlaylists] =
    useState([]);
  const [filteredUserPlaylists, setFilteredUserPlaylists] = useState([]);
  const [predefinedSearchQuery, setPredefinedSearchQuery] = useState(""); // For searching predefined playlists
  const [userSearchQuery, setUserSearchQuery] = useState(""); // For searching user playlists
  const [isDialogOpen, setIsDialogOpen] = useState(false); // For the add playlist dialog
  const [albumRatingsCount, setAlbumRatingsCount] = useState(0); // New state for album ratings count
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [playlistToDelete, setPlaylistToDelete] = useState(null);
  const [ratedAlbums, setRatedAlbums] = useState([]); // State for rated albums
  const [albumSearchQuery, setAlbumSearchQuery] = useState(""); // State for album search query
  const [filteredRatedAlbums, setFilteredRatedAlbums] = useState([]); // State for filtered albums
  const [sortOption, setSortOption] = useState(""); // State for sorting option
  const [sortDirection, setSortDirection] = useState("asc"); // State for sorting direction
  const theme = useTheme();
  const shadowColor = theme.resolvedTheme === "dark" ? "white" : "black";
  const router = useRouter();

  const handleToastMessage = (message, type) => {
    if (type === "success") {
      toast.success(message); // Display the success message
    } else if (type === "error") {
      toast.error(message); // Display the error message
    }
  };

  const handleSortChange = (option) => {
    const direction =
      sortOption === option && sortDirection === "asc" ? "desc" : "asc";
    setSortOption(option);
    setSortDirection(direction);

    const sortedAlbums = [...filteredRatedAlbums].sort((a, b) => {
      if (option === "rating") {
        return direction === "asc"
          ? a.averageRating - b.averageRating
          : b.averageRating - a.averageRating;
      } else if (option === "releaseDate") {
        return direction === "asc"
          ? new Date(a.releaseDate) - new Date(b.releaseDate)
          : new Date(b.releaseDate) - new Date(a.releaseDate);
      } else if (option === "albumName") {
        return direction === "asc"
          ? a.albumName.localeCompare(b.albumName)
          : b.albumName.localeCompare(a.albumName);
      }
      return 0;
    });

    setFilteredRatedAlbums(sortedAlbums);
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  // Fetch predefined playlists (stored in the database)
  useEffect(() => {
    const fetchPredefinedPlaylists = async () => {
      try {
        const response = await fetch(`/api/predefinedPlaylists`); // Use the new endpoint
        const data = await response.json();
        setPredefinedPlaylists(data.playlists || []);
        setFilteredPredefinedPlaylists(data.playlists || []); // Initialize filtered playlists
      } catch (error) {
        console.error("Error fetching predefined playlists:", error);
        toast.error("Failed to fetch predefined playlists.");
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
        setFilteredUserPlaylists(data.playlists || []); // Initialize filtered playlists
      } catch (error) {
        console.error("Error fetching user playlists:", error);
      }
    };

    if (session?.user?.omid) {
      fetchUserPlaylists();
    }
  }, [session?.user?.omid]);

  // Fetch the album ratings count
  useEffect(() => {
    const fetchAlbumRatingsCount = async () => {
      try {
        const response = await fetch(
          `/api/getRatings?userOmid=${session?.user?.omid}`
        );
        const data = await response.json();
        setAlbumRatingsCount(data.length || 0); // Set the count based on the number of rated albums
      } catch (error) {
        console.error("Error fetching album ratings count:", error);
      }
    };

    if (session?.user?.omid) {
      fetchAlbumRatingsCount();
    }
  }, [session?.user?.omid]);

  useEffect(() => {
    const fetchRatedAlbums = async () => {
      try {
        if (!session?.user?.omid) {
          console.error("User OMID is missing.");
          return;
        }

        // Fetch ratings for the logged-in user
        const response = await axios.get(
          `/api/getRatings?userOmid=${session.user.omid}`
        );
        const ratings = response.data;

        console.log("Fetched ratings:", ratings); // Debug: Log the fetched ratings

        // Process the ratings data
        const updatedRatings = await Promise.all(
          ratings.map(async (rating) => {
            if (!rating.albumId) {
              console.warn("Missing albumId for rating:", rating);
              return null; // Skip ratings without an albumId
            }

            try {
              console.log(
                "Fetching album details for albumId:",
                rating.albumId
              );
              const albumResponse = await axios.get(
                `/api/spotify/albumDetails`,
                {
                  params: { albumId: rating.albumId },
                }
              );

              const albumData = albumResponse.data;

              // Debug: Log the album details and averageRating
              console.log(
                "Album details fetched:",
                albumData,
                "Average Rating:",
                rating.averageRating,
                "Type:",
                typeof rating.averageRating
              );

              return {
                albumId: rating.albumId,
                albumName: albumData.name,
                albumArtist: albumData.artists
                  .map((artist) => artist.name)
                  .join(", "),
                albumCover: albumData.images[0]?.url,
                releaseDate: albumData.release_date,
                averageRating: parseFloat(rating.averageRating), // Ensure it's a number
                trackRatings: Object.entries(rating.ratings).map(
                  ([trackId, score]) => ({
                    trackId,
                    score,
                  })
                ),
              };
            } catch (error) {
              console.error(
                `Failed to fetch album details for albumId: ${rating.albumId}`,
                error
              );

              // Debug: Log fallback data
              console.log(
                "Using fallback data for albumId:",
                rating.albumId,
                "Average Rating:",
                rating.averageRating,
                "Type:",
                typeof rating.averageRating
              );

              return {
                albumId: rating.albumId,
                albumName: "Unknown Album",
                albumArtist: "Unknown Artist",
                albumCover: "/images/default-album.png",
                averageRating: parseFloat(rating.averageRating), // Ensure it's a number
                trackRatings: Object.entries(rating.ratings).map(
                  ([trackId, score]) => ({
                    trackId,
                    score,
                  })
                ),
              };
            }
          })
        );

        console.log("Processed rated albums:", updatedRatings); // Debug: Log the processed albums

        setRatedAlbums(updatedRatings.filter((album) => album !== null)); // Filter out null values
        setFilteredRatedAlbums(
          updatedRatings.filter((album) => album !== null)
        );
      } catch (error) {
        console.error("Error fetching rated albums:", error);
      }
    };

    if (session?.user?.omid) {
      fetchRatedAlbums();
    }
  }, [session?.user?.omid]);

  const handlePredefinedSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setPredefinedSearchQuery(query);

    const filtered = predefinedPlaylists.filter((playlist) =>
      playlist.name.toLowerCase().includes(query)
    );
    setFilteredPredefinedPlaylists(filtered);
  };

  const handleUserSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setUserSearchQuery(query);

    const filtered = userPlaylists.filter((playlist) =>
      playlist.name.toLowerCase().includes(query)
    );
    setFilteredUserPlaylists(filtered);
  };

  const handleAlbumSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setAlbumSearchQuery(query);

    const filtered = ratedAlbums.filter((album) =>
      album.name.toLowerCase().includes(query)
    );
    setFilteredRatedAlbums(filtered);
  };

  const handlePlaylistAdded = (newPlaylist) => {
    setUserPlaylists((prev) => [...prev, newPlaylist]); // Add the new playlist to the grid
    setFilteredUserPlaylists((prev) => [...prev, newPlaylist]); // Update filtered playlists
  };

  const handleDeleteClick = (playlistId) => {
    setPlaylistToDelete(playlistId); // Set the playlist to delete
    setIsConfirmDialogOpen(true); // Open the confirmation dialog
  };

  const handleConfirmDelete = async () => {
    setIsConfirmDialogOpen(false); // Close the dialog
    if (!playlistToDelete) return;

    try {
      const response = await fetch(`/api/deletePlaylist`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          playlistId: playlistToDelete,
          userOmid: session.user.omid,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        toast.error(data.message || "Failed to delete playlist.");
        return;
      }

      // Remove the playlist from the state
      setUserPlaylists((prev) =>
        prev.filter((playlist) => playlist.id !== playlistToDelete)
      );
      setFilteredUserPlaylists((prev) =>
        prev.filter((playlist) => playlist.id !== playlistToDelete)
      );
      toast.success("Playlist deleted successfully!");
    } catch (error) {
      console.error("Error deleting playlist:", error);
      toast.error(
        "An error occurred while deleting the playlist. Please try again."
      );
    } finally {
      setPlaylistToDelete(null); // Reset the playlist to delete
    }
  };

  if (status === "loading") {
    return <div className="text-center mt-10">Loading...</div>;
  }

  if (!session) {
    return (
      <div className="text-center mt-10">
        Please log in to view your profile
      </div>
    );
  }

  const { user } = session;

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setUploading(true);

      try {
        const fileName = file.name;
        const mimeType = file.type;

        // Read the file as base64
        const reader = new FileReader();
        reader.onloadend = async () => {
          const fileContent = reader.result.split(",")[1]; // Get base64 content

          const response = await fetch("/api/uploadImage", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              fileName,
              fileType: mimeType,
              fileContent,
              userOmid: user.omid,
            }),
          });

          if (!response.ok) {
            const data = await response.json();
            alert(data.message || "Failed to upload image.");
            return;
          }

          const { imageUrl } = await response.json();

          if (update) {
            await update({ image: imageUrl });
          }

          alert("Profile image updated successfully!");
        };

        reader.readAsDataURL(file); // Read the file as a data URL
      } catch (error) {
        console.error("Error updating profile image:", error);
        alert("An error occurred while updating the profile image.");
      } finally {
        setUploading(false);
      }
    }
  };

  return (
    <motion.div
      className="px-8 md:px-16 py-4 md:py-8 flex flex-col items-center justify-center min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      {/* Animated Title */}
      <motion.h1
        className="text-[clamp(2rem,10vw,5rem)] font-extrabold leading-tight tracking-tighter text-center mb-10"
        initial={{ y: "-100px", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      >
        Your
        <LineShadowText
          className="italic text-primary ml-3 whitespace-nowrap"
          shadowColor={shadowColor}
        >
          Dashboard!
        </LineShadowText>
      </motion.h1>

      {/* Animated Cards Grid */}
      <motion.div
        className="grid gap-6 grid-cols-4 auto-rows-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        {/* Profile Card */}
        <motion.Card
          className="col-span-4 md:col-span-1 shadow-md rounded-lg row-span-3 md:row-span-2"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <MagicCard
            gradientColor={theme === "dark" ? "#262626" : "#D9D9D955"}
            className="p-4"
          >
            <CardHeader>
              <CardTitle>
                <Badge className="w-fit -ml-3 -mt-3 absolute">Profile</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center">
                <motion.div
                  className="relative mb-4"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                >
                  <Image
                    src={
                      profileImage
                        ? URL.createObjectURL(profileImage)
                        : user.image || "/images/default-profile.png"
                    }
                    alt="Profile"
                    width={100}
                    height={100}
                    className="rounded-full border-2 border-orange-500 shadow-md"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </motion.div>
                <p className="text-2xl font-semibold">{user.name || "N/A"}</p>

                <p className="text-gray-600 dark:text-gray-400 text-xs">
                  #
                  <span
                    onClick={() => navigator.clipboard.writeText(user.omid)}
                  >
                    {user.omid || "N/A"}
                  </span>
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  {user.email || "N/A"}
                </p>

                {/* Logged in via */}
                <p className="text-gray-600 flex items-center">
                  Logged in via:{" "}
                  <span className="font-bold flex items-center ml-2">
                    {user?.provider === "google" && (
                      <>
                        Google <FaGoogle className="text-red-500 mr-1" />
                      </>
                    )}
                    {user?.provider === "github" && (
                      <>
                        GitHub <FaGithub className="text-gray-800 mr-1" />
                      </>
                    )}
                    {user?.provider === "spotify" && (
                      <>
                        Spotify <FaSpotify className="text-green-500 mr-1" />
                      </>
                    )}
                    {!user?.provider && (
                      <>
                        Username/Password{" "}
                        <FaUser className="text-gray-500 mr-1" />
                      </>
                    )}
                  </span>
                </p>

                {/* Country Information */}
                <p className="text-gray-600 mt-2 flex items-center">
                  Country:{" "}
                  <span className="font-bold flex items-center ml-2">
                    {user.country ? (
                      <>
                        {user.country}
                        <Flags
                          code={
                            countries.getAlpha2Code(user.country, "en") || "US"
                          } // Convert country name to ISO code
                          className="w-5 h-5 mr-2"
                        />
                      </>
                    ) : (
                      "Unknown"
                    )}
                  </span>
                </p>

                {/* Album Ratings Counter */}
                <p className="text-gray-600 mt-4">
                  Albums Rated:{" "}
                  <span className="font-bold">{albumRatingsCount}</span>
                </p>
              </div>
            </CardContent>
          </MagicCard>
        </motion.Card>

        {/* Rated Albums Card */}
        <motion.Card
          className="col-span-4 md:col-span-3 shadow-md rounded-lg row-span-3 md:row-span-2"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <MagicCard
            gradientColor={theme === "dark" ? "#262626" : "#D9D9D955"}
            className="p-4"
          >
            <CardHeader>
              <CardTitle>
                <Badge className="w-fit ml-2 -mt-4 absolute text-sm">
                  Rated Albums
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Inner Grid for Search Bar and Sorting */}
              <div className="grid grid-cols-3 gap-4">
                {/* Search Bar and Sorting Button */}
                <div className="col-span-3 lg:col-span-3 sm:col-span-2 mb-4 flex justify-between items-center">
                  <Input
                    type="text"
                    placeholder="Search rated albums..."
                    value={albumSearchQuery}
                    onChange={(e) => {
                      const query = e.target.value.toLowerCase();
                      setAlbumSearchQuery(query);

                      const filtered = ratedAlbums.filter((album) =>
                        album.albumName.toLowerCase().includes(query)
                      );
                      setFilteredRatedAlbums(filtered);
                    }}
                    className="w-full px-4 py-2 border rounded-lg"
                  />

                  {/* Sorting Button */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline">Sort By</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                      <DropdownMenuLabel>Sort Albums</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleSortChange("rating")}
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
                        onClick={() => handleSortChange("releaseDate")}
                      >
                        Release Date{" "}
                        <FontAwesomeIcon
                          icon={
                            sortOption === "releaseDate" &&
                            sortDirection === "asc"
                              ? faArrowUp
                              : faArrowDown
                          }
                          className="ml-2"
                        />
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleSortChange("albumName")}
                      >
                        Album Name{" "}
                        <FontAwesomeIcon
                          icon={
                            sortOption === "albumName" &&
                            sortDirection === "asc"
                              ? faArrowUp
                              : faArrowDown
                          }
                          className="ml-2"
                        />
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => {
                          setSortOption(""); // Reset sorting
                          setSortDirection("asc"); // Reset sort direction
                          setFilteredRatedAlbums(ratedAlbums); // Reset to original order
                        }}
                      >
                        Clear Sorting
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Scrollable Album Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-h-96 overflow-y-auto col-span-3 lg:col-span-3 sm:col-span-2 pr-4">
                  {filteredRatedAlbums.length > 0 ? (
                    filteredRatedAlbums.map((album) => (
                      <MagicCard
                        key={album.albumId}
                        gradientColor={
                          theme === "dark" ? "#262626" : "#D9D9D955"
                        }
                        className="flex items-center justify-between gap-4 p-6 border rounded-lg shadow-sm hover:shadow-md transition"
                      >
                        {/* Left Section */}
                        <div className="flex items-center gap-4">
                          <img
                            src={album.albumCover}
                            alt={album.albumName}
                            className="h-24 w-24 rounded-lg object-cover"
                          />
                          <div>
                            <a
                              href={`https://open.spotify.com/album/${album.albumId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-lg font-semibold text-blue-500 hover:underline"
                            >
                              {album.albumName}
                            </a>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {album.albumArtist
                                .split(", ")
                                .map((artist, index) => (
                                  <span key={index}>
                                    <a
                                      href={`https://open.spotify.com/search/${encodeURIComponent(
                                        artist
                                      )}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-500 hover:underline"
                                    >
                                      {artist}
                                    </a>
                                    {index <
                                      album.albumArtist.split(", ").length -
                                        1 && ", "}
                                  </span>
                                ))}
                            </p>
                            {/* Display the rating given for the album */}
                            <p className="text-sm text-gray-500">
                              Your Rating:{" "}
                              {typeof album.averageRating === "number"
                                ? Math.round(album.averageRating)
                                : "N/A"}{" "}
                              / 10
                            </p>
                          </div>
                        </div>

                        {/* Right Section */}
                        <div className="flex items-center gap-6 mt-6">
                          <RatingLabel rating={album.averageRating} />
                          <Button
                            onClick={() =>
                              router.push(`/ratings?albumId=${album.albumId}`)
                            }
                            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                          >
                            <FontAwesomeIcon icon={faSearch} />
                            View Ratings
                          </Button>
                        </div>
                      </MagicCard>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 col-span-full">
                      No rated albums found.
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </MagicCard>
        </motion.Card>

        {/* Predefined Playlists Section */}
        <motion.Card
          className="md:col-span-2 col-span-4 row-span-2 shadow-md rounded-lg"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <MagicCard
            gradientColor={theme === "dark" ? "#262626" : "#D9D9D955"}
            className="p-4"
          >
            <CardHeader>
              <CardTitle>
                <Badge className="w-fit ml-2 -mt-4 absolute text-sm">
                  Our Playlists
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Animated Search Bar */}
              <motion.div
                className="mb-4"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.7 }}
              >
                <Input
                  type="text"
                  placeholder="Search predefined playlists..."
                  value={predefinedSearchQuery}
                  onChange={handlePredefinedSearch}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </motion.div>

              {/* Animated Playlist Grid */}
              <motion.div
                className="grid grid-cols-1 gap-4 max-h-96 overflow-y-auto overflow-x-hidden pr-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.9 }}
              >
                {filteredPredefinedPlaylists.length > 0 ? (
                  filteredPredefinedPlaylists.map((playlist) => (
                    <motion.div
                      key={playlist.id}
                      className="relative flex items-center gap-4 p-4 border rounded-lg shadow-sm hover:shadow-md transition"
                      whileHover={{ scale: 1.05 }}
                    >
                      <img
                        src={playlist.imageUrl}
                        alt={playlist.name}
                        className="h-16 w-16 rounded-lg object-cover"
                      />
                      <div>
                        <a
                          href={playlist.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-lg font-semibold text-blue-500 hover:underline"
                        >
                          {playlist.name}
                        </a>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {playlist.description}
                        </p>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-center text-gray-500">
                    No predefined playlists available.
                  </p>
                )}
              </motion.div>
            </CardContent>
          </MagicCard>
        </motion.Card>

        {/* User Playlists Section */}
        <motion.Card
          className="md:col-span-2 col-span-4 row-span-2 shadow-md rounded-lg"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <MagicCard
            gradientColor={theme === "dark" ? "#262626" : "#D9D9D955"}
            className="p-4"
          >
            <CardHeader>
              <CardTitle>
                <Badge className="w-fit ml-1 -mt-4 absolute text-sm">
                  Your Playlists
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Search Bar and Add Playlist */}
              {/* Animated Search Bar */}
              <motion.div
                className="mb-4 grid grid-cols-4 gap-4"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.7 }}
              >
                <Input
                  type="text"
                  placeholder="Search your playlists..."
                  value={userSearchQuery}
                  onChange={handleUserSearch}
                  className="flex-grow col-span-3"
                />

                <Button
                  onClick={() => setIsDialogOpen(true)}
                  className="bg-blue-500 text-white"
                >
                  + Add
                </Button>
              </motion.div>

              {/* Scrollable Playlist Grid */}
              {filteredUserPlaylists.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 max-h-96 overflow-y-auto overflow-x-hidden pr-4">
                  {filteredUserPlaylists.map((playlist) => (
                    <div
                      key={playlist.id}
                      className="relative flex items-center gap-4 p-4 border rounded-lg shadow-sm hover:shadow-md transition"
                    >
                      <img
                        src={playlist.imageUrl}
                        alt={playlist.name}
                        className="h-16 w-16 rounded-lg object-cover"
                      />
                      <div>
                        <a
                          href={playlist.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-lg font-semibold text-blue-500 hover:underline"
                        >
                          {playlist.name}
                        </a>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {playlist.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500">
                  No playlists available. Add some to get started!
                </p>
              )}
            </CardContent>
          </MagicCard>
        </motion.Card>

        {/* Other Cards */}

        {/* Add Playlist Dialog */}
        <AddPlaylistDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onPlaylistAdded={handlePlaylistAdded}
          userOmid={session.user.omid}
          onToastMessage={handleToastMessage} // Pass the toast message handler
          userPlaylists={userPlaylists} // Pass the user playlists
        />
        {uploading && (
          <div className="text-center mt-4 text-orange-500 font-semibold">
            Uploading new profile image...
          </div>
        )}
        <ToastContainer />
        {/* Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={isConfirmDialogOpen}
          onClose={() => setIsConfirmDialogOpen(false)}
          onConfirm={handleConfirmDelete}
          message="Are you sure you want to delete this playlist? This action cannot be undone."
        />
      </motion.div>
    </motion.div>
  );
};

export default ProfilePage;
