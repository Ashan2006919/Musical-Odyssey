"use client";

import { useEffect, useState, Suspense } from "react";
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
            const trackDetails = await Promise.all(
              Object.keys(rating.ratings).map(async (trackId) => {
                const trackResponse = await axios.get(
                  `/api/spotify/details?trackId=${trackId}`
                );
                const trackData = trackResponse.data;
                return {
                  trackId,
                  name: trackData.name,
                  albumName: trackData.album.name,
                  albumArtist: trackData.artists
                    .map((artist) => artist.name)
                    .join(", "),
                  albumCover: trackData.album.images[0]?.url,
                  releaseDate: trackData.album.release_date,
                };
              })
            );

            return { ...rating, trackDetails, albumId: rating.albumId };
          })
        );

        console.log("Updated Ratings:", updatedRatings);

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

  const handleViewRatingsClick = (ratingId) => {
    const rating = ratingsData.find((r) => r._id === ratingId); // Find the rating by ID
    if (rating) {
      setSelectedRating(rating); // Set the selected rating
      setIsViewRatingsDialogOpen(true); // Open the dialog
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

    const filtered = ratingsData.filter((rating) =>
      rating.trackDetails.some((track) => {
        const releaseYear = track.releaseDate?.split("-")[0];
        const releaseDecade = releaseYear?.slice(0, 3) + "0";

        return (
          (track.albumName.toLowerCase().includes(query) ||
            track.albumArtist.toLowerCase().includes(query)) &&
          (yearFilter === "" || releaseDecade === yearFilter)
        );
      })
    );

    setFilteredRatings(filtered);
  };

  const handleYearFilterChange = (selectedYear) => {
    setYearFilter(selectedYear);

    const filtered = ratingsData.filter((rating) =>
      rating.trackDetails.some((track) => {
        const releaseYear = track.releaseDate?.split("-")[0];
        return selectedYear === "" || releaseYear === selectedYear;
      })
    );

    setFilteredRatings(filtered);
  };

  if (loading) {
    return (
      <div className="py-5">
        <div className="container mx-auto pb-10">
          <h1 className="text-[clamp(2rem,10vw,5rem)] font-extrabold leading-tight tracking-tighter text-center mb-10">
            Your Rated
            <LineShadowText
              className="italic text-primary ml-3 whitespace-nowrap"
              shadowColor={shadowColor}
            >
              Albums !
            </LineShadowText>
          </h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-36">
            {Array.from({ length: ratingsData.length || 6 }).map((_, index) => (
              <RatingSkeleton key={index} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!loading && filteredRatings.length === 0) {
    return (
      <div className="py-5">
        <div className="container mx-auto pb-10 px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-[clamp(2rem,10vw,5rem)] font-extrabold leading-tight tracking-tighter text-center mb-10 text-red-500">
            No Rated
            <LineShadowText
              className="italic text-primary ml-3 whitespace-nowrap"
              shadowColor={shadowColor}
            >
              Albums Yet!
            </LineShadowText>
          </h1>
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
        </div>
      </div>
    );
  }

  if (error) return <p>{error}</p>;

  console.log("Filtered Ratings:", filteredRatings);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="py-5">
        <ToastContainer />
        <div className="container mx-auto pb-10 px-4 sm:px-6 lg:px-8">
          <h1 className="text-[clamp(2rem,10vw,5rem)] font-extrabold leading-tight tracking-tighter text-center mb-10">
            Your Rated
            <LineShadowText
              className="italic text-primary ml-3 whitespace-nowrap"
              shadowColor={shadowColor}
            >
              Albums !
            </LineShadowText>
          </h1>

          {/* Search and Filter */}
          <div className="mb-10 -mt-4 flex justify-center items-center gap-4">
            {/* Reset Button */}
            <button
              onClick={() => {
                setSearchQuery(""); // Clear the search query
                setYearFilter(""); // Clear the year filter
                setFilteredRatings(ratingsData); // Reset to show all ratings
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
                    <DropdownMenuSubTrigger>
                      <span>{decade}</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent>
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-24">
            {filteredRatings.map((rating) => (
              <MagicCard
                className="cursor-pointer flex-col whitespace-nowrap shadow-md rounded-lg p-6 relative transition-transform duration-300 hover:scale-105 hover:shadow-lg"
                gradientColor={
                  resolvedTheme === "dark" ? "#262626" : "#D9D9D955"
                }
                key={rating._id}
              >
                <button
                  className="absolute -right-8 top-4 text-gray-600 hover:text-gray-800 text-xl"
                  onClick={() => handleEditClick(rating._id)} // Pass the correct ratingId
                >
                  <FontAwesomeIcon icon={faEdit} />
                </button>
                <div className="flex items-center mb-4">
                  <img
                    src={rating.trackDetails[0]?.albumCover}
                    alt={rating.trackDetails[0]?.albumName}
                    className="h-20 w-20 rounded-md mr-4 transition-transform hover:scale-110"
                  />
                  <div className="flex flex-col">
                    <h2 className="text-2xl font-bold text-wrap">
                      {rating.trackDetails[0]?.albumName}
                    </h2>
                    <p className="text-gray-600 text-wrap">
                      {rating.trackDetails[0]?.albumArtist}
                    </p>
                    <p className="text-gray-600 text-sm mt-1 text-wrap">
                      {rating.trackDetails[0]?.releaseDate}
                    </p>
                  </div>
                </div>
                <div>
                  <div className="flex items-center mb-2 justify-between">
                    <h3 className="text-xl font-semibold">Track Ratings:</h3>
                    <RatingLabel
                      rating={calculateAverageRating(rating.ratings)}
                    />{" "}
                    {/* Pass the updated rating */}
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-gray-600 text-lg font-semibold">
                    Average Rating:{" "}
                    <span className="font-medium">
                      {calculateAverageRating(rating.ratings)}
                    </span>
                  </p>
                  {/* Add the rating label */}
                </div>
                <div className="flex gap-4 mt-4">
                  <Button
                    className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2"
                    onClick={() => handleViewRatingsClick(rating._id)} // Open View Ratings dialog
                  >
                    <FontAwesomeIcon icon={faSearch} /> {/* Add search icon */}
                    View Ratings
                  </Button>
                  <Button
                    className="bg-orange-500 hover:bg-orange-600 text-white flex items-center gap-2"
                    onClick={() => handleViewTrendsClick(rating._id)} // Open Trends dialog
                  >
                    <FontAwesomeIcon icon={faChartLine} /> {/* Add trends icon */}
                    View Trends
                  </Button>
                </div>
              </MagicCard>
            ))}
          </div>
        </div>

        {/* Edit Ratings Dialog */}
        {editing && (
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
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
              <DialogFooter className="bg-white mt-4">
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
          </Dialog>
        )}

        {/* View Trends Dialog */}
        {isTrendDialogOpen && (
          <Dialog open={isTrendDialogOpen} onOpenChange={setIsTrendDialogOpen}>
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
          </Dialog>
        )}

        {/* View Ratings Dialog */}
        {isViewRatingsDialogOpen &&
          selectedRating &&
          filteredRatings.map((rating) => (
            <Dialog
              key={rating.id} // make sure there's a unique `key`
              open={isViewRatingsDialogOpen}
              onOpenChange={setIsViewRatingsDialogOpen}
            >
              <DialogContent className="w-[95%] max-w-[450px] h-[650px] flex flex-col px-4 sm:px-4 mx-1 sm:mx-auto rounded-lg">
                <DialogHeader>
                  <DialogTitle className="pb-1 text-orange-500">
                    <div className="flex items-center mb-4">
                      <img
                        src={selectedRating.trackDetails[0]?.albumCover}
                        alt={selectedRating.trackDetails[0]?.albumName}
                        className="h-20 w-20 rounded-md mr-4 transition-transform hover:scale-110"
                      />
                      <div className="flex flex-col">
                        <h2 className="text-2xl font-bold text-wrap">
                          {selectedRating.trackDetails[0]?.albumName}
                        </h2>
                        <p className="text-gray-600 text-wrap">
                          {selectedRating.trackDetails[0]?.albumArtist}
                        </p>
                        <p className="text-gray-600 text-sm mt-1 text-wrap">
                          {selectedRating.trackDetails[0]?.releaseDate}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-end mr-5 -mt-14">
                      <RatingLabel
                        rating={calculateAverageRating(rating.ratings)}
                      />
                    </div>
                  </DialogTitle>
                </DialogHeader>
                <hr />
                <DialogDescription className="text-gray-600 text-sm text-wrap">
                  Track ratings for this album :
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
                          <p className="text-base font-semibold text-gray-800 text-wrap">
                            {track.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {track.trackId}
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
                              This track hasn't been rated because it was
                              grayed out by you.
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
            </Dialog>
          ))}
        {searchParams.get("albumId") && (
          <p>Album ID: {searchParams.get("albumId")}</p>
        )}
      </div>
    </Suspense>
  );
};

export default RatingsPage;
