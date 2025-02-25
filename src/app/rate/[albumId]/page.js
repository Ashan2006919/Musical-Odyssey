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
} from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { ToastContainer, toast } from "react-toastify";
import { useTheme } from "next-themes";
import { MagicCard } from "@/components/magicui/magic-card";
import "react-toastify/dist/ReactToastify.css";
import { LineShadowText } from "@/components/magicui/line-shadow-text";

const RateAlbum = () => {
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
  const { theme } = useTheme();

  const resolvedTheme = theme?.resolvedTheme || "light";
  const shadowColor = resolvedTheme === "dark" ? "white" : "black";

  const formatDuration = (durationInSeconds) => {
    const minutes = Math.floor(durationInSeconds / 60);
    const seconds = Math.round(durationInSeconds % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const calculateAverageRating = () => {
    const validRatings = Object.values(ratings).filter(
      (rating) => rating !== "" && rating >= 0 && rating <= 10
    );
    if (validRatings.length === 0) return null;
    const total = validRatings.reduce((acc, curr) => acc + parseFloat(curr), 0);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitClicked(true);

    // Check if all ratings are filled
    const emptyRatings = Object.values(ratings).some((rating) => rating === "");
    if (emptyRatings) {
      toast.error(
        <div className="ml-2 font-bold">
          You need to enter values for all tracks before submitting.
        </div>
      );
      return;
    }

    // Check whether there is a value higher than 10
    const invalidRatings = Object.values(ratings).some((rating) => rating > 10);
    if (invalidRatings) {
      toast.error(
        <div className="ml-2 font-bold">
          Ratings should be between 0 and 10.
        </div>
      );
      return;
    }

    const avgRating = calculateAverageRating();
    setAverageRating(avgRating);
    toast.success(`Average Rating: ${avgRating}`);

    // Send the data to the API endpoint
    try {
      const response = await axios.post('/api/saveRatings', {
        albumId,
        ratings,
        // Remove averageRating from the data being sent
      });

      if (response.status === 200) {
        toast.success('Ratings saved successfully');
      } else {
        toast.error('Failed to save ratings');
      }
    } catch (error) {
      console.error('Error saving ratings:', error);
      toast.error('Failed to save ratings');
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
                    <tr key={track.id}>
                      <td className="px-6 py-3">{index + 1}</td>
                      <td className="px-6 py-3">{track.name}</td>
                      <td className="px-6 py-3">
                        {formatDuration(track.duration_ms / 1000)}
                      </td>
                      <td className="px-6 py-3">
                        <input
                          type="number"
                          value={ratings[track.id]}
                          onChange={(e) =>
                            setRatings({ ...ratings, [track.id]: e.target.value })
                          }
                          className="border px-3 py-1 rounded-lg"
                          min="0"
                          max="10"
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
        <ToastContainer />
      </div>
  );
};

export default RateAlbum;
