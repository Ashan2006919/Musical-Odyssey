import { cn } from "@/lib/utils";
import {
  IconPlaylist,
  IconStar,
  IconChartBar,
  IconApi,
  IconMusic,
  IconMicrophone,
  IconUserCircle,
  IconSparkles,
} from "@tabler/icons-react";

export default function FeaturesSectionHome() {
  const features = [
    {
      title: "Track Every Album You Spin",
      description:
        "Easily log every album you listen to and never lose track of your musical adventures again.",
      icon: <IconMusic />, // more fitting than a route icon
    },
    {
      title: "Rate Songs & Albums Your Way",
      description:
        "Give each track and album your own personal rating. No critics — just your taste.",
      icon: <IconStar />, // rating/star symbol works well
    },
    {
      title: "Discover Your Listening Stats",
      description:
        "Get average album ratings, favorite artists, and stats that reveal your unique music journey.",
      icon: <IconChartBar />, // conveys stats and analytics
    },
    {
      title: "Spotify & Genius Integrated",
      description:
        "Pull album data, tracklists, and lyrics instantly through seamless Spotify and Genius API connections.",
      icon: <IconApi />, // perfect for API integrations
    },
    {
      title: "Build & Share Playlists",
      description:
        "Create playlists and let other users browse, listen, and vibe with your curated selections.",
      icon: <IconPlaylist />, // direct playlist icon
    },
    {
      title: "Artist & Album Rankings",
      description:
        "Rank your favorite artists and albums. See how your picks stack up in your personal library.",
      icon: <IconMicrophone />, // symbolizes artists, vocals, albums
    },
    {
      title: "Your Music Odyssey Profile",
      description:
        "Craft a personalized profile showcasing your listening habits, playlists, and top-rated albums.",
      icon: <IconUserCircle />, // classic profile icon
    },
    {
      title: "Built by a Music Nerd, for Music Nerds",
      description:
        "Born out of frustration with generic music trackers. This one’s made for people who actually care.",
      icon: <IconSparkles />, // playful, unique, 'special touch' feel
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4  relative z-10 py-10 max-w-7xl mx-auto">
      {features.map((feature, index) => (
        <Feature key={feature.title} {...feature} index={index} />
      ))}
    </div>
  );
}

const Feature = ({ title, description, icon, index }) => {
  return (
    <div
      className={cn(
        "flex flex-col lg:border-r  py-10 relative group/feature dark:border-neutral-800",
        (index === 0 || index === 4) && "lg:border-l dark:border-neutral-800",
        index < 4 && "lg:border-b dark:border-neutral-800"
      )}
    >
      {index < 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t from-neutral-100 dark:from-neutral-800 to-transparent pointer-events-none" />
      )}
      {index >= 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-b from-neutral-100 dark:from-neutral-800 to-transparent pointer-events-none" />
      )}
      <div className="mb-4 relative z-10 px-10 text-neutral-600 dark:text-neutral-400">
        {icon}
      </div>
      <div className="text-lg font-bold mb-2 relative z-10 px-10">
        <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-neutral-300 dark:bg-neutral-700 group-hover/feature:bg-blue-500 transition-all duration-200 origin-center" />
        <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block text-neutral-800 dark:text-neutral-100">
          {title}
        </span>
      </div>
      <p className="text-sm text-neutral-600 dark:text-neutral-300 max-w-xs relative z-10 px-10">
        {description}
      </p>
    </div>
  );
};
