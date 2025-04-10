export const playlistIds = [
  "20Rh8cqhAsvpL5rGZ19qqZ",
  "7GTwvfS41Q0EAUbOZmKFcH",
  "0Qd4PXjVn6VyqxUW5Ws9Ok",
  "2qUmxZfsE6mYcmtMN8MZ79",
  "6oPpajvXtHxogBdX6kE5rT",
];

export const fetchPlaylistsData = async (accessToken) => {
  try {
    const fetchedPlaylists = await Promise.all(
      playlistIds.map(async (id) => {
        const response = await fetch(
          `https://api.spotify.com/v1/playlists/${id}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        const data = await response.json();
        return {
          id: data.id,
          name: data.name,
          description: data.description || "No description available.",
          imageUrl: data.images[0]?.url || "/images/default-playlist.png",
          href: data.external_urls.spotify,
        };
      })
    );

    return fetchedPlaylists;
  } catch (error) {
    console.error("Error fetching playlists:", error);
    throw error;
  }
};