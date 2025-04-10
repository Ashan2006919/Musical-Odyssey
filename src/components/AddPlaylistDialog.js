import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const AddPlaylistDialog = ({ isOpen, onClose, onPlaylistAdded, userOmid, onToastMessage, userPlaylists }) => {
  const [newPlaylistId, setNewPlaylistId] = useState("");

  const handleAddPlaylist = async () => {
    if (!newPlaylistId) {
      onToastMessage("Please enter a valid Spotify playlist ID.", "error");
      return;
    }

    // Check if the playlist already exists
    const playlistId = newPlaylistId.split("/").pop().split("?")[0]; // Extract playlist ID
    const isDuplicate = userPlaylists.some((playlist) => playlist.id === playlistId);

    if (isDuplicate) {
      onToastMessage("This playlist has already been added.", "error");
      return;
    }

    try {
      const response = await fetch("/api/addPlaylist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          playlistUrl: newPlaylistId,
          userOmid, // Use the user's OMID
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        onToastMessage(data.message || "Failed to add playlist. Please check the playlist ID.", "error");
        return;
      }

      onToastMessage(data.message || "Playlist added successfully!", "success");
      onPlaylistAdded(data.playlist); // Notify parent component about the new playlist
      setNewPlaylistId(""); // Clear the input field
      onClose(); // Close the dialog
    } catch (error) {
      console.error("Error adding playlist:", error);
      onToastMessage("An error occurred while adding the playlist. Please try again.", "error");
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
          placeholder="Enter Spotify playlist ID"
          value={newPlaylistId}
          onChange={(e) => setNewPlaylistId(e.target.value)}
          className="w-full mb-4"
        />
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleAddPlaylist}>Add Playlist</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddPlaylistDialog;