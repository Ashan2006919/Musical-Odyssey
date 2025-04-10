"use client";

import { useSession } from "next-auth/react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import ProfileDetails from "@/components/profile-components/profile-details";
import { fetchPlaylistsData } from "@/utils/playlistData"; // Import shared playlist logic
import { Input } from "@/components/ui/input";
import AddPlaylistDialog from "@/components/AddPlaylistDialog"; // Import the new component
import { LineShadowText } from "@/components/magicui/line-shadow-text";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import Toastify styles
import { FaTrash } from "react-icons/fa";

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
        const tokenResponse = await fetch("/api/spotify");
        const { access_token } = await tokenResponse.json();

        const fetchedPlaylists = await fetchPlaylistsData(access_token); // Use shared logic
        setPredefinedPlaylists(fetchedPlaylists);
        setFilteredPredefinedPlaylists(fetchedPlaylists); // Initialize filtered playlists
      } catch (error) {
        console.error("Error fetching predefined playlists:", error);
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

  const handlePlaylistAdded = (newPlaylist) => {
    setUserPlaylists((prev) => [...prev, newPlaylist]); // Add the new playlist to the grid
    setFilteredUserPlaylists((prev) => [...prev, newPlaylist]); // Update filtered playlists
  };

  const handleDeletePlaylist = async (playlistId) => {
    try {
      const response = await fetch(`/api/deletePlaylist`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ playlistId, userOmid: session.user.omid }),
      });

      if (!response.ok) {
        const data = await response.json();
        toast.error(data.message || "Failed to delete playlist.");
        return;
      }

      // Remove the playlist from the state
      setUserPlaylists((prev) =>
        prev.filter((playlist) => playlist.id !== playlistId)
      );
      setFilteredUserPlaylists((prev) =>
        prev.filter((playlist) => playlist.id !== playlistId)
      );
      toast.success("Playlist deleted successfully!");
    } catch (error) {
      console.error("Error deleting playlist:", error);
      toast.error(
        "An error occurred while deleting the playlist. Please try again."
      );
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
    <div className="shadow-lg rounded-lg p-8">
      {/* Title */}
      <h1 className="text-[clamp(2rem,10vw,5rem)] font-extrabold leading-tight tracking-tighter text-center mb-10">
        Your
        <LineShadowText
          className="italic text-primary ml-3 whitespace-nowrap"
          shadowColor={shadowColor}
        >
          Dashboard!
        </LineShadowText>
      </h1>
      <div className="grid gap-6 grid-cols-4 auto-rows-auto">
        {/* Profile Card */}
        <Card className="col-span-4 md:col-span-1 bg-white shadow-md rounded-lg row-span-3 md:row-span-2">
          <CardHeader>
            <CardTitle><Badge className="w-fit -ml-3 -mt-3 absolute">Profile</Badge></CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
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
              </div>
              <p className="text-lg font-semibold text-gray-700">
                {user.name || "N/A"}
              </p>
              <p className="text-gray-600">{user.email || "N/A"}</p>
              <p className="text-gray-600">OMID: {user.omid || "N/A"}</p>
              <p className="text-gray-600">
                {user?.provider === "google"
                  ? "Logged in via Google"
                  : user?.provider === "github"
                  ? "Logged in via GitHub"
                  : user?.provider === "spotify"
                  ? "Logged in via Spotify"
                  : "Logged in via traditional method"}
              </p>
              {/* Album Ratings Counter */}
              <p className="text-gray-600 mt-4">
                Albums Rated:{" "}
                <span className="font-bold">{albumRatingsCount}</span>
              </p>
            </div>
          </CardContent>
        </Card>
        {/* Profile Details */}
        <Card className="col-span-4 md:col-span-1 bg-white shadow-md rounded-lg p-4 row-span-3 md:row-span-2">
          <CardHeader>
          <CardTitle><Badge className="w-fit -ml-3 -mt-3 absolute">Extra Details</Badge></CardTitle>
          </CardHeader>
          <CardContent>
            <ProfileDetails />
          </CardContent>
        </Card>
        {/* Profile Details */}
        <Card className="col-span-4 md:col-span-1 bg-white shadow-md rounded-lg p-4 row-span-3 md:row-span-2">
          <CardHeader>
            <CardTitle>Extra Details</CardTitle>
          </CardHeader>
          <CardContent>
            <ProfileDetails />
          </CardContent>
        </Card>
        {/* Profile Details */}
        <Card className="col-span-4 md:col-span-1 bg-white shadow-md rounded-lg p-4 row-span-3 md:row-span-2">
          <CardHeader>
            <CardTitle>Extra Details</CardTitle>
          </CardHeader>
          <CardContent>
            <ProfileDetails />
          </CardContent>
        </Card>
        {/* Predefined Playlists Section */}
        <Card className="md:col-span-2 col-span-4 row-span-2 bg-white shadow-md rounded-lg p-4">
          <CardHeader>
          <CardTitle><Badge className="w-fit ml-2 -mt-6 absolute text-base bg-teal-400 hover:bg-teal-500">Our Playlists</Badge></CardTitle>
          </CardHeader>
          <CardContent>
            {/* Search Bar */}
            <div className="mb-4">
              <Input
                type="text"
                placeholder="Search predefined playlists..."
                value={predefinedSearchQuery}
                onChange={handlePredefinedSearch}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>

            {/* Scrollable Playlist Grid */}
            {filteredPredefinedPlaylists.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {filteredPredefinedPlaylists.map((playlist) => (
                  <div
                    key={playlist.id}
                    className="flex items-center gap-4 p-4 border rounded-lg shadow-sm hover:shadow-md transition"
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
                      <p className="text-sm text-gray-600">
                        {playlist.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500">
                No predefined playlists available.
              </p>
            )}
          </CardContent>
        </Card>

        {/* User Playlists Section */}
        <Card className="md:col-span-2 col-span-4 row-span-2 bg-white shadow-md rounded-lg p-4">
          <CardHeader>
          <CardTitle><Badge className="w-fit ml-1 -mt-6 absolute text-base bg-teal-400 hover:bg-teal-500">Your Playlists</Badge></CardTitle>
          </CardHeader>
          <CardContent>
            {/* Search Bar and Add Playlist */}
            <div className="flex items-center gap-4 mb-4">
              <Input
                type="text"
                placeholder="Search your playlists..."
                value={userSearchQuery}
                onChange={handleUserSearch}
                className="flex-grow"
              />
              <Button
                onClick={() => setIsDialogOpen(true)}
                className="bg-blue-500 text-white"
              >
                + Add
              </Button>
            </div>

            {/* Scrollable Playlist Grid */}
            {filteredUserPlaylists.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
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
                      <p className="text-sm text-gray-600">
                        {playlist.description}
                      </p>
                    </div>
                    {/* Delete Button */}
                    <button
                      onClick={() => handleDeletePlaylist(playlist.id)}
                      className="absolute top-0 -right-3 text-red-500 hover:text-red-700"
                    >
                      <FaTrash /> {/* Trash Icon */}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500">
                You have not added any playlists yet.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Other Cards */}

        {/* Calendar Card */}
        <Card className="col-span-3 md:col-span-1 bg-white shadow-md rounded-lg p-4 row-span-3 md:row-span-1">
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center items-center">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        {/* Profile Details */}
        <Card>
          <CardHeader>
            <CardTitle>Extra Details</CardTitle>
          </CardHeader>
          <CardContent>
            <ProfileDetails />
          </CardContent>
        </Card>
      </div>
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
      <div className="mt-8 flex justify-center gap-4">
        <Button variant="outline" className="px-6 py-2 text-lg">
          Edit Profile
        </Button>
        <Button className="px-6 py-2 text-lg bg-red-500 hover:bg-red-600 text-white">
          Delete Account
        </Button>
      </div>
      <ToastContainer /> {/* Add this to render toast notifications */}
    </div>
  );
};

export default ProfilePage;
