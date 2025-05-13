import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import RatingLabel from "@/components/RatingLabel";

const RankingRatingInfoDialog = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="pb-1 text-orange-600 text-xl text-wrap">Rating Information: Artist Ranking</DialogTitle>
          <DialogDescription>
            <span className="font-medium text-wrap">How our rating system for Artist Ranking works:</span>
          </DialogDescription>
        </DialogHeader>
        <hr />
        <div className="grid gap-4 pb-4 pt-2">
          <div className="flex justify-between items-center">
            <RatingLabel rating={10} />
            <span className="font-semibold">8 - 10</span>
          </div>
          <div className="flex justify-between items-center">
            <RatingLabel rating={8} />
            <span className="font-semibold">6.5 - 8</span>
          </div>
          <div className="flex justify-between items-center">
            <RatingLabel rating={7} />
            <span className="font-semibold">4.5 - 6.5</span>
          </div>
          <div className="flex justify-between items-center">
            <RatingLabel rating={5} />
            <span className="font-semibold">2.5 - 4.5</span>
          </div>
          <div className="flex justify-between items-center">
            <RatingLabel rating={3} />
            <span className="font-semibold">1.5 - 2.5</span>
          </div>
          <div className="flex justify-between items-center">
            <RatingLabel rating={1} />
            <span className="font-semibold">0 - 1.5</span>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RankingRatingInfoDialog;
