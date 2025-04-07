"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Input } from "@/components/ui/input";
import { LineShadowText } from "@/components/magicui/line-shadow-text";
import { AnimatedSubscribeButton } from "@/components/magicui/animated-subscribe-button";
import { ChevronRightIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FaSpotify, FaStar, FaFilter } from "react-icons/fa"; // Import icons
import {
  AlbumSkeletonSearch,
  AlbumSkeletonRandom,
} from "@/components/AlbumSkeleton"; // Import skeleton loaders
import albumsByGenre from "../../../critically_acclaimed_albums_by_genre.json"; // Import JSON file
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"; // Import DropdownMenu components
import { useSession } from "next-auth/react";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const [query, setQuery] = useState("");
  const [albumData, setAlbumData] = useState(null);
  const [randomAlbums, setRandomAlbums] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [error, setError] = useState("");
  const [dominantColor, setDominantColor] = useState("#222"); // Default fallback
  const [selectedGenres, setSelectedGenres] = useState([]); // State for selected genres
  const [albumsBySelectedGenres, setAlbumsBySelectedGenres] = useState([]); // State to store albums for selected genres
  const [loadedAlbumIds, setLoadedAlbumIds] = useState(new Set()); // Set to keep track of loaded album IDs
  const theme = useTheme();
  const shadowColor = theme.resolvedTheme === "dark" ? "white" : "black";

  // Dynamic import for Vibrant to get dominant color
  const extractColor = async (imageUrl) => {
    try {
      const Vibrant = (await import("node-vibrant")).default; // Dynamic import
      const palette = await Vibrant.from(imageUrl).getPalette();
      return palette.Vibrant?.hex || "#222";
    } catch {
      return "#222";
    }
  };

  // Fetch random albums when the page loads or refreshes
  useEffect(() => {
    const fetchRandomAlbums = async () => {
      try {
        setLoading(true);

        // Fetch random album titles from the JSON file
        const genres = Object.keys(albumsByGenre);
        const selectedGenre = genres[Math.floor(Math.random() * genres.length)];
        const selectedTitles = albumsByGenre[selectedGenre].slice(0, 9); // Always fetch 9 albums

        // Fetch Spotify access token
        const tokenResponse = await fetch("/api/spotify");
        const tokenData = await tokenResponse.json();
        const access_token = tokenData.access_token;

        if (!access_token) {
          setError("Failed to retrieve access token.");
          return;
        }

        // Fetch random albums using the access token
        const randomAlbumsData = await Promise.all(
          selectedTitles.map(async (albumName) => {
            const searchResponse = await fetch(
              `https://api.spotify.com/v1/search?q=${encodeURIComponent(
                albumName
              )}&type=album&limit=1`,
              {
                headers: { Authorization: `Bearer ${access_token}` },
              }
            );
            const searchData = await searchResponse.json();
            return searchData.albums.items[0];
          })
        );

        setRandomAlbums(randomAlbumsData.filter((album) => album)); // Filter out any undefined results
        // Update the loadedAlbumIds with the album IDs for the random albums
        setLoadedAlbumIds(new Set(randomAlbumsData.map((album) => album.id)));
      } catch (err) {
        console.error("Error fetching random albums:", err);
        setError("Failed to fetch random albums.");
      } finally {
        setLoading(false);
      }
    };

    fetchRandomAlbums();
  }, []); // This effect runs once on page load

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
      console.log("Spotify API Token Response:", tokenData); // Debugging

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

      // Fetch album details using the access token
      const searchResponse = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(
          query
        )}&type=album&limit=1`,
        {
          headers: { Authorization: `Bearer ${access_token}` },
        }
      );

      const searchData = await searchResponse.json();
      console.log("Spotify Album Search Response:", searchData); // Debugging

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

      const album = searchData.albums.items[0];
      setAlbumData(album);

      // Extract dominant color for background
      const color = await extractColor(album.images[0].url);
      setDominantColor(color);
    } catch (err) {
      console.error("Error fetching album:", err);
      setError(err.message || "Failed to fetch album data.");
    } finally {
      setLoadingSearch(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleGenreChange = async (genre, checked) => {
    setSelectedGenres((prevGenres) => {
      if (checked) {
        return [...prevGenres, genre];
      } else {
        return prevGenres.filter((g) => g !== genre);
      }
    });
  };

  useEffect(() => {
    const fetchAlbumsByGenres = async () => {
      if (selectedGenres.length === 0) return;

      setLoading(true);
      setError("");

      try {
        const albumsForSelectedGenres = await Promise.all(
          selectedGenres.map(async (genre) => {
            const selectedTitles = albumsByGenre[genre].slice(0, 9); // Always fetch 9 albums per genre

            // Fetch Spotify access token
            const tokenResponse = await fetch("/api/spotify");
            const tokenData = await tokenResponse.json();
            const access_token = tokenData.access_token;

            if (!access_token) {
              setError("Failed to retrieve access token.");
              return [];
            }

            const albumsData = await Promise.all(
              selectedTitles.map(async (albumName) => {
                const searchResponse = await fetch(
                  `https://api.spotify.com/v1/search?q=${encodeURIComponent(
                    albumName
                  )}&type=album&limit=1`,
                  {
                    headers: { Authorization: `Bearer ${access_token}` },
                  }
                );
                const searchData = await searchResponse.json();
                return searchData.albums.items[0];
              })
            );
            return albumsData.filter((album) => album); // Filter out any undefined results
          })
        );

        const newAlbums = albumsForSelectedGenres.flat().filter(
          (album) => !loadedAlbumIds.has(album.id) // Filter out albums already loaded
        );

        // Update the loadedAlbumIds with the new albums
        setLoadedAlbumIds(
          (prevIds) =>
            new Set([...prevIds, ...newAlbums.map((album) => album.id)])
        );

        setAlbumsBySelectedGenres((prevAlbums) => [
          ...prevAlbums,
          ...newAlbums,
        ]);
      } catch (err) {
        console.error("Error fetching albums by genre:", err);
        setError("Failed to fetch albums by genre.");
      } finally {
        setLoading(false);
      }
    };

    fetchAlbumsByGenres();
  }, [selectedGenres]); // Depend on selectedGenres to trigger the effect when genres change

  return (
    <div className="flex flex-col items-center mt-10 min-h-screen px-6">
      {/* Title */}
      <h1 className="text-[clamp(2rem,10vw,5rem)] font-extrabold leading-tight tracking-tighter text-center">
        Welcome to
        <LineShadowText
          className="italic text-primary ml-3 whitespace-nowrap"
          shadowColor={shadowColor}
        >
          Musical Odyssey!
        </LineShadowText>
      </h1>

      {/* Search Input */}
      <div className="flex items-center justify-center gap-4 mt-8 w-full max-w-lg">
        <Input
          type="text"
          placeholder="Enter album name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="p-4 text-lg border rounded-md shadow-lg focus:ring-2 focus:ring-primary focus:outline-none w-full max-w-md h-11 transition-all duration-300 ease-in-out"
        />

        <AnimatedSubscribeButton
          className="w-36 p-4 text-lg rounded-md shadow-lg bg-primary text-white hover:bg-primary-dark transition-all duration-300 ease-in-out flex items-center justify-center h-11"
          onClick={handleSearch}
          disabled={loadingSearch}
        >
          <span className="group inline-flex items-center">
            <span>{loadingSearch ? "Searching..." : "Search"}</span>
          </span>
          <span>
            {!loadingSearch && (
              <ChevronRightIcon className="ml-1 size-4 transition-transform duration-300 group-hover:translate-x-1" />
            )}
          </span>
        </AnimatedSubscribeButton>
      </div>

      {/* Genre Filter */}
      <div className="mb-6 mt-8 w-full max-w-lg">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              color="primary"
              className="p-2 text-lg border rounded-md shadow-lg bg-primary text-white hover:bg-primary-dark transition-all duration-300 ease-in-out flex items-center justify-center h-11 absolute left-8"
            >
              <FaFilter className="mr-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48 absolute -left-6 mt-2 border border-orange-500">
            <DropdownMenuLabel className="bg-orange-500 rounded-t-md text-white">
              Select Genre
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {Object.keys(albumsByGenre).map((genre) => (
              <DropdownMenuCheckboxItem
                key={genre}
                checked={selectedGenres.includes(genre)}
                onCheckedChange={(checked) => handleGenreChange(genre, checked)}
                className="text-gray-800 hover:bg-gray-100"
              >
                {genre}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Error Message */}
      {error && <p className="text-red-500 text-center">{error}</p>}
      <div>
        {/* Album Card */}
        {loadingSearch ? (
          <AlbumSkeletonSearch />
        ) : albumData ? (
          <Card className="relative w-full max-w-2xl overflow-hidden shadow-md rounded-md transition-all duration-300 ease-in-out">
            {/* Background Cover (Blurred, More Visible) */}
            <div
              className="absolute inset-0 w-full h-full bg-cover bg-center blur-sm"
              style={{ backgroundImage: `url(${albumData.images[0].url})` }}
            ></div>

            {/* Overlay (Less Dark, Adds Gradient) */}
            <div
              className="absolute inset-0 bg-black/10 rounded-xl 
            before:absolute before:bottom-0 before:left-0 before:w-full before:h-1/3 
            before:bg-gradient-to-t before:to-transparent"
            ></div>

            <CardContent className="relative flex items-center gap-x-6 p-6 flex-nowrap">
              {" "}
              {/* More spacing & no wrapping */}
              {/* Album Cover */}
              <img
                src={albumData.images[0].url}
                alt={albumData.name}
                className="w-56 h-56 object-cover rounded-lg shadow-lg transition-transform hover:scale-105"
              />
              {/* Album Info */}
              <div className="flex flex-col items-start text-left w-full">
                <h2 className="text-2xl font-bold text-white drop-shadow-md">
                  {albumData.name}
                </h2>
                <p className="text-lg text-gray-200">
                  {albumData.artists[0].name}
                </p>

                {/* Buttons */}
                <div className="flex gap-3 mt-4 w-full">
                  <Button
                    asChild
                    className="flex-1 px-5 py-2 flex items-center justify-center gap-2 transition-all shadow-md bg-green-500 hover:bg-green-600 text-md text-white rounded-lg"
                  >
                    <a
                      href={albumData.external_urls.spotify}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FaSpotify className="text-lg" /> View on Spotify
                    </a>
                  </Button>

                  <Button
                    onClick={() => router.push(`/rate/${albumData.id}`)}
                    className="flex-1 px-5 py-2 flex items-center justify-center gap-2 transition-all shadow-md bg-violet-600 hover:bg-indigo-700 text-md text-white rounded-lg"
                  >
                    <FaStar className="text-lg" /> Rate This Album
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>
      {/* Random Albums Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8 pb-10 pt-5">
          {Array.from({ length: 9 }).map((_, index) => (
            <AlbumSkeletonRandom key={index} />
          ))}
        </div>
      ) : (
        randomAlbums.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8 pb-10 pt-5">
            {randomAlbums.map((album) => (
              <Card
                key={album.id}
                className="relative w-full overflow-hidden shadow-md rounded-md transition-all duration-300 ease-in-out"
              >
                {/* Background Cover (Blurred, More Visible) */}
                <div
                  className="absolute inset-0 w-full h-full bg-cover bg-center blur-sm"
                  style={{ backgroundImage: `url(${album.images[0].url})` }}
                ></div>

                {/* Overlay (Less Dark, Adds Gradient) */}
                <div
                  className="absolute inset-0 bg-black/10 rounded-xl 
                  before:absolute before:bottom-0 before:left-0 before:w-full before:h-1/3 
                  before:bg-gradient-to-t before:to-transparent"
                ></div>

                <CardContent className="relative flex items-center gap-x-6 p-6 flex-nowrap">
                  {" "}
                  {/* More spacing & no wrapping */}
                  {/* Album Cover */}
                  <img
                    src={album.images[0].url}
                    alt={album.name}
                    className="w-32 h-32 object-cover rounded-lg shadow-lg transition-transform hover:scale-105"
                  />
                  {/* Album Info */}
                  <div className="flex flex-col items-start text-left w-full">
                    <h2 className="text-xl font-bold text-white drop-shadow-md">
                      {album.name}
                    </h2>
                    <p className="text-md text-gray-200">
                      {album.artists[0].name}
                    </p>

                    {/* Buttons */}
                    <div className="flex gap-3 mt-4 w-full">
                      <Button
                        asChild
                        className="flex-1 px-3 py-1 flex items-center justify-center gap-2 transition-all shadow-md bg-green-500 hover:bg-green-600 text-sm text-white rounded-lg"
                      >
                        <a
                          href={album.external_urls.spotify}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <FaSpotify className="text-lg" /> Spotify
                        </a>
                      </Button>

                      <Button
                        onClick={() => router.push(`/rate/${album.id}`)}
                        className="flex-1 px-3 py-1 flex items-center justify-center gap-2 transition-all shadow-md bg-violet-600 hover:bg-indigo-700 text-sm text-white rounded-lg"
                      >
                        <FaStar className="text-lg" /> Rate
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      )}

      {/* Albums by Selected Genres Grid */}
      {albumsBySelectedGenres.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8 pb-10 pt-5">
          {albumsBySelectedGenres.map((album) => (
            <Card
              key={album.id}
              className="relative w-full overflow-hidden shadow-md rounded-md transition-all duration-300 ease-in-out"
            >
              {/* Background Cover (Blurred, More Visible) */}
              <div
                className="absolute inset-0 w-full h-full bg-cover bg-center blur-sm"
                style={{ backgroundImage: `url(${album.images[0].url})` }}
              ></div>

              {/* Overlay (Less Dark, Adds Gradient) */}
              <div
                className="absolute inset-0 bg-black/10 rounded-xl 
                before:absolute before:bottom-0 before:left-0 before:w-full before:h-1/3 
                before:bg-gradient-to-t before:to-transparent"
              ></div>

              <CardContent className="relative flex items-center gap-x-6 p-6 flex-nowrap">
                {" "}
                {/* More spacing & no wrapping */}
                {/* Album Cover */}
                <img
                  src={album.images[0].url}
                  alt={album.name}
                  className="w-32 h-32 object-cover rounded-lg shadow-lg transition-transform hover:scale-105"
                />
                {/* Album Info */}
                <div className="flex flex-col items-start text-left w-full">
                  <h2 className="text-xl font-bold text-white drop-shadow-md">
                    {album.name}
                  </h2>
                  <p className="text-md text-gray-200">
                    {album.artists[0].name}
                  </p>

                  {/* Buttons */}
                  <div className="flex gap-3 mt-4 w-full">
                    <Button
                      asChild
                      className="flex-1 px-3 py-1 flex items-center justify-center gap-2 transition-all shadow-md bg-green-500 hover:bg-green-600 text-sm text-white rounded-lg"
                    >
                      <a
                        href={album.external_urls.spotify}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FaSpotify className="text-lg" /> Spotify
                      </a>
                    </Button>

                    <Button
                      onClick={() => router.push(`/rate/${album.id}`)}
                      className="flex-1 px-3 py-1 flex items-center justify-center gap-2 transition-all shadow-md bg-violet-600 hover:bg-indigo-700 text-sm text-white rounded-lg"
                    >
                      <FaStar className="text-lg" /> Rate
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
