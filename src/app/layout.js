"use client"; // Mark this file as a Client Component

import { Geist, Geist_Mono } from "next/font/google";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ProgressBar from "../components/ProgressBar"; // ✅ Import the new component
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/theme-provider";
import ClickSpark from "@/blocks/Animations/ClickSpark/ClickSpark"; // ✅ Import ClickSpark

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#000000" />
        <title>Musical Odyssey</title>
        <meta
          name="description"
          content="A platform for exploring and rating albums from Spotify"
        />
      </head>
      <body className="bg-white dark:bg-zinc-950 text-black dark:text-white">

        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <ProgressBar />
            {/* Header */}
                {/* Main Layout */}
                <ClickSpark
                  sparkColor="#000000"
                  sparkSize={10}
                  sparkRadius={15}
                  sparkCount={8}
                  duration={400}
                >
                  <Header title="Musical Odyssey" />
                  <div className="main-layout">
                    {/* Sidebar and Content */}
                    <div className="content-layout">{children}</div>
                  </div>
                </ClickSpark>
                {/* Footer */}
                <Footer />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
