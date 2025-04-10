import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  console.log("Middleware token:", token); // Debugging line

  // Check if token exists and is valid
  if (!token || token.exp < Date.now() / 1000) {
    console.log("No valid token found, redirecting to login.");
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  console.log("Token is valid, proceeding to next.");
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
