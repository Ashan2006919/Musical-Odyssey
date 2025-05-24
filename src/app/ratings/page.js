"use client";

import { motion } from "framer-motion"; // Import Framer Motion
import { Suspense } from "react";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import axios from "axios";
import { MagicCard } from "@/components/magicui/magic-card";
import { LineShadowText } from "@/components/magicui/line-shadow-text";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faSave,
  faSearch,
  faUndo,
  faChartLine,
  faHome,
  faTrash,
  faArrowUp,
  faArrowDown,
} from "@fortawesome/free-solid-svg-icons";
import { RatingSkeleton } from "@/components/AlbumSkeleton"; // Import skeleton loader
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import RatingLabel from "@/components/RatingLabel"; // Import the RatingLabel component
import RatingTrendChart from "@/components/RatingTrendChart";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import yearsData from "@/data/years.json"; // Import the years JSON
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSearchParams } from "next/navigation"; // Import useSearchParams
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation"; // Import useRouter
import Leaderboard from "@/components/Leaderboard"; // Import the Leaderboard component

const RatingsPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams(); // Get query parameters
  const albumIdFromQuery = searchParams.get("albumId"); // Extract albumId from query
  const [ratingsData, setRatingsData] = useState([]);
  const [filteredRatings, setFilteredRatings] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [yearFilter, setYearFilter] = useState(""); // State for year/decade filter
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [editedRatings, setEditedRatings] = useState({});
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false); // Separate state for Edit dialog
  const [isTrendDialogOpen, setIsTrendDialogOpen] = useState(false); // Separate state for Trends dialog
  const [selectedAlbumId, setSelectedAlbumId] = useState(null);
  const [isViewRatingsDialogOpen, setIsViewRatingsDialogOpen] = useState(false); // State for View Ratings dialog
  const [selectedRating, setSelectedRating] = useState(null); // Store the selected rating
  const [sortOption, setSortOption] = useState(""); // State for sorting option
  const [sortDirection, setSortDirection] = useState("asc"); // State for sorting direction
  const [isRankingDialogOpen, setIsRankingDialogOpen] = useState(false); // State for leaderboard dialog
  const { theme } = useTheme();

  const resolvedTheme = theme?.resolvedTheme || "light";
  const shadowColor = resolvedTheme === "dark" ? "white" : "black";

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchRatings = async () => {
      if (!session?.user?.omid) {
        toast.error("User ID (OMID) is missing. Please log in again.");
        setLoading(false);
        return;
      }

      try {
        // Fetch ratings for the logged-in user using their OMID
        const response = await axios.get(
          `/api/getRatings?userOmid=${session.user.omid}`
        );
        const ratings = response.data;

        // Process and set the ratings data
        const updatedRatings = await Promise.all(
          ratings.map(async (rating) => {
            // Fetch album details using albumId (not track details)
            const albumResponse = await axios.get(
              `/api/spotify/albumDetails?albumId=${rating.albumId}`
            );
            const albumData = albumResponse.data;
            return {
              ...rating,
              albumId: rating.albumId,
              albumName: albumData.name,
              albumArtist: albumData.artists
                .map((artist) => artist.name)
                .join(", "),
              albumCover: albumData.images[0]?.url,
              releaseDate: albumData.release_date,
            };
          })
        );

        setRatingsData(updatedRatings);

        // If albumId is provided in the query, filter the ratings
        if (albumIdFromQuery) {
          const filtered = updatedRatings.filter(
            (rating) => rating.albumId === albumIdFromQuery
          );
          setFilteredRatings(filtered);
        } else {
          setFilteredRatings(updatedRatings); // Show all ratings if no query parameter
        }

        setLoading(false);
      } catch (error) {
        setError("Failed to load ratings data");
        setLoading(false);
        toast.error("Failed to load ratings data.");
      }
    };

    fetchRatings();
  }, [session?.user?.omid, albumIdFromQuery]);

  const handleEditClick = (ratingId) => {
    const rating = ratingsData.find((r) => r._id === ratingId); // Find by ratingId

    if (!rating) {
      console.error(`No rating found for ratingId: ${ratingId}`);
      toast.error("Failed to load album ratings for editing.");
      return;
    }

    setEditing(ratingId); // Set the ratingId being edited
    setEditedRatings(rating.ratings);
    setIsEditDialogOpen(true); // Open the Edit dialog
  };

  const handleViewTrendsClick = (ratingId) => {
    const rating = ratingsData.find((r) => r._id === ratingId);
    setSelectedAlbumId(rating.albumId); // Use Spotify's albumId
    setIsTrendDialogOpen(true); // Open the Trends dialog
    toast.info("Loading rating trends...");
  };

  const handleViewRatingsClick = async (ratingId) => {
    const rating = ratingsData.find((r) => r._id === ratingId);
    console.log("handleViewRatingsClick - rating:", rating);
    if (rating) {
      const trackIds = Object.keys(rating.ratings);
      console.log("Track IDs for album:", trackIds);
      const trackDetails = await Promise.all(
        trackIds.map(async (trackId) => {
          const trackResponse = await axios.get(
            `/api/spotify/details?trackId=${trackId}`
          );
          const trackData = trackResponse.data;
          console.log("Fetched trackData:", trackData);
          return {
            trackId,
            name: trackData.name,
            albumName: trackData.album.name,
            albumArtist: trackData.artists
              .map((artist) => artist.name)
              .join(", "),
            artistId: trackData.artists[0]?.id,
            albumCover: trackData.album.images[0]?.url,
            releaseDate: trackData.album.release_date,
          };
        })
      );
      console.log("trackDetails array:", trackDetails);
      setSelectedRating({ ...rating, trackDetails });
      setIsViewRatingsDialogOpen(true);
    } else {
      console.error(`No rating found for ratingId: ${ratingId}`);
      toast.error("Failed to load ratings for this album.");
    }
  };

  const handleRatingChange = (trackId, value) => {
    setEditedRatings((prev) => {
      const updatedRatings = {
        ...prev,
        [trackId]: value,
      };

      // Update the average rating in real-time
      const averageRating = calculateAverageRating(updatedRatings);
      setRatingsData((prevRatingsData) =>
        prevRatingsData.map((rating) =>
          rating._id === editing
            ? {
                ...rating,
                ratings: updatedRatings,
                averageRating,
              }
            : rating
        )
      );

      return updatedRatings;
    });
  };

  const calculateAverageRating = (ratings) => {
    const validRatings = Object.values(ratings).filter(
      (rating) => rating !== "" && rating !== null
    );

    if (validRatings.length === 0) return null; // Return null if no valid ratings

    const total = validRatings.reduce((acc, rating) => acc + Number(rating), 0);
    return (total / validRatings.length).toFixed(1); // Calculate the average
  };

  const handleSaveClick = async (ratingId) => {
    try {
      console.log("Editing ratingId:", ratingId);

      // Find the albumId using the ratingId
      const rating = ratingsData.find((r) => r._id === ratingId);
      if (!rating) {
        console.error(`No rating found for ratingId: ${ratingId}`);
        toast.error("Failed to find the album for saving.");
        return;
      }

      const albumId = rating.albumId; // Get the albumId
      const averageRating = calculateAverageRating(editedRatings); // Calculate the average rating

      if (!albumId || averageRating === null || !session?.user?.omid) {
        console.error("Missing required fields for updating ratings.");
        toast.error("Failed to update ratings. Required fields are missing.");
        return;
      }

      await axios.post("/api/updateRatings", {
        albumId, // Use Spotify albumId
        ratings: editedRatings,
        averageRating, // Include the averageRating in the payload
        userOmid: session.user.omid, // Include the user's OMID
      });

      // Update the ratingsData and filteredRatings states
      const updatedRatingsData = ratingsData.map((r) =>
        r._id === ratingId // Match by ratingId
          ? {
              ...r,
              ratings: editedRatings,
              averageRating,
            }
          : r
      );

      setRatingsData(updatedRatingsData);
      setFilteredRatings(updatedRatingsData); // Update filteredRatings as well
      setEditing(null);
      setIsEditDialogOpen(false);
      toast.success("Ratings updated successfully!");
    } catch (error) {
      console.error(
        "Failed to update ratings:",
        error.response?.data || error.message
      );
      toast.error("Failed to update ratings.");
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = ratingsData.filter((rating) => {
      const albumName = rating.albumName?.toLowerCase() || "";
      const albumArtist = rating.albumArtist?.toLowerCase() || "";
      return albumName.includes(query) || albumArtist.includes(query);
    });

    setFilteredRatings(filtered);
  };

  const handleYearFilterChange = (selectedYearOrDecade) => {
    setYearFilter(selectedYearOrDecade);

    const filtered = ratingsData.filter((rating) =>
      rating.trackDetails.some((track) => {
        const releaseYear = track.releaseDate?.split("-")[0]; // Extract the release year
        const releaseDecade = releaseYear?.slice(0, 3) + "0s"; // Derive the decade (e.g., "2000s")

        // Check if the filter matches the year or the decade
        return (
          selectedYearOrDecade === "" || // No filter applied
          releaseYear === selectedYearOrDecade || // Matches specific year
          releaseDecade === selectedYearOrDecade // Matches decade
        );
      })
    );
    console.log("Filtered Ratings:", filtered);
    setFilteredRatings(filtered);
  };

  const handleSortChange = (option) => {
    let newSortDirection = sortDirection;
    let newSortOption = sortOption;

    if (sortOption === option) {
      // Toggle the sort direction if the same option is selected
      newSortDirection = sortDirection === "asc" ? "desc" : "asc";
      setSortDirection(newSortDirection);
    } else {
      // Set the new sort option and reset to ascending order
      newSortOption = option;
      newSortDirection = "asc";
      setSortOption(option);
      setSortDirection("asc");
    }

    // Always sort from the current filtered list
    setFilteredRatings((prev) => {
      const sorted = [...prev].sort((a, b) => {
        const directionMultiplier = newSortDirection === "asc" ? 1 : -1;
        switch (option) {
          case "rating":
            return (
              directionMultiplier *
              (calculateAverageRating(a.ratings) -
                calculateAverageRating(b.ratings))
            );
          case "releaseDate":
            return (
              directionMultiplier *
              (new Date(a.releaseDate) - new Date(b.releaseDate))
            );
          case "albumName":
            return directionMultiplier * a.albumName.localeCompare(b.albumName);
          default:
            return 0;
        }
      });
      return sorted;
    });
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
            Your Rated
            <LineShadowText
              className="italic text-primary ml-3 whitespace-nowrap"
              shadowColor={shadowColor}
            >
              Albums !
            </LineShadowText>
          </motion.h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-36">
            {Array.from({ length: ratingsData.length || 6 }).map((_, index) => (
              <RatingSkeleton key={index} />
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
        <motion.h1
          className="text-[clamp(2rem,10vw,5rem)] font-extrabold leading-tight tracking-tighter text-center mb-10"
          initial={{ y: "-100px", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        >
          Your Rated
          <LineShadowText
            className="italic text-primary ml-3 whitespace-nowrap"
            shadowColor={shadowColor}
          >
            Albums !
          </LineShadowText>
        </motion.h1>

        {/* Search, Filter, and Sort */}
        <motion.div
          className="mb-10 -mt-4 flex justify-center items-center gap-4"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          {/* Reset Button */}
          <button
            onClick={() => {
              setSearchQuery(""); // Clear the search query
              setYearFilter(""); // Clear the year filter
              setSortOption(""); // Reset sorting
              setFilteredRatings(ratingsData); // Reset to show all ratings
              router.push("/ratings"); // Reset the URL to the root of the ratings page
            }}
            className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-md transition-all"
            title="Reset Filters" // Tooltip text
          >
            <FontAwesomeIcon icon={faUndo} className="text-lg" />{" "}
            {/* Reset Icon */}
          </button>

          {/* Search Bar */}
          <Input
            type="text"
            placeholder="Search by album or artist name..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full max-w-md px-4 py-2 border rounded-lg"
          />

          {/* Dropdown Menu for Year Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Filter by Year</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Filter by Decade</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {Object.entries(yearsData).map(([decade, years]) => (
                <DropdownMenuSub key={decade}>
                  <DropdownMenuSubTrigger
                    onClick={() => handleYearFilterChange(decade)} // Filter by decade on click
                    className="font-semibold text-blue-500 cursor-pointer"
                  >
                    <span>{decade}</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      {/* Filter by specific year */}
                      {years.map((year) => (
                        <DropdownMenuItem
                          key={year}
                          onClick={() => handleYearFilterChange(year)}
                        >
                          {year}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleYearFilterChange("")}>
                Clear Filter
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Dropdown Menu for Sorting */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Sort By</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Sort Albums</DropdownMenuLabel>
              <DropdownMenuSeparator />
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
              <DropdownMenuItem onClick={() => handleSortChange("releaseDate")}>
                Release Date{" "}
                <FontAwesomeIcon
                  icon={
                    sortOption === "releaseDate" && sortDirection === "asc"
                      ? faArrowUp
                      : faArrowDown
                  }
                  className="ml-2"
                />
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange("albumName")}>
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
                  setSearchQuery(""); // Clear the search query
                  setYearFilter(""); // Clear the year filter
                  setSortOption(""); // Reset sorting
                  setSortDirection("asc"); // Reset sort direction
                  setFilteredRatings(ratingsData); // Reset to show all ratings
                  router.push("/ratings"); // Reset the URL to the root of the ratings page
                }}
              >
                Clear Sorting
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </motion.div>

        {/* Conditional Message for No Ratings */}
        {!loading && ratingsData.length === 0 && (
          <motion.div
            className="text-center mt-6 flex flex-col items-center justify-center"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.7 }}
          >
            <p className="text-lg text-gray-600 mb-6">
              You haven't rated any albums yet. Start exploring and rating your
              favorite albums now!
            </p>
            <Button
              onClick={() => router.push("/")}
              className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white text-lg font-semibold rounded-lg shadow-md transition-all flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faHome} className="text-xl" />{" "}
              {/* Add Home Icon */}
              Go to Home Page
            </Button>
          </motion.div>
        )}

        {/* Album Cards */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-24"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.7 }}
        >
          {filteredRatings
            .sort(
              (a, b) =>
                calculateAverageRating(b.ratings) -
                calculateAverageRating(a.ratings) // Sort by average rating in descending order
            )
            .map((rating, index) => (
              <MagicCard
                className="cursor-pointer flex-col whitespace-nowrap shadow-md rounded-lg p-6 relative transition-transform duration-300 hover:scale-105 hover:shadow-lg"
                gradientColor={
                  resolvedTheme === "dark" ? "#262626" : "#D9D9D955"
                }
                key={rating._id}
              >
                {/* Ranking Badge */}
                <div
                  className="absolute -top-6 -left-6 bg-blue-500 text-white text-lg font-bold py-2 px-4 rounded-full shadow-md z-10 cursor-pointer"
                  onClick={() => setIsRankingDialogOpen(true)} // Open leaderboard dialog
                >
                  #{index + 1}
                </div>

                <button
                  className="absolute -right-8 top-4 text-gray-600 hover:text-gray-800 text-xl"
                  onClick={() => handleEditClick(rating._id)} // Pass the correct ratingId
                >
                  <FontAwesomeIcon icon={faEdit} />
                </button>
                <div className="flex items-center mb-4">
                  <img
                    src={rating.albumCover}
                    alt={rating.albumName}
                    className="h-20 w-20 rounded-md mr-4 transition-transform hover:scale-110"
                  />
                  <div className="flex flex-col">
                    <h2 className="text-2xl font-bold text-wrap">
                      {rating.albumName}
                    </h2>
                    <p className="text-gray-600 text-wrap">
                      {rating.albumArtist}
                    </p>
                    <p className="text-gray-600 text-sm mt-1 text-wrap">
                      {rating.releaseDate}
                    </p>
                  </div>
                </div>
                <div>
                  <div className="flex items-center mb-2 justify-between">
                    <h3 className="text-xl font-semibold">Track Ratings:</h3>
                    <RatingLabel
                      rating={calculateAverageRating(rating.ratings)}
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-gray-600 text-lg font-semibold">
                    Average Rating:{" "}
                    <span className="font-medium">
                      {calculateAverageRating(rating.ratings)}
                    </span>
                  </p>
                </div>
                <div className="flex gap-4 mt-4">
                  <Button
                    className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2"
                    onClick={() => handleViewRatingsClick(rating._id)} // Open View Ratings dialog
                  >
                    <FontAwesomeIcon icon={faSearch} /> View Ratings
                  </Button>
                  <Button
                    className="bg-orange-500 hover:bg-orange-600 text-white flex items-center gap-2"
                    onClick={() => handleViewTrendsClick(rating._id)} // Open Trends dialog
                  >
                    <FontAwesomeIcon icon={faChartLine} /> View Trends
                  </Button>
                </div>
              </MagicCard>
            ))}
        </motion.div>
      </div>

      {/* Edit Ratings Dialog */}
      {editing && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            <DialogContent className="sm:max-w-[425px] h-[650px] flex flex-col">
              {" "}
              {/* Use flex layout */}
              <DialogHeader>
                <DialogTitle className="pb-1 text-orange-500">
                  Edit Ratings
                </DialogTitle>
                <DialogDescription>
                  Make changes to your ratings here. Click save when you're
                  done.
                </DialogDescription>
              </DialogHeader>
              <hr />
              {/* Scrollable tracklist container */}
              <div className="grid gap-4 pb-4 pt-2 overflow-y-auto flex-grow">
                {ratingsData
                  .find((r) => r._id === editing) // Find by ratingId
                  ?.trackDetails.map((track) => (
                    <div
                      key={track.trackId}
                      className="grid grid-cols-4 items-center gap-4 mr-5"
                    >
                      <Label
                        htmlFor={`rating-${track.trackId}`}
                        className="text-right"
                      >
                        {track.name}
                      </Label>
                      <Input
                        id={`rating-${track.trackId}`}
                        type="number"
                        value={editedRatings[track.trackId] || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === "" || (value >= 0 && value <= 10)) {
                            handleRatingChange(track.trackId, value);
                          }
                        }}
                        placeholder={
                          editedRatings[track.trackId] === null
                            ? "Grayed out - Enter a value if you want"
                            : "Enter a rating (0-10)"
                        }
                        className="col-span-3"
                      />
                    </div>
                  ))}
              </div>
              <DialogFooter className="mt-4">
                {" "}
                {/* Ensure footer stays at the bottom */}
                <Button
                  className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-2"
                  onClick={() => handleSaveClick(editing)}
                >
                  <FontAwesomeIcon icon={faSave} /> {/* Add save icon */}
                  Save Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </motion.div>
        </Dialog>
      )}

      {/* View Trends Dialog */}
      {isTrendDialogOpen && (
        <Dialog open={isTrendDialogOpen} onOpenChange={setIsTrendDialogOpen}>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            <DialogContent className="max-w-[90%] sm:max-w-[600px] px-2 sm:px-8 flex flex-col mx-1 sm:mx-auto rounded-lg">
              <DialogHeader>
                <DialogTitle>Rating Trends</DialogTitle>
                <DialogDescription>
                  See how your ratings for this album have changed over time.
                </DialogDescription>
              </DialogHeader>
              <hr />
              {console.log(
                "Passing selectedAlbumId to RatingTrendChart:",
                selectedAlbumId
              )}{" "}
              {/* Debugging log */}
              <RatingTrendChart albumId={selectedAlbumId} />
              <hr className="mt-5" />
              <DialogFooter className="bg-white mt-4">
                {" "}
                {/* Ensure footer stays at the bottom */}
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsTrendDialogOpen(false);
                    setSelectedAlbumId(null); // Reset selectedAlbumId when closing the dialog
                  }}
                >
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </motion.div>
        </Dialog>
      )}

      {/* View Ratings Dialog */}
      {isViewRatingsDialogOpen && selectedRating && (
        <Dialog
          open={isViewRatingsDialogOpen}
          onOpenChange={setIsViewRatingsDialogOpen}
        >
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            <DialogContent className="w-[95%] max-w-[450px] h-[650px] flex flex-col px-4 sm:px-4 mx-1 sm:mx-auto rounded-lg">
              <DialogHeader>
                <DialogTitle className="pb-1 text-orange-500">
                  <div className="flex items-center mb-4">
                    {selectedRating.trackDetails &&
                    selectedRating.trackDetails.length > 0 ? (
                      <>
                        <img
                          src={selectedRating.trackDetails[0]?.albumCover}
                          alt={selectedRating.trackDetails[0]?.albumName}
                          className="h-20 w-20 rounded-md mr-4 transition-transform hover:scale-110"
                        />
                        <div className="flex flex-col">
                          <a
                            href={`https://open.spotify.com/album/${selectedRating.albumId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-2xl font-bold text-wrap text-orange-500 hover:text-blue-500 hover:underline"
                          >
                            {selectedRating.trackDetails[0]?.albumName}
                          </a>
                          <p className="text-gray-600 text-wrap text-md">
                            {selectedRating.trackDetails[0]?.albumArtist}
                          </p>
                          <p className="text-gray-600 text-sm mt-1 text-wrap">
                            {selectedRating.trackDetails[0]?.releaseDate}
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center w-full">
                        <span className="text-gray-400">
                          Loading album details...
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end mr-5 -mt-14">
                    <RatingLabel
                      rating={calculateAverageRating(selectedRating.ratings)}
                    />
                  </div>
                </DialogTitle>
              </DialogHeader>
              <hr />
              <DialogDescription className="text-gray-600 text-sm text-wrap">
                Track ratings for this album:
              </DialogDescription>
              <div className="grid gap-4 pb-4 overflow-y-auto flex-grow">
                {selectedRating.trackDetails.map((track) => (
                  <div
                    key={track.trackId}
                    className="flex items-center justify-between py-2 rounded-lg shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-gray-200 rounded-md flex items-center justify-center text-gray-600 font-bold">
                        <img
                          src="/icons/track-icon-96.png"
                          alt={track.albumName}
                          className="h-full w-full rounded-md"
                        />
                      </div>
                      <div>
                        <a
                          href={`https://open.spotify.com/track/${track.trackId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-base font-semibold text-gray-800 text-wrap hover:text-blue-500 hover:underline"
                        >
                          {track.name}
                        </a>
                        <p className="text-sm text-gray-500">
                          #
                          <span
                            onClick={() =>
                              navigator.clipboard.writeText(track.trackId)
                            }
                            className="cursor-pointer hover:text-blue-500"
                            title="Click to copy Spotify track ID"
                          >
                            {track.trackId}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-300 rounded-md px-3 mr-6 py-1 shadow-sm">
                      {selectedRating.ratings[track.trackId] === null ||
                      selectedRating.ratings[track.trackId] === "" ? (
                        <div className="relative group">
                          <span className="text-xl text-red-600">✖</span>
                          {/* Tooltip */}
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 px-3 py-2 bg-red-100 text-red-700 text-sm font-semibold rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                            This track hasn't been rated because it was grayed
                            out by you.
                          </div>
                        </div>
                      ) : (
                        selectedRating.ratings[track.trackId]
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <DialogFooter className="bg-white mt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsViewRatingsDialogOpen(false)}
                >
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </motion.div>
        </Dialog>
      )}

      {/* Leaderboard Dialog */}
      <Leaderboard
        isOpen={isRankingDialogOpen}
        onClose={() => setIsRankingDialogOpen(false)}
        albums={filteredRatings
          .map((rating) => ({
            albumId: rating.albumId,
            albumName: rating.albumName,
            albumArtist: rating.albumArtist,
            albumCover: rating.albumCover,
            averageRating: calculateAverageRating(rating.ratings),
          }))
          .sort((a, b) => b.averageRating - a.averageRating)}
      />
    </div>
  );
};

const RatingsPageWrapper = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RatingsPage />
    </Suspense>
  );
};

export default RatingsPageWrapper;
