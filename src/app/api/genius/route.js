import { NextResponse } from 'next/server';

const accessToken = process.env.GENIUS_ACCESS_TOKEN; // Retrieve from .env

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const albumName = searchParams.get('album');
  const artistName = searchParams.get('artist');

  if (!accessToken) {
    return NextResponse.json({ error: 'Missing Genius API access token' }, { status: 500 });
  }

  try {
    // Search for the album on Genius
    const searchResponse = await fetch(
      `https://api.genius.com/search?q=${encodeURIComponent(albumName + ' ' + artistName)}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!searchResponse.ok) {
      throw new Error(`Genius API responded with status: ${searchResponse.status}`);
    }

    const searchData = await searchResponse.json();
    const album = searchData.response.hits.find(
      (hit) => hit.result.primary_artist.name.toLowerCase() === artistName.toLowerCase()
    );

    if (!album) {
      return NextResponse.json({ error: 'Album not found on Genius' }, { status: 404 });
    }

    // Fetch album details from Genius
    const albumId = album.result.id;
    const albumResponse = await fetch(`https://api.genius.com/songs/${albumId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!albumResponse.ok) {
      throw new Error(`Genius album API error: ${albumResponse.status}`);
    }

    const albumData = await albumResponse.json();
    const metadata = {
      producers: albumData.response.song.producer_artists?.map((p) => p.name) || ['Not Available'],
      writers: albumData.response.song.writer_artists?.map((w) => w.name) || ['Not Available'],
    };

    return NextResponse.json(metadata, { status: 200 });
  } catch (error) {
    console.error('Error fetching Genius data:', error);
    return NextResponse.json({ error: 'Failed to fetch album metadata from Genius' }, { status: 500 });
  }
}
