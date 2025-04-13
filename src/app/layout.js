"use client"; // Mark this file as a Client Component

import { Geist, Geist_Mono } from "next/font/google";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ProgressBar from "../components/ProgressBar"; // ✅ Import the new component
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/theme-provider";
import { AppSidebar } from "@/components/nav/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import ClickSpark from "@/blocks/Animations/ClickSpark/ClickSpark"; // ✅ Import ClickSpark
import { useEffect } from "react";

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
      <body className="bg-white dark:bg-zinc-950 text-black dark:text-white">
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <ClickSpark
              sparkColor="#000000"
              sparkSize={10}
              sparkRadius={15}
              sparkCount={8}
              duration={400}
            >
              <ProgressBar />
              {/* Header */}
              <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                  <Header title="Test Page" />
                  {/* Main Layout */}
                  <div className="main-layout">
                    {/* Sidebar and Content */}
                    <div className="content-layout">{children}</div>
                  </div>
                  {/* Footer */}
                  <Footer />
                </SidebarInset>
              </SidebarProvider>
            </ClickSpark>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
