import { NextResponse } from 'next/server';

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

export async function GET() {
  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: 'Missing API credentials' }, { status: 500 });
  }

  try {
    const authParams = new URLSearchParams();
    authParams.append('grant_type', 'client_credentials');
    authParams.append('client_id', clientId);
    authParams.append('client_secret', clientSecret);

    const authResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: authParams,
    });

    if (!authResponse.ok) {
      throw new Error(`Spotify API responded with status: ${authResponse.status}`);
    }

    const data = await authResponse.json();
    return NextResponse.json({ access_token: data.access_token }, { status: 200 });
  } catch (error) {
    console.error('Error fetching access token:', error);
    return NextResponse.json({ error: 'Failed to fetch access token' }, { status: 500 });
  }
}
