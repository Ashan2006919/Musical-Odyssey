"use client";

import { motion } from "framer-motion"; // Import Framer Motion
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation"; // Correct import
import axios from "axios";
import {
  FaSpotify,
  FaApple,
  FaYoutube,
  FaSoundcloud,
  FaCheckCircle,
  FaExclamationTriangle,
  FaListAlt,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { ToastContainer, toast } from "react-toastify";
import { useTheme } from "next-themes";
import { MagicCard } from "@/components/magicui/magic-card";
import "react-toastify/dist/ReactToastify.css";
import { LineShadowText } from "@/components/magicui/line-shadow-text";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSession } from "next-auth/react";
import {
  AlbumInfoSkeleton,
  TrackListSkeleton,
  AvailableOnSkeleton,
} from "@/components/AlbumSkeleton";

const RateAlbum = () => {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  const params = useParams();
  const albumId = params?.albumId;
  const [albumData, setAlbumData] = useState(null);
  const [ratings, setRatings] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [averageRating, setAverageRating] = useState(null);
  const [isSubmitClicked, setIsSubmitClicked] = useState(false);
  const [producers, setProducers] = useState("Fetching...");
  const [writers, setWriters] = useState("Fetching...");
  const [selectedTracks, setSelectedTracks] = useState(new Set());
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [grayedOutTracks, setGrayedOutTracks] = useState(new Set());
  const [isDialogOpen, setIsDialogOpen] = useState(false); // State for confirmation dialog
  const [isPreviouslyReviewed, setIsPreviouslyReviewed] = useState(false); // State to track if the album was reviewed
  const { theme } = useTheme();
  const [isSubmitConfirmationOpen, setIsSubmitConfirmationOpen] =
    useState(false); // State for submit confirmation dialog
  const [isNewRatingDialogOpen, setIsNewRatingDialogOpen] = useState(false); // State for new rating dialog
  const [isUpdateCompleteDialogOpen, setIsUpdateCompleteDialogOpen] =
    useState(false); // State for the new dialog

  const resolvedTheme = theme?.resolvedTheme || "light";
  const shadowColor = resolvedTheme === "dark" ? "white" : "black";

  const formatDuration = (durationInSeconds) => {
    const minutes = Math.floor(durationInSeconds / 60);
    const seconds = Math.round(durationInSeconds % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const calculateAverageRating = () => {
    const validRatings = Object.entries(ratings)
      .filter(
        ([trackId, rating]) =>
          !grayedOutTracks.has(trackId) &&
          rating !== "" &&
          rating >= 0 &&
          rating <= 10
      )
      .map(([, rating]) => parseFloat(rating));

    if (validRatings.length === 0) return null;
    const total = validRatings.reduce((acc, curr) => acc + curr, 0);
    return (total / validRatings.length).toFixed(1);
  };

  const handleTrackSelect = (trackId) => {
    const updatedSelectedTracks = new Set(selectedTracks);
    if (updatedSelectedTracks.has(trackId)) {
      updatedSelectedTracks.delete(trackId);
    } else {
      updatedSelectedTracks.add(trackId);
    }
    setSelectedTracks(updatedSelectedTracks);
  };

  const handleSelectAll = () => {
    if (selectAllChecked) {
      setSelectedTracks(new Set());
    } else {
      const allTrackIds = new Set(
        albumData.tracks.items.map((track) => track.id)
      );
      setSelectedTracks(allTrackIds);
    }
    setSelectAllChecked(!selectAllChecked);
  };

  const toggleGrayOutTrack = (trackId) => {
    const updatedGrayedOutTracks = new Set(grayedOutTracks);
    if (updatedGrayedOutTracks.has(trackId)) {
      updatedGrayedOutTracks.delete(trackId);
    } else {
      updatedGrayedOutTracks.add(trackId);
    }
    setGrayedOutTracks(updatedGrayedOutTracks);
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent default form submission behavior

      const inputs = document.querySelectorAll("input[type='number']");
      if (index < inputs.length - 1) {
        // Focus the next input field
        inputs[index + 1].focus();
      } else {
        // Trigger the submit button if it's the last input field
        document.querySelector("button[type='submit']").click();
      }
    }
  };

  const handleTableNavigation = (e, rowIndex, columnType) => {
    const rows = document.querySelectorAll("tbody tr");
    const currentRow = rows[rowIndex];

    if (!currentRow) return;

    // Get all rating inputs and checkboxes in the current row
    const ratingInput = currentRow.querySelector("input[type='number']");
    const checkboxInput = currentRow.querySelector("input[type='checkbox']");

    switch (e.key) {
      case "ArrowUp":
        if (rowIndex > 0) {
          const prevRow = rows[rowIndex - 1];
          if (columnType === "rating") {
            prevRow.querySelector("input[type='number']").focus();
          } else if (columnType === "checkbox") {
            prevRow.querySelector("input[type='checkbox']").focus();
          }
        }
        break;

      case "ArrowDown":
        if (rowIndex < rows.length - 1) {
          const nextRow = rows[rowIndex + 1];
          if (columnType === "rating") {
            nextRow.querySelector("input[type='number']").focus();
          } else if (columnType === "checkbox") {
            nextRow.querySelector("input[type='checkbox']").focus();
          }
        }
        break;

      case "ArrowLeft":
        if (columnType === "checkbox") {
          ratingInput?.focus();
        }
        break;

      case "ArrowRight":
        if (columnType === "rating") {
          checkboxInput?.focus();
        }
        break;

      default:
        break;
    }
  };

  useEffect(() => {
    if (!albumId) return;

    const fetchAlbumData = async () => {
      try {
        const tokenResponse = await fetch("/api/spotify");
        const { access_token } = await tokenResponse.json();

        if (!access_token) {
          setError("Failed to retrieve Spotify access token.");
          setLoading(false);
          return;
        }

        const response = await axios.get(
          `https://api.spotify.com/v1/albums/${albumId}`,
          {
            headers: { Authorization: `Bearer ${access_token}` },
          }
        );

        setAlbumData(response.data);

        const initialRatings = {};
        response.data.tracks.items.forEach((track) => {
          initialRatings[track.id] = "";
        });
        setRatings(initialRatings);

        fetchGeniusData(response.data.name, response.data.artists[0].name);
      } catch (err) {
        setError("Failed to fetch album data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAlbumData();
  }, [albumId]);

  const fetchGeniusData = async (albumName, artistName) => {
    try {
      const response = await fetch(
        `/api/genius?album=${encodeURIComponent(
          albumName
        )}&artist=${encodeURIComponent(artistName)}`
      );
      const data = await response.json();

      if (data.error) {
        setProducers("Not Available");
        setWriters("Not Available");
      } else {
        setProducers(data.producers.join(", ") || "Not Available");
        setWriters(data.writers.join(", ") || "Not Available");
      }
    } catch (error) {
      console.error("Error fetching Genius data:", error);
      setProducers("Not Available");
      setWriters("Not Available");
    }
  };

  useEffect(() => {
    if (isSubmitClicked) {
      const avgRating = calculateAverageRating();
      setAverageRating(avgRating);
    }
  }, [ratings, isSubmitClicked]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate that all non-grayed-out fields are filled
    const unfilledFields = Object.entries(ratings).some(
      ([trackId, rating]) =>
        !grayedOutTracks.has(trackId) && (rating === "" || rating === null)
    );

    if (unfilledFields) {
      toast.warning("Please fill in all ratings for non-grayed-out tracks.");
      return; // Prevent submission if validation fails
    }

    // Check if the album has been reviewed before
    handleCheckReviewHistory();
  };

  const handleConfirmSubmit = async () => {
    setIsSubmitConfirmationOpen(false); // Close the confirmation dialog

    const avgRating = calculateAverageRating();
    setAverageRating(avgRating);

    if (!avgRating) {
      toast.warning("No valid ratings to calculate an average.");
      return;
    }

    if (!session?.user?.omid) {
      toast.error("User ID (OMID) is missing. Please log in again.");
      return;
    }

    try {
      // Check if the album has been reviewed before
      const response = await axios.get(
        `/api/ratings/history?albumId=${albumId}&userOmid=${session.user.omid}` // Include userOmid
      );
      const { history } = response.data;

      if (history.length > 0) {
        // Album has been reviewed before
        setIsPreviouslyReviewed(true);
        setIsDialogOpen(true); // Open confirmation dialog
      } else {
        // Album has not been reviewed before, proceed with saving
        await saveRatings(avgRating);
      }
    } catch (error) {
      console.error("Error checking review history:", error);
      toast.error("Failed to check review history.");
    }
  };

  const handleCancelSubmit = () => {
    setIsSubmitConfirmationOpen(false); // Close the confirmation dialog
  };

  const saveRatings = async (avgRating) => {
    if (!session?.user?.omid) {
      toast.error("User ID (OMID) is missing. Please log in again.");
      return;
    }

    try {
      const response = await axios.post("/api/saveRatings", {
        albumId, // Use Spotify albumId
        ratings,
        averageRating: avgRating,
        userOmid: session.user.omid, // Include OMID
      });

      if (response.status === 200) {
        toast.success("Ratings saved successfully");
        setIsNewRatingDialogOpen(true); // Open the new rating dialog
      } else if (response.status === 409) {
        // Handle duplicate rating
        toast.warning(
          "You have already rated this album. Please update your rating instead."
        );
        setIsDialogOpen(true); // Open the dialog to update ratings
      } else {
        toast.error("Failed to save ratings");
      }
    } catch (error) {
      console.error("Error saving ratings:", error);
      toast.error("Failed to save ratings");
    }
  };

  const updateRatings = async (avgRating) => {
    if (!session?.user?.omid) {
      toast.error("User ID (OMID) is missing. Please log in again.");
      return;
    }

    try {
      const response = await axios.post("/api/updateRatings", {
        albumId, // Use Spotify albumId
        ratings,
        averageRating: avgRating,
        userOmid: session.user.omid, // Include OMID
      });

      if (response.status === 200) {
        toast.success("Ratings updated successfully");
        setIsUpdateCompleteDialogOpen(true); // Open the new dialog
      } else {
        toast.error("Failed to update ratings");
      }
    } catch (error) {
      console.error("Error updating ratings:", error);
      toast.error("Failed to update ratings");
    }
  };

  const handleDialogConfirm = async () => {
    setIsDialogOpen(false); // Close the existing dialog
    const avgRating = calculateAverageRating();

    try {
      await updateRatings(avgRating); // Update the ratings using albumId
      setIsUpdateCompleteDialogOpen(true); // Open the new dialog
    } catch (error) {
      console.error("Error updating ratings:", error);
      toast.error("Failed to update ratings.");
    }
  };

  const handleDialogCancel = () => {
    setIsDialogOpen(false);
    toast.info("Rating update canceled.");
  };

  const handleViewRatings = () => {
    setIsDialogOpen(false);
    router.push(`/ratings?albumId=${albumId}`); // Pass albumId as a query parameter
  };

  const handleNewRatingDialogCancel = () => {
    setIsNewRatingDialogOpen(false);
  };

  const handleViewRatingsPage = () => {
    setIsNewRatingDialogOpen(false);
    router.push(`/ratings?albumId=${albumId}`); // Redirect to the ratings page with the album pre-filtered
  };

  const handleRateAnotherAlbum = () => {
    setIsNewRatingDialogOpen(false);
    router.push("/home"); // Redirect to the homepage
  };

  const handleViewRatedAlbum = () => {
    setIsUpdateCompleteDialogOpen(false);
    router.push(`/ratings?albumId=${albumId}`); // Redirect to the ratings page with the album pre-filtered
  };

  const handleCheckReviewHistory = async () => {
    if (!session?.user?.omid) {
      toast.error("User ID (OMID) is missing. Please log in again.");
      return;
    }

    try {
      const response = await axios.get(
        `/api/ratings/history?albumId=${albumId}&userOmid=${session.user.omid}` // Include userOmid
      );
      const { history } = response.data;

      if (history.length > 0) {
        setIsPreviouslyReviewed(true);
        setIsDialogOpen(true);
      } else {
        setIsSubmitConfirmationOpen(true);
      }
    } catch (error) {
      console.error("Error checking review history:", error);
      toast.error("Failed to check review history.");
    }
  };

  const handleSubmitRating = async () => {
    if (!session?.user?.omid) {
      toast.error("User ID (OMID) is missing. Please log in again.");
      return;
    }

    try {
      setIsSubmitClicked(true);

      // Calculate average rating
      const totalRating = Object.values(ratings).reduce(
        (sum, rating) => sum + (parseFloat(rating) || 0),
        0
      );
      const avgRating =
        Object.values(ratings).filter((rating) => rating).length > 0
          ? totalRating /
            Object.values(ratings).filter((rating) => rating).length
          : 0;

      setAverageRating(avgRating);

      // Prepare data to save
      const ratingData = {
        albumId,
        albumName: albumData?.name,
        artistName: albumData?.artists?.[0]?.name,
        ratings,
        averageRating: avgRating,
        userOmid: session.user.omid, // Include OMID
        timestamp: new Date().toISOString(),
      };

      // Save to database
      const response = await axios.post("/api/ratings/save", ratingData);

      if (response.status === 200) {
        toast.success("Rating saved successfully!");
        router.push("/profile"); // Redirect to profile or another page
      } else {
        toast.error("Failed to save rating. Please try again.");
      }
    } catch (error) {
      console.error("Error saving rating:", error);
      toast.error("An error occurred while saving the rating.");
    } finally {
      setIsSubmitClicked(false);
    }
  };

  if (!albumId)
    return <p className="text-center text-red-500">Error: No Album ID Found</p>;

  return (
    <div className="relative min-h-screen">
      <div className="max-w-7xl mx-auto py-10 px-6">
        {/* Animated Title */}
        <motion.h1
          className="text-[clamp(2rem,10vw,5rem)] font-extrabold leading-tight tracking-tighter text-center mb-5"
          initial={{ y: "-100px", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        >
          Let's Rate an
          <LineShadowText
            className="italic text-primary ml-3 whitespace-nowrap"
            shadowColor={shadowColor}
          >
            Album!
          </LineShadowText>
        </motion.h1>

        {/* Conditional rendering for loading state */}
        {loading ? (
          <motion.div
            className="space-y-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <AlbumInfoSkeleton />
            <AvailableOnSkeleton />
            <TrackListSkeleton />
          </motion.div>
        ) : error ? (
          <motion.p
            className="text-center text-red-500 mt-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            {error}
          </motion.p>
        ) : (
          <>
            {/* Render the rest of the content when data is loaded */}
            <MagicCard
              className="cursor-pointer flex-col whitespace-nowrap"
              gradientColor={resolvedTheme === "dark" ? "#262626" : "#D9D9D955"}
            >
              <motion.div
                className="grid grid-cols-1 lg:grid-cols-2 gap-10 my-10"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeInOut" }}
              >
                <div className="flex justify-center items-center">
                  <img
                    src={albumData.images[0].url}
                    alt={albumData.name}
                    className="w-64 rounded-lg transition-transform hover:scale-105"
                  />
                </div>

                <div className="flex flex-col justify-center p-5">
                  <div className="mb-4">
                    <p className="text-2xl font-semibold mb-1 text-black">
                      <a
                        href={albumData.external_urls.spotify} // Spotify link for the album
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline text-blue-600"
                      >
                        {albumData.name}
                      </a>
                    </p>
                    <p className="text-gray-700 font-semibold">
                      Artists:{" "}
                      <span className="font-normal">
                        <a
                          href={albumData.artists[0].external_urls.spotify} // Spotify link for the artist
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          {albumData.artists[0].name}
                        </a>
                      </span>
                    </p>
                    <p className="text-gray-700 font-semibold">
                      Release Date:{" "}
                      <span className="font-normal">
                        {albumData.release_date}
                      </span>
                    </p>
                  </div>

                  <div className="my-2">
                    <p className="text-lg text-gray-700 font-semibold mt-2">
                      Producers:
                      <span className="block break-words text-wrap font-normal text-sm">
                        {producers}
                      </span>
                    </p>
                    <p className="text-lg text-gray-700 font-semibold mt-1">
                      Writers:
                      <span className="block break-words text-wrap font-normal text-sm">
                        {writers}
                      </span>
                    </p>
                  </div>
                </div>
              </motion.div>
            </MagicCard>

            <div className="my-10">
              {/* Animated "Available on" Text */}
              <motion.h2
                className="text-2xl font-semibold text-center mb-4 text-black"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeInOut" }}
              >
                Available on
              </motion.h2>

              {/* Animated Buttons for Platforms */}
              <motion.div
                className="flex flex-wrap gap-4 justify-center"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeInOut", delay: 0.3 }}
              >
                <Button
                  asChild
                  className="flex-1 px-5 py-2 flex items-center justify-center gap-2 transition-all shadow-md bg-green-500 hover:bg-green-600 text-md text-white rounded-lg"
                >
                  <a
                    href={`https://open.spotify.com/album/${albumId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaSpotify className="text-3xl" /> Listen on Spotify
                  </a>
                </Button>
                <Button
                  asChild
                  className="flex-1 px-5 py-2 flex items-center justify-center gap-2 transition-all shadow-md bg-black hover:bg-gray-800 text-md text-white rounded-lg"
                >
                  <a
                    href={`https://music.apple.com/us/search?term=${encodeURIComponent(
                      albumData.name + " " + albumData.artists[0].name
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaApple className="text-3xl" /> Listen on Apple Music
                  </a>
                </Button>
                <Button
                  asChild
                  className="flex-1 px-5 py-2 flex items-center justify-center gap-2 transition-all shadow-md bg-red-600 hover:bg-red-700 text-md text-white rounded-lg"
                >
                  <a
                    href={`https://music.youtube.com/search?q=${encodeURIComponent(
                      albumData.name + " " + albumData.artists[0].name
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaYoutube className="text-3xl" /> Listen on YouTube Music
                  </a>
                </Button>
                <Button
                  asChild
                  className="flex-1 px-5 py-2 flex items-center justify-center gap-2 transition-all shadow-md bg-orange-500 hover:bg-orange-600 text-md text-white rounded-lg"
                >
                  <a
                    href={`https://soundcloud.com/search?q=${encodeURIComponent(
                      albumData.name + " " + albumData.artists[0].name
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaSoundcloud className="text-3xl" /> Listen on SoundCloud
                  </a>
                </Button>
              </motion.div>
            </div>
            <MagicCard
              className="cursor-pointer flex-col whitespace-nowrap py-2"
              gradientColor={resolvedTheme === "dark" ? "#262626" : "#D9D9D955"}
            >
              <motion.div
                className="overflow-x-auto shadow-md rounded-lg"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeInOut", delay: 0.5 }}
              >
                <table className="min-w-full table-auto">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left hidden sm:table-cell">
                        #
                      </th>{" "}
                      {/* Hide index on small screens */}
                      <th className="px-6 py-3 text-left">Track</th>
                      <th className="px-6 py-3 text-left hidden sm:table-cell">
                        Duration
                      </th>{" "}
                      {/* Hide duration on small screens */}
                      <th className="px-6 py-3 text-left">Rating</th>
                      <th className="px-6 py-3 text-left hidden sm:table-cell">
                        {" "}
                        {/* Hide checkboxes on small screens */}
                        <input
                          type="checkbox"
                          checked={selectAllChecked}
                          onChange={handleSelectAll}
                          className="w-5 h-5"
                        />
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {albumData.tracks.items.map((track, index) => (
                      <tr
                        key={track.id}
                        className={
                          grayedOutTracks.has(track.id) ? "opacity-50" : ""
                        }
                      >
                        <td className="px-6 py-3 hidden sm:table-cell">
                          {index + 1}
                        </td>{" "}
                        {/* Hide index on small screens */}
                        <td className="px-6 py-3">{track.name}</td>
                        <td className="px-6 py-3 hidden sm:table-cell">
                          {formatDuration(track.duration_ms / 1000)}
                        </td>{" "}
                        {/* Hide duration on small screens */}
                        <td className="px-6 py-3">
                          <input
                            type="number"
                            value={ratings[track.id]}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === "" || (value >= 0 && value <= 10)) {
                                setRatings({ ...ratings, [track.id]: value });
                              }
                            }}
                            onWheel={(e) => e.target.blur()} // Prevent scroll behavior
                            onKeyDown={(e) => {
                              if (
                                e.key === "ArrowUp" ||
                                e.key === "ArrowDown"
                              ) {
                                e.preventDefault(); // Prevent increment/decrement behavior
                              }
                              handleTableNavigation(e, index, "rating"); // Handle navigation
                            }}
                            className="border px-3 py-1 rounded-lg"
                            min="0"
                            max="10"
                            disabled={grayedOutTracks.has(track.id)} // Disable input if grayed out
                          />
                        </td>
                        <td className="px-6 py-3 hidden sm:table-cell">
                          {" "}
                          {/* Hide checkboxes on small screens */}
                          <input
                            type="checkbox"
                            checked={selectedTracks.has(track.id)}
                            onChange={() => handleTrackSelect(track.id)}
                            onKeyDown={(e) =>
                              handleTableNavigation(e, index, "checkbox")
                            }
                            className="w-5 h-5"
                          />
                        </td>
                        <td className="px-1 py-3">
                          <button
                            onClick={() => toggleGrayOutTrack(track.id)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            {grayedOutTracks.has(track.id) ? (
                              <FaEyeSlash />
                            ) : (
                              <FaEye />
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            </MagicCard>

            <motion.div
              className="flex justify-center my-10"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeInOut", delay: 0.7 }}
            >
              <Button
                type="submit"
                onClick={handleSubmit}
                className="py-3 text-xl flex items-center justify-center gap-4 transition-all h-10 w-1/4"
              >
                <FaCheckCircle /> Submit
              </Button>
            </motion.div>

            {averageRating && (
              <div className="text-center mt-5 text-xl font-semibold">
                <p>Your Average Rating: {averageRating}</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Confirmation Dialog */}
      {isDialogOpen && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Existing Rating</DialogTitle>
              <DialogDescription>
                You have already reviewed this album. Do you want to update your
                previous ratings or view your ratings page?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={handleDialogCancel}>
                Cancel
              </Button>
              <Button variant="secondary" onClick={handleViewRatings}>
                View Ratings Page
              </Button>
              <Button onClick={handleDialogConfirm}>Update Ratings</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Post-Submission Dialog */}
      {isNewRatingDialogOpen && (
        <Dialog
          open={isNewRatingDialogOpen}
          onOpenChange={setIsNewRatingDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rating Submitted</DialogTitle>
              <DialogDescription>
                Your rating for this album has been successfully submitted. What
                would you like to do next?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={handleNewRatingDialogCancel}>
                Cancel
              </Button>
              <Button variant="secondary" onClick={handleViewRatingsPage}>
                View Rated Album
              </Button>
              <Button onClick={handleRateAnotherAlbum}>
                Rate Another Album
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Confirmation Dialog */}
      {isSubmitConfirmationOpen && (
        <Dialog
          open={isSubmitConfirmationOpen}
          onOpenChange={setIsSubmitConfirmationOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Submission</DialogTitle>
              <DialogDescription>
                Are you sure you want to submit your ratings for this album?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={handleCancelSubmit}>
                Cancel
              </Button>
              <Button onClick={handleConfirmSubmit}>Confirm</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* New Dialog After Updating Ratings */}
      {isUpdateCompleteDialogOpen && (
        <Dialog
          open={isUpdateCompleteDialogOpen}
          onOpenChange={setIsUpdateCompleteDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Review Updated</DialogTitle>
              <DialogDescription>
                Your review for this album has been successfully updated. What
                would you like to do next?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={handleViewRatedAlbum}>
                View Rated Album
              </Button>
              <Button onClick={handleRateAnotherAlbum}>
                Rate Another Album
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <ToastContainer />
    </div>
  );
};

export default RateAlbum;
