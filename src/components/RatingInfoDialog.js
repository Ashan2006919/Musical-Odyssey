import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const RatingInfoDialog = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="pb-1">Rating Information</DialogTitle>
          <DialogDescription>
            Here is how our rating system works:
          </DialogDescription>
        </DialogHeader>
        <hr />
        <div className="grid gap-4 pb-4 pt-2">
          <div className="flex justify-between items-center">
            <span className="font-semibold">Perfect</span>
            <span>9.5 - 10</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-semibold">Amazing</span>
            <span>7.5 - 9.5</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-semibold">Great</span>
            <span>6 - 7.5</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-semibold">Good</span>
            <span>4.5 - 6</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-semibold">Mid</span>
            <span>2 - 4.5</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-semibold">Bad</span>
            <span>0 - 2</span>
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