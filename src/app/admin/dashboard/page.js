"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react"; // Import useSession for session management
import { useRouter } from "next/navigation"; // Import useRouter for redirection
import { debounce } from "lodash"; // Import lodash for debouncing
import {
  LineChart,
  CartesianGrid,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { FaTrash } from "react-icons/fa"; // Import trash icon
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToastContainer, toast } from "react-toastify";
import AdminAddPlaylistDialog from "@/components/AdminAddPlaylistDialog";
import ConfirmationDialog from "@/components/ConfirmationDialog"; // Import the confirmation dialog
import UserManagementTable from "@/components/UserManagementTable";
import "react-toastify/dist/ReactToastify.css";
import { AppSidebar } from "@/components/nav/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import UserCountryChart from "@/components/UserCountryChart"; // Import the new chart
import Testing from "@/app/test/page";

export default function AdminDashboard() {
  const { data: session, status } = useSession(); // Get session data
  const router = useRouter();

  const [userStats, setUserStats] = useState([]); // For user growth chart
  const [totalUsers, setTotalUsers] = useState(0); // For total users
  const [predefinedPlaylists, setPredefinedPlaylists] = useState([]);
  const [filteredPredefinedPlaylists, setFilteredPredefinedPlaylists] =
    useState([]);
  const [predefinedSearchQuery, setPredefinedSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [playlistToDelete, setPlaylistToDelete] = useState(null);
  const [deleteType, setDeleteType] = useState(""); // To track whether it's a predefined or user-added playlist
  const [userAddedPlaylists, setUserAddedPlaylists] = useState([]);
  const [filteredUserAddedPlaylists, setFilteredUserAddedPlaylists] = useState(
    []
  );
  const [playlistSearchQuery, setPlaylistSearchQuery] = useState("");
  const [userIdSearchQuery, setUserIdSearchQuery] = useState("");
  const [countryStats, setCountryStats] = useState([]); // For country distribution chart
  const [isLoadingCountryStats, setIsLoadingCountryStats] = useState(true);

  const chartConfig = {
    desktop: {
      label: "Desktop",
      color: "hsl(var(--chart-1))",
    },
    mobile: {
      label: "Mobile",
      color: "hsl(var(--chart-2))",
    },
  };

  // Fetch user statistics and total users
  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const response = await fetch("/api/admin/userGrowth");
        if (!response.ok) throw new Error("Failed to fetch user growth data.");
        const data = await response.json();

        setUserStats(
          data.map((record) => ({
            date: record.date,
            users: record.totalUsers,
          }))
        );

        const total = data.reduce((sum, record) => sum + record.totalUsers, 0);
        setTotalUsers(total);
      } catch (error) {
        console.error("Error fetching user stats:", error);
        setUserStats([]); // Fallback to an empty array
      }
    };

    fetchUserStats();
  }, []);

  useEffect(() => {
    const fetchCountryStats = async () => {
      console.log(
        `[${new Date().toISOString()}] fetchCountryStats function called`
      );
      setIsLoadingCountryStats(true);
      try {
        const response = await fetch("/api/admin/userCountry");
        if (!response.ok) throw new Error("Failed to fetch country data.");
        const data = await response.json();
        console.log(
          `[${new Date().toISOString()}] API Response for Country Stats:`,
          data
        );
        setCountryStats(data || []);
      } catch (error) {
        console.error(
          `[${new Date().toISOString()}] Error fetching country stats:`,
          error
        );
        setCountryStats([]); // Fallback to an empty array
      } finally {
        setIsLoadingCountryStats(false);
      }
    };

    fetchCountryStats();
  }, []);

  useEffect(() => {
    console.log("Updated Country Stats State:", countryStats); // Log updated state
  }, [countryStats]);

  // Debug log to check the state before rendering
  console.log("Country Stats State:", countryStats);

  useEffect(() => {
    console.log("Updated Country Stats State:", countryStats);
  }, [countryStats]); // Logs whenever countryStats changes

  // Fetch predefined playlists
  useEffect(() => {
    const fetchPredefinedPlaylists = async () => {
      try {
        const response = await fetch(`/api/admin/predefinedPlaylists`);
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
    const fetchUserAddedPlaylists = async () => {
      try {
        const response = await fetch(`/api/admin/userAddedPlaylists`);
        const data = await response.json();
        setUserAddedPlaylists(data.playlists || []);
        setFilteredUserAddedPlaylists(data.playlists || []); // Initialize filtered playlists
      } catch (error) {
        console.error("Error fetching user-added playlists:", error);
        toast.error("Failed to fetch user-added playlists.");
      }
    };

    fetchUserAddedPlaylists();
  }, []);

  // Debounced search logic for user-added playlists
  useEffect(() => {
    const debouncedSearch = debounce(() => {
      const filtered = userAddedPlaylists.filter((playlist) => {
        const matchesName = playlistSearchQuery
          ? playlist.name
              ?.toLowerCase()
              .includes(playlistSearchQuery.toLowerCase())
          : true;
        const matchesUserOmid = userIdSearchQuery
          ? playlist.userOmid
              ?.toLowerCase()
              .includes(userIdSearchQuery.toLowerCase())
          : true;

        return matchesName && matchesUserOmid;
      });

      setFilteredUserAddedPlaylists(filtered);
    }, 300); // 300ms debounce delay

    debouncedSearch();

    // Cleanup function to cancel debounce on component unmount or input change
    return () => debouncedSearch.cancel();
  }, [playlistSearchQuery, userIdSearchQuery, userAddedPlaylists]);

  const handlePredefinedSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setPredefinedSearchQuery(query);

    const filtered = predefinedPlaylists.filter((playlist) =>
      playlist.name.toLowerCase().includes(query)
    );
    setFilteredPredefinedPlaylists(filtered);
  };

  const handlePlaylistAdded = (newPlaylist) => {
    setPredefinedPlaylists((prev) => [...prev, newPlaylist]);
    setFilteredPredefinedPlaylists((prev) => [...prev, newPlaylist]);
  };

  const handleDeleteClick = (playlistId, type) => {
    setPlaylistToDelete(playlistId); // Set the playlist to delete
    setDeleteType(type); // Set the type of playlist (predefined or user-added)
    setIsConfirmDialogOpen(true); // Open the confirmation dialog
  };

  const handleConfirmDelete = async () => {
    setIsConfirmDialogOpen(false); // Close the dialog
    if (!playlistToDelete) return;

    try {
      const endpoint =
        deleteType === "predefined"
          ? `/api/admin/deletePlaylist`
          : `/api/admin/deleteUserAddedPlaylist`;

      const response = await fetch(endpoint, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ playlistId: playlistToDelete }),
      });

      if (!response.ok) {
        const data = await response.json();
        toast.error(data.message || "Failed to delete playlist.");
        return;
      }

      // Update the state based on the type of playlist
      if (deleteType === "predefined") {
        setPredefinedPlaylists((prev) =>
          prev.filter((playlist) => playlist.id !== playlistToDelete)
        );
        setFilteredPredefinedPlaylists((prev) =>
          prev.filter((playlist) => playlist.id !== playlistToDelete)
        );
      } else {
        setUserAddedPlaylists((prev) =>
          prev.filter((playlist) => playlist.id !== playlistToDelete)
        );
        setFilteredUserAddedPlaylists((prev) =>
          prev.filter((playlist) => playlist.id !== playlistToDelete)
        );
      }

      toast.success("Playlist deleted successfully!");
    } catch (error) {
      console.error("Error deleting playlist:", error);
      toast.error(
        "An error occurred while deleting the playlist. Please try again."
      );
    } finally {
      setPlaylistToDelete(null); // Reset the playlist to delete
      setDeleteType(""); // Reset the delete type
    }
  };

  // Show a loading state while checking the session
  if (status === "loading") {
    return <p>Loading...</p>;
  }

  return (
    <div className="grid gap-6 grid-cols-4 auto-rows-auto p-6">
      {/* Total Users Card */}
      <Card className="col-span-4 md:col-span-1 shadow-md rounded-lg">
        <CardHeader>
          <CardTitle>Total Users</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">{totalUsers}</p>
        </CardContent>
      </Card>

      {/* User Growth Chart */}
      <Card className="col-span-4 md:col-span-3 shadow-md rounded-lg">
        <CardHeader>
          <CardTitle>User Growth Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <LineChart
              width={600}
              height={300}
              data={userStats}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="date" tickLine={false} axisLine={false} />
              <YAxis
                dataKey="users"
                domain={["auto", "auto"]}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Line
                type="monotone"
                dataKey="users"
                stroke="var(--color-desktop)"
                strokeWidth={3}
                dot={{
                  fill: "var(--color-desktop)",
                }}
                activeDot={{
                  r: 6,
                }}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="col-span-2 shadow-md rounded-lg">
        {isLoadingCountryStats ? (
          <p>Loading country stats...</p>
        ) : (
          <UserCountryChart data={countryStats || []} />
        )}
      </Card>
      <Card className="col-span-2 shadow-md rounded-lg">
        <Testing />
      </Card>
      {/* Predefined Playlists Section */}
      <Card className="col-span-4 shadow-md rounded-lg">
        <CardHeader>
          <CardTitle>Predefined Playlists</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search Bar and Add Playlist */}
          <div className="flex items-center gap-4 mb-4">
            <Input
              type="text"
              placeholder="Search predefined playlists..."
              value={predefinedSearchQuery}
              onChange={handlePredefinedSearch}
              className="w-full px-4 py-2 border rounded-lg"
            />

            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-blue-500 text-white hover:bg-blue-600"
              variant="outline"
            >
              + Add Playlist
            </Button>
          </div>

          {/* Scrollable Playlist Grid */}
          {filteredPredefinedPlaylists.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-96 overflow-y-auto overflow-x-hidden">
              {filteredPredefinedPlaylists.map((playlist) => (
                <div
                  key={playlist.id}
                  className="flex items-center gap-4 p-4 border rounded-lg shadow-sm hover:shadow-md transition relative"
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
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {playlist.description}
                    </p>
                  </div>
                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteClick(playlist.id, "predefined")}
                    className="absolute top-0 -right-3 text-red-500 hover:text-red-700"
                  >
                    <FaTrash /> {/* Trash Icon */}
                  </button>
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

      {/* User-Added Playlists Section */}
      <Card className="col-span-4 shadow-md rounded-lg">
        <CardHeader>
          <CardTitle>User-Added Playlists</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search Fields */}
          <div className="flex gap-4 mb-4">
            <Input
              type="text"
              placeholder="Search by playlist name..."
              value={playlistSearchQuery}
              onChange={(e) => setPlaylistSearchQuery(e.target.value)} // Update query on input change
              className="flex-grow px-4 py-2 border rounded-lg"
            />
            <Input
              type="text"
              placeholder="Search by user ID..."
              value={userIdSearchQuery}
              onChange={(e) => setUserIdSearchQuery(e.target.value)} // Update query on input change
              className="flex-grow px-4 py-2 border rounded-lg"
            />
          </div>

          {/* Scrollable Playlist Grid */}
          {filteredUserAddedPlaylists.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-96 overflow-y-auto overflow-x-hidden">
              {filteredUserAddedPlaylists.map((playlist) => (
                <div
                  key={playlist.id}
                  className="flex items-center gap-4 p-4 border rounded-lg shadow-sm hover:shadow-md transition relative"
                >
                  <img
                    src={playlist.imageUrl}
                    alt={playlist.name}
                    className="h-16 w-16 rounded-lg object-cover"
                  />
                  <div>
                    <p className="text-lg font-semibold text-blue-500 hover:underline">
                      {playlist.name}
                    </p>
                    <p
                      className="text-xs text-gray-600 dark:text-gray-400"
                      onClick={() =>
                        navigator.clipboard.writeText(playlist.userOmid)
                      }
                      title="Click to copy user ID"
                    >
                      User ID: {playlist.userOmid}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {playlist.description}
                    </p>
                  </div>
                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteClick(playlist.id, "userAdded")}
                    className="absolute top-0 -right-3 text-red-500 hover:text-red-700"
                  >
                    <FaTrash /> {/* Trash Icon */}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">
              No user-added playlists available.
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="col-span-4 shadow-md rounded-lg">
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent>
          {/* User Management Table */}
          <UserManagementTable />
        </CardContent>
      </Card>

      {/* Add Playlist Dialog */}
      <AdminAddPlaylistDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onPlaylistAdded={handlePlaylistAdded}
      />

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isConfirmDialogOpen}
        onClose={() => setIsConfirmDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        message="Are you sure you want to delete this playlist? This action cannot be undone."
      />

      <ToastContainer />
    </div>
  );
}
