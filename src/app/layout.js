"use client"; // Mark this file as a Client Component

import { Geist, Geist_Mono } from "next/font/google";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ProgressBar from "../components/ProgressBar"; // ✅ Import the new component
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/theme-provider";

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#000000" />
        <title>Odyssey Music</title>
        <meta
          name="description"
          content="A platform for exploring and rating albums from Spotify"
        />
      </head>
      <body className="bg-white dark:bg-gray-900">
        <SessionProvider>
          {/* Wrap the application with ThemeProvider */}
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {/* Wrap the application with SessionProvider */}
            <ProgressBar /> {/* ✅ Use the client component here */}
            <Header />
            {children}
            <Footer />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
