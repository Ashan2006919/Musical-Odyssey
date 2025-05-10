import RankSearch from "./RankSearch"; // Import the client component

export default function Page({ params }) {
  // Ensure params.type is passed to the client component
  const type = params?.type;

  if (!type) {
    throw new Error("Type parameter is missing in the route.");
  }

  return <RankSearch type={type} />;
}