import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";

const AddPlaylistDialog = ({ isOpen, onClose, onPlaylistAdded, userOmid }) => {
  const [newPlaylistId, setNewPlaylistId] = useState("");

  const handleAddPlaylist = async () => {
    if (!newPlaylistId) {
      toast.error("Please enter a valid Spotify playlist ID.");
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
        toast.error(data.message || "Failed to add playlist.");
        return;
      }

      toast.success("Playlist added successfully!");
      onPlaylistAdded(data.playlist); // Notify parent component about the new playlist
      setNewPlaylistId(""); // Clear the input field
      onClose(); // Close the dialog
    } catch (error) {
      console.error("Error adding playlist:", error);
      toast.error("An error occurred while adding the playlist.");
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