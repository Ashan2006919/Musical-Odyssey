import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import RatingLabel from "@/components/RatingLabel"; // Import the RatingLabel component

const LeaderboardDialog = ({
  isOpen,
  onClose,
  artists,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90%] sm:max-w-[600px] px-2 sm:px-8 flex flex-col mx-1 sm:mx-auto rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-orange-500">
            Artist Leaderboard
          </DialogTitle>
        </DialogHeader>
        <hr />
        <div className="grid gap-4 pb-4 overflow-y-auto flex-grow max-h-[400px] px-4">
          {artists.map((artist, index) => (
            <div
              key={artist.name}
              className="flex items-center justify-between py-2 rounded-lg shadow-sm"
            >
              {/* Rank with Medal */}
              <div className="flex items-center gap-4">
                {index === 0 ? (
                  <img
                    src="/images/gold-medal.png"
                    alt="Gold Medal"
                    className="h-8 w-8"
                  />
                ) : index === 1 ? (
                  <img
                    src="/images/silver-medal.png"
                    alt="Silver Medal"
                    className="h-8 w-8"
                  />
                ) : index === 2 ? (
                  <img
                    src="/images/bronze-medal.png"
                    alt="Bronze Medal"
                    className="h-8 w-8"
                  />
                ) : (
                  <span className="text-lg font-bold text-gray-600">
                    {index + 1}
                  </span>
                )}
              </div>

              {/* Artist Image and Details */}
              <div className="flex items-center gap-4 flex-1 ml-5">
                <img
                  src={artist.image || "/images/default-artist.png"}
                  alt={artist.name}
                  className="h-12 w-12 rounded-md flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <a
                    href={artist.spotifyProfile}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base font-semibold text-blue-600 hover:underline truncate"
                    title={artist.name} // Tooltip for full name
                  >
                    {artist.name}
                  </a>
                </div>
              </div>

              {/* Average Rating */}
              <div className="flex items-center gap-3">
                <p className="text-sm font-semibold">
                  {artist.averageRating.toFixed(1)}
                </p>
                <RatingLabel rating={artist.averageRating} />
              </div>
            </div>
          ))}
        </div>
        <DialogFooter className="flex flex-col gap-4">
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LeaderboardDialog;