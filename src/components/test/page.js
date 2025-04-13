"use client";

import React from "react";
import ClickSpark from "@/blocks/Animations/ClickSpark/ClickSpark"; // Corrected for default export

const Test = () => {
  return (
    <div>
      <ClickSpark
        sparkColor="#fff"
        sparkSize={10}
        sparkRadius={15}
        sparkCount={8}
        duration={400}
      >
        <h1>Test Component</h1>
      </ClickSpark>
    </div>
  );
};

export default Test;
