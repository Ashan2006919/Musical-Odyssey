import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import RatingLabel from "@/components/RatingLabel";
import { Button } from "@/components/ui/button";

const Leaderboard = ({ isOpen, onClose, albums }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90%] sm:max-w-[600px] px-2 sm:px-8 flex flex-col mx-1 sm:mx-auto rounded-lg h-5/6">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-blue-500">
            Album Leaderboard
          </DialogTitle>
        </DialogHeader>
        <hr className="my-4" />
        {/* Scrollable container */}
        <div className="flex flex-col gap-4 overflow-y-auto max-h-[70vh]">
          {albums.map((album, index) => (
            <div
              key={album.albumId}
              className="flex items-center justify-between bg-gray-50 dark:bg-zinc-900 p-4 rounded-lg shadow-md mr-3"
            >
              <div className="flex items-center gap-4">
                <span className="text-lg font-bold text-blue-500">#{index + 1}</span>
                <img
                  src={album.albumCover}
                  alt={album.albumName}
                  className="h-16 w-16 rounded-md object-cover"
                />
                <div>
                  <h3 className="text-lg font-semibold">{album.albumName}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {album.albumArtist}
                  </p>
                </div>
              </div>
              <RatingLabel rating={album.averageRating} />
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-end">
          <Button
            onClick={onClose}
            className="px-4 py-2 text-white rounded-lg shadow-md"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Leaderboard;