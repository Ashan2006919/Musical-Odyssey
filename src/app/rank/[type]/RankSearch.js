"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Modal from "@/components/Modal";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function RankSearch({ type }) {
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const handleSearch = async () => {
    if (!query.trim()) {
      setError("Please enter a valid search query.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const tokenResponse = await fetch("/api/spotify");
      const tokenData = await tokenResponse.json();

      if (!tokenResponse.ok || !tokenData.access_token) {
        throw new Error("Failed to retrieve Spotify access token.");
      }

      const access_token = tokenData.access_token;

      const searchResponse = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=album&limit=5`,
        {
          headers: { Authorization: `Bearer ${access_token}` },
        }
      );

      const searchData = await searchResponse.json();

      if (!searchResponse.ok || searchData.albums.items.length === 0) {
        throw new Error("No albums found for the given query.");
      }

      setSearchResults(searchData.albums.items);
      setIsModalOpen(true);
    } catch (err) {
      console.error("Error during search:", err);
      setError(err.message || "An error occurred during the search.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAlbum = (album) => {
    router.push({
      pathname: `/rank/${type}/results`,
      query: { albumId: album.id },
    });
    setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <motion.h1
        className="text-3xl font-bold mb-6"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        Search {type === "albums" ? "Albums" : "Tracks"}
      </motion.h1>
      <Input
        type="text"
        placeholder={`Search for ${type}...`}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-3/4 max-w-md mb-4"
      />
      <Button
        onClick={handleSearch}
        className="bg-blue-500 hover:bg-blue-600 text-white"
        disabled={loading}
      >
        {loading ? "Searching..." : "Search"}
      </Button>
      {error && <p className="text-red-500 mt-4">{error}</p>}

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSearchResults([]);
        }}
      >
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Select an Album</h2>
          <div className="grid grid-cols-1 gap-4">
            {searchResults.map((album) => (
              <div
                key={album.id}
                className="flex items-center gap-4 p-4 border rounded-lg"
              >
                <img
                  src={album.images[0]?.url}
                  alt={album.name}
                  className="w-16 h-16 object-cover rounded-md"
                />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{album.name}</h3>
                  <p className="text-sm text-gray-500">{album.artists[0]?.name}</p>
                </div>
                <Button
                  onClick={() => handleSelectAlbum(album)}
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  Select
                </Button>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
}