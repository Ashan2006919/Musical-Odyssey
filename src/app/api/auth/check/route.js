// src/app/api/auth/check/route.js

export async function GET(req) {
  const isAuthenticated = true; // Replace this with your actual authentication logic

  if (isAuthenticated) {
    return new Response(JSON.stringify({ message: 'Authenticated' }), { status: 200 });
  } else {
    return new Response(JSON.stringify({ message: 'Not Authenticated' }), { status: 401 });
  }
}
