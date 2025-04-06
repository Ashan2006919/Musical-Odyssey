"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import axios from "axios";
import { MagicCard } from "@/components/magicui/magic-card";
import { LineShadowText } from "@/components/magicui/line-shadow-text";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faSave } from "@fortawesome/free-solid-svg-icons";
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

const RatingsPage = () => {
  const [ratingsData, setRatingsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [editedRatings, setEditedRatings] = useState({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { theme } = useTheme();

  const resolvedTheme = theme?.resolvedTheme || "light";
  const shadowColor = resolvedTheme === "dark" ? "white" : "black";

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        const response = await axios.get("/api/getRatings");
        const ratings = response.data;

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
                  releaseDate: trackData.album.release_date, // Add release date
                };
              })
            );

            return { ...rating, trackDetails };
          })
        );

        setRatingsData(updatedRatings);
        setLoading(false);
      } catch (error) {
        setError("Failed to load ratings data");
        setLoading(false);
      }
    };

    fetchRatings();
  }, []);

  const handleEditClick = (ratingId) => {
    setEditing(ratingId);
    const rating = ratingsData.find((r) => r._id === ratingId);
    setEditedRatings(rating.ratings);
    setIsDialogOpen(true);
  };

  const handleRatingChange = (trackId, value) => {
    setEditedRatings((prev) => ({
      ...prev,
      [trackId]: value,
    }));
  };

  const calculateAverageRating = (ratings) => {
    const total = Object.values(ratings).reduce((acc, rating) => acc + Number(rating), 0);
    const average = (total / Object.values(ratings).length).toFixed(2);
    console.log('Calculated average rating:', average); // Debugging log
    return average;
  };

  const handleSaveClick = async (ratingId) => {
    const originalRating = ratingsData.find((rating) => rating._id === ratingId).ratings;
    const hasChanges = Object.keys(editedRatings).some(
      (trackId) => editedRatings[trackId] !== originalRating[trackId]
    );

    if (!hasChanges) {
      setEditing(null);
      setIsDialogOpen(false);
      return;
    }

    try {
      await axios.post("/api/updateRatings", {
        ratingId,
        ratings: editedRatings,
      });
      const updatedRatingsData = ratingsData.map((rating) =>
        rating._id === ratingId
          ? { ...rating, ratings: editedRatings, averageRating: calculateAverageRating(editedRatings) }
          : rating
      );
      setRatingsData(updatedRatingsData);
      setEditing(null);
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Failed to save ratings", error);
    }
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

  if (error) return <p>{error}</p>;

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
          {ratingsData.map((rating) => (
            <MagicCard
              className="cursor-pointer flex-col whitespace-nowrap shadow-md rounded-lg p-6 relative"
              gradientColor={resolvedTheme === "dark" ? "#262626" : "#D9D9D955"}
              key={rating._id}
            >
              <button
                className="absolute -right-8 top-2 text-gray-600 hover:text-gray-800 text-xl"
                onClick={() => handleEditClick(rating._id)}
              >
                <FontAwesomeIcon icon={faEdit} />
              </button>
              <div className="flex items-center mb-4">
                <img
                  src={rating.trackDetails[0]?.albumCover}
                  alt={rating.trackDetails[0]?.albumName}
                  className="h-20 w-20 rounded-md mr-4"
                />
                <div className="flex flex-col">
                  <h2 className="text-2xl font-bold text-wrap">
                    {rating.trackDetails[0]?.albumName}
                  </h2>
                  <p className="text-gray-600">
                    {rating.trackDetails[0]?.albumArtist}
                  </p>
                  <p className="text-gray-600 text-sm mt-1">
                    {rating.trackDetails[0]?.releaseDate}
                  </p>
                </div>
              </div>
              <div>
                <div className="flex items-center mb-2 justify-between pb-5">
                  <h3 className="text-xl font-semibold">Track Ratings:</h3>
                  <RatingLabel rating={calculateAverageRating(rating.ratings)} /> {/* Pass the updated rating */}
                </div>
                {rating.trackDetails.map((track, index) => (
                  <div key={track.trackId} className="flex justify-between items-center mb-2">
                    <span className="w-1/2 text-wrap">
                      {index + 1}. {track.name}
                    </span>
                    <div
                      className="border rounded p-1 text-center"
                      style={{ width: '3rem', borderBottom: '2px solid #000', borderRadius: '0' }}
                    >
                      {rating.ratings[track.trackId]}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <p className="text-gray-600 text-lg font-semibold">
                  Average Rating :{" "}
                  <span className="font-medium">{calculateAverageRating(rating.ratings)}</span>
                </p>
              </div>
            </MagicCard>
          ))}
        </div>
      </div>

      {editing && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px] h-[650px] flex flex-col"> {/* Use flex layout */}
            <DialogHeader>
              <DialogTitle className="pb-1">Edit Ratings</DialogTitle>
              <DialogDescription>
                Make changes to your ratings here. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <hr />
            {/* Scrollable tracklist container */}
            <div className="grid gap-4 pb-4 pt-2 overflow-y-auto flex-grow"> {/* Allow tracklist to grow and scroll */}
              {ratingsData.find((r) => r._id === editing)?.trackDetails.map((track) => (
                <div key={track.trackId} className="grid grid-cols-4 items-center gap-4 mr-5">
                  <Label htmlFor={`rating-${track.trackId}`} className="text-right">
                    {track.name}
                  </Label>
                  <Input
                    id={`rating-${track.trackId}`}
                    type="number"
                    value={editedRatings[track.trackId]}
                    onChange={(e) => handleRatingChange(track.trackId, e.target.value)}
                    className="col-span-3"
                  />
                </div>
              ))}
            </div>
            
            <DialogFooter className="bg-white mt-4"> {/* Ensure footer stays at the bottom */}
              <Button onClick={() => handleSaveClick(editing)}>Save changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default RatingsPage;
