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

const RatingInfoDialog = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="pb-1 text-orange-600 text-xl">Rating Information: Album Rating</DialogTitle>
          <DialogDescription>
            <span className="font-medium">How our rating system works for album rankings:</span>
          </DialogDescription>
        </DialogHeader>
        <hr />
        <div className="grid gap-4 pb-4 pt-2">
          <div className="flex justify-between items-center">
            <RatingLabel rating={10} />
            <span className="font-semibold">9.6 - 10</span>
          </div>
          <div className="flex justify-between items-center">
            <RatingLabel rating={9.2} />
            <span className="font-semibold">9 - 9.6</span>
          </div>
          <div className="flex justify-between items-center">
            <RatingLabel rating={8} />
            <span className="font-semibold">7.5 - 9</span>
          </div>
          <div className="flex justify-between items-center">
            <RatingLabel rating={6.5} />
            <span className="font-semibold">6.5 - 7.5</span>
          </div>
          <div className="flex justify-between items-center">
            <RatingLabel rating={5} />
            <span className="font-semibold">5 - 6.5</span>
          </div>
          <div className="flex justify-between items-center">
            <RatingLabel rating={3} />
            <span className="font-semibold">3 - 5</span>
          </div>
          <div className="flex justify-between items-center">
            <RatingLabel rating={1} />
            <span className="font-semibold">0 - 3</span>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RatingInfoDialog;
