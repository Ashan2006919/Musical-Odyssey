import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";

const AdminAddPlaylistDialog = ({ isOpen, onClose, onPlaylistAdded }) => {
  const [playlistUrl, setPlaylistUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAddPlaylist = async () => {
    if (!playlistUrl) {
      toast.error("Please enter a valid Spotify playlist URL.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/addPlaylist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ playlistUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add playlist.");
      }

      toast.success(data.message || "Playlist added successfully!");
      onPlaylistAdded(data.playlist);
      setPlaylistUrl("");
      onClose();
    } catch (error) {
      console.error("Error adding playlist:", error);
      toast.error("An error occurred while adding the playlist. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a New Playlist</DialogTitle>
        </DialogHeader>
        <Input
          type="text"
          placeholder="Enter Spotify playlist URL"
          value={playlistUrl}
          onChange={(e) => setPlaylistUrl(e.target.value)}
          className="w-full mb-4"
        />
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleAddPlaylist} disabled={isLoading}>
            {isLoading ? "Adding..." : "Add Playlist"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdminAddPlaylistDialog;