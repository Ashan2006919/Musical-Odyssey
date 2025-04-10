import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    // Redirect to login page if no token is found
    return NextResponse.redirect(new URL("/login", req.url));
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
