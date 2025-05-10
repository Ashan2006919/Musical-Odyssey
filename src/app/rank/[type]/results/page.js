"use client";

import React, { useState, useEffect } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import SortableItem from "@/components/SortableItem";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import axios from "axios";
import { useSearchParams } from "next/navigation";

export default function RankResults({ params }) {
  const { type } = params; // "albums" or "tracks"
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [items, setItems] = useState([]);

  useEffect(() => {
    // Parse the items from the query parameters
    const itemsParam = searchParams.get("items");
    if (itemsParam) {
      setItems(JSON.parse(itemsParam));
    }
  }, [searchParams]);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setItems((prev) => {
        const oldIndex = prev.findIndex((item) => item.id === active.id);
        const newIndex = prev.findIndex((item) => item.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };

  const handleSave = async () => {
    if (!session?.user?.omid) {
      toast.error("You must be logged in to save your rankings.");
      return;
    }

    try {
      await axios.post("/api/rankings/save", {
        omid: session.user.omid,
        type,
        list: items,
        timestamp: new Date(),
      });
      toast.success("Ranking saved successfully!");
    } catch (error) {
      console.error("Error saving ranking:", error);
      toast.error("Failed to save ranking.");
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Rank {type === "albums" ? "Albums" : "Tracks"}</h1>
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <div className="w-3/4 max-w-md space-y-4">
            {items.map((item) => (
              <SortableItem key={item.id} id={item.id}>
                <div className="flex items-center gap-4">
                  <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-md" />
                  <div>
                    <h3 className="text-lg font-bold">{item.name}</h3>
                    <p className="text-sm text-gray-500">{item.artist}</p>
                  </div>
                </div>
              </SortableItem>
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <Button onClick={handleSave} className="mt-6 bg-green-500 hover:bg-green-600 text-white">
        Save Ranking
      </Button>
    </div>
  );
}