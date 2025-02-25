import { Geist, Geist_Mono } from "next/font/google";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ProgressBar from "../components/ProgressBar"; // ✅ Import the new component
import { AuthProvider } from './api/auth/useAuth'; // Import AuthProvider
import "./globals.css";

export const metadata = {
  title: "Odyssey Music",
  description: "A platform for exploring and rating albums from Spotify",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#000000" />
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
      </head>
      <body className="bg-white">
        <AuthProvider> {/* Wrap the application with AuthProvider */}
          <ProgressBar /> {/* ✅ Use the client component here */}
          <Header />
          {children}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
