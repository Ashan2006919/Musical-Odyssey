import React from "react";

const platforms = [
  { name: "Spotify", logo: "/icons/spotify.png", url: "https://www.spotify.com" },
  { name: "Apple Music", logo: "/icons/apple-music.png", url: "https://www.apple.com/apple-music/" },
  { name: "Genius", logo: "/icons/genius.png", url: "https://genius.com" },
  { name: "YouTube Music", logo: "/icons/youtube-music.png", url: "https://music.youtube.com" },
  { name: "SoundCloud", logo: "/icons/soundcloud.png", url: "https://soundcloud.com" },
];

export default function SupportedPlatforms() {
  return (
    <div className="relative overflow-hidden w-full bg-gray-50 dark:bg-black py-6 mb-5">
      <div className="flex items-center animate-scroll whitespace-nowrap">
        {platforms.map((platform, index) => (
          <a
            key={index}
            href={platform.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center flex-shrink-0 mx-8 grayscale hover:grayscale-0 transition-all"
          >
            <img
              src={platform.logo}
              alt={platform.name}
              className="h-20 w-auto"
              title={platform.name}
            />
            <span className="ml-6 text-gray-700 text-2xl font-bold font-serif">
              {platform.name}
            </span>
          </a>
        ))}
      </div>
      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        .animate-scroll {
          display: flex;
          animation: scroll 15s linear infinite;
        }
      `}</style>
    </div>
  );
}