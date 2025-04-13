import React from "react";
import { motion } from "framer-motion";

const bubbleVariants = {
  initial: {
    opacity: 0,
    scale: 0,
  },
  animate: {
    opacity: [0.8, 0.4, 0],
    scale: [0.5, 1.5, 2],
    y: ["100%", "-100%"],
    x: ["0%", "50%", "-50%"],
    transition: {
      duration: 5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

const Bubbles = () => {
  const colors = ["#FF5733", "#33C1FF", "#FFC300", "#DAF7A6", "#C70039"];

  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
    >
      {/* Existing Small Bubbles */}
      {Array.from({ length: 10 }).map((_, index) => (
        <motion.div
          key={index}
          className="absolute w-16 h-16 rounded-full"
          style={{
            backgroundColor: colors[index % colors.length],
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
          }}
          variants={bubbleVariants}
          initial="initial"
          animate="animate"
        />
      ))}
    </div>
  );
};

export default Bubbles;