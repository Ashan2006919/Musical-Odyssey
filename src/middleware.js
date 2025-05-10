import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt"; // Import next-auth's JWT helper

export async function middleware(req) {
  const url = req.nextUrl.clone();
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // Check if the user is logged in and is an admin
  if (url.pathname.startsWith("/admin")) {
    if (!token || !token.isAdmin) {
      // Redirect non-admin users to the home page
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  // Allow access to other routes
  return NextResponse.next();
}

// Protect specific routes
export const config = {
  matcher: [
    "/admin/:path*",      // Protect the admin dashboard and its subpaths
    "/home/:path*",       // Protect the home page and its subpaths
    "/ratings/:path*",    // Protect the ratings page and its subpaths
    "/rate/:path*",       // Protect the rate page and its subpaths
    "/profile/:path*",    // Protect the profile page and its subpaths
  ],
};
