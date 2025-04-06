// app/otp-verification/page.tsx
"use client";

import dynamic from "next/dynamic";

// 👇 Dynamically import the actual component with SSR disabled
const OTPVerificationPage = dynamic(() => import("./OTPComponent"), {
  ssr: false,
});

export default OTPVerificationPage;
