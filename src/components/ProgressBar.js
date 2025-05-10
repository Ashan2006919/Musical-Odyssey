"use client"; // ✅ Mark as client component

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation"; // ✅ Use usePathname instead
import NProgress from "nprogress";
import "nprogress/nprogress.css";

export default function ProgressBar() {
  const pathname = usePathname(); // ✅ Get current path
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!loading) {
      NProgress.start();
      setLoading(true);
    }

    const timer = setTimeout(() => {
      NProgress.done();
      setLoading(false);
    }, 500); // Give some delay for smooth transition

    return () => clearTimeout(timer);
  }, [pathname]); // ✅ Trigger effect on pathname change

  return null; // No UI, just logic
}
