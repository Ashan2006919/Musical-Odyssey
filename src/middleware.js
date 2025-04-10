import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // Debugging: Log the token
  console.log("Middleware token:", token);

  if (!token) {
    // Redirect to login with an error message if no token is found
    return NextResponse.redirect(new URL(`/login?error=Unauthorized`, req.url));
  }

  // Optional: Check token expiry (if needed)
  const currentTime = Math.floor(Date.now() / 1000);
  if (token.exp && token.exp < currentTime) {
    console.log("Token expired:", token);
    return NextResponse.redirect(new URL(`/login?error=SessionExpired`, req.url));
  }

  return NextResponse.next();
}

// Protect specific routes
export const config = {
  matcher: [
    "/home/:path*",       // Protect the home page and its subpaths
    "/ratings/:path*",    // Protect the ratings page and its subpaths
    "/rate/:path*",       // Protect the rate page and its subpaths
  ],
};
