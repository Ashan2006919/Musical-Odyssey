"use client";

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

const RateAlbum = () => {

    const { data: session, status } = useSession();
    const router = useRouter();
  
    // Redirect to login if not authenticated
    useEffect(() => {
      if (status === "unauthenticated") {
        router.push("/login");
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
  const [isSubmitConfirmationOpen, setIsSubmitConfirmationOpen] = useState(false); // State for submit confirmation dialog
  const [isNewRatingDialogOpen, setIsNewRatingDialogOpen] = useState(false); // State for new rating dialog
  const [isUpdateCompleteDialogOpen, setIsUpdateCompleteDialogOpen] = useState(false); // State for the new dialog

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

    try {
      // Check if the album has been reviewed before
      const response = await axios.get(`/api/ratings/history?albumId=${albumId}`);
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
    try {
      const response = await axios.post("/api/saveRatings", {
        albumId, // Use Spotify albumId
        ratings,
        averageRating: avgRating,
      });

      if (response.status === 200) {
        toast.success("Ratings saved successfully");
        setIsNewRatingDialogOpen(true); // Open the new rating dialog
      } else {
        toast.error("Failed to save ratings");
      }
    } catch (error) {
      console.error("Error saving ratings:", error);
      toast.error("Failed to save ratings");
    }
  };

  const updateRatings = async (avgRating) => {
    try {
      const response = await axios.post("/api/updateRatings", {
        albumId, // Use Spotify albumId
        ratings,
        averageRating: avgRating,
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
    try {
      const response = await axios.get(`/api/ratings/history?albumId=${albumId}`);
      const { history } = response.data;

      if (history.length > 0) {
        // Album has been reviewed before
        setIsPreviouslyReviewed(true);
        setIsDialogOpen(true); // Open the dialog for previously reviewed albums
      } else {
        // Album has not been reviewed before
        setIsSubmitConfirmationOpen(true); // Open the confirmation dialog
      }
    } catch (error) {
      console.error("Error checking review history:", error);
      toast.error("Failed to check review history.");
    }
  };

  if (!albumId)
    return <p className="text-center text-red-500">Error: No Album ID Found</p>;
  if (loading)
    return (
      <p className="text-center text-gray-500 mt-10">
        Loading album details...
      </p>
    );
  if (error) return <p className="text-center text-red-500 mt-10">{error}</p>;

  return (
    <div className="relative min-h-screen bg-white">
      <div className="max-w-7xl mx-auto py-10 px-6">
        <h1 className="text-[clamp(2rem,10vw,5rem)] font-extrabold leading-tight tracking-tighter text-center mb-5">
          Let's Rate an
          <LineShadowText
            className="italic text-primary ml-3 whitespace-nowrap"
            shadowColor={shadowColor}
          >
            Album !
          </LineShadowText>
        </h1>

        <MagicCard
          className="cursor-pointer flex-col whitespace-nowrap"
          gradientColor={resolvedTheme === "dark" ? "#262626" : "#D9D9D955"}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 my-10">
            <div className="flex justify-center items-center">
              <img
                src={albumData.images[0].url}
                alt={albumData.name}
                className="w-64 rounded-lg transition-transform hover:scale-105"
              />
            </div>

            <div className="flex flex-col justify-center p-5">
              <div className="mb-4">
                <p className="text-2xl font-semibold text-black">
                  {albumData.name}
                </p>
                <p className="text-gray-700 font-semibold">
                  Artists:{" "}
                  <span className="font-normal">
                    {albumData.artists[0].name}
                  </span>
                </p>
                <p className="text-gray-700 font-semibold">
                  Release Date:{" "}
                  <span className="font-normal">
                    {" "}
                    {albumData.release_date}{" "}
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
          </div>
        </MagicCard>

        <div className="my-10">
          <h2 className="text-2xl font-semibold text-center mb-4 text-black">
            Available on
          </h2>
          <div className="flex flex-wrap gap-4 justify-center">
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
                href={`https://music.apple.com/album/${albumId}`}
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
                href={`https://music.youtube.com/album/${albumId}`}
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
                href={`https://soundcloud.com/${albumId}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaSoundcloud className="text-3xl" /> Listen on SoundCloud
              </a>
            </Button>
          </div>
        </div>
        <MagicCard
          className="cursor-pointer flex-col whitespace-nowrap py-2"
          gradientColor={resolvedTheme === "dark" ? "#262626" : "#D9D9D955"}
        >
          <div className="overflow-x-auto shadow-md rounded-lg">
            <table className="min-w-full table-auto">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left">#</th>
                  <th className="px-6 py-3 text-left">Track</th>
                  <th className="px-6 py-3 text-left">Duration</th>
                  <th className="px-6 py-3 text-left">Rating</th>
                  <th className="px-6 py-3 text-left">
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
                    } // Add gray-out effect
                  >
                    <td className="px-6 py-3">{index + 1}</td>
                    <td className="px-6 py-3">{track.name}</td>
                    <td className="px-6 py-3">
                      {formatDuration(track.duration_ms / 1000)}
                    </td>
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
                        className="border px-3 py-1 rounded-lg"
                        min="0"
                        max="10"
                        disabled={grayedOutTracks.has(track.id)} // Disable input if grayed out
                      />
                    </td>
                    <td className="px-6 py-3">
                      <input
                        type="checkbox"
                        checked={selectedTracks.has(track.id)}
                        onChange={() => handleTrackSelect(track.id)}
                        className="w-5 h-5"
                      />
                    </td>
                    <td className="px-6 py-3">
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
          </div>
        </MagicCard>

        <div className="flex justify-center my-10">
          <Button
            onClick={handleSubmit}
            className="px-6 py-3 text-xl flex items-center justify-center gap-4 transition-all h-10 w-1/4"
          >
            <FaCheckCircle /> Submit
          </Button>
        </div>

        {averageRating && (
          <div className="text-center mt-5 text-xl font-semibold">
            <p>Your Average Rating: {averageRating}</p>
          </div>
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
        <Dialog open={isNewRatingDialogOpen} onOpenChange={setIsNewRatingDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rating Submitted</DialogTitle>
              <DialogDescription>
                Your rating for this album has been successfully submitted. What would you like to do next?
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
        <Dialog open={isSubmitConfirmationOpen} onOpenChange={setIsSubmitConfirmationOpen}>
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
              <Button onClick={handleConfirmSubmit}>
                Confirm
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* New Dialog After Updating Ratings */}
      {isUpdateCompleteDialogOpen && (
        <Dialog open={isUpdateCompleteDialogOpen} onOpenChange={setIsUpdateCompleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Review Updated</DialogTitle>
              <DialogDescription>
                Your review for this album has been successfully updated. What would you like to do next?
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