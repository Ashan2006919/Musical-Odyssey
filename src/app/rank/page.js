"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function RankLanding() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-500 to-indigo-600 text-white">
      <motion.h1
        className="text-4xl font-bold mb-8"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        Rank Your Favorites
      </motion.h1>
      <div className="flex gap-6">
        <Button
          onClick={() => router.push("/rank/albums")}
          className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-3 rounded-lg shadow-md"
        >
          Rank Albums
        </Button>
        <Button
          onClick={() => router.push("/rank/tracks")}
          className="bg-green-400 hover:bg-green-500 text-black px-6 py-3 rounded-lg shadow-md"
        >
          Rank Tracks
        </Button>
      </div>
    </div>
  );
}