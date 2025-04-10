import { NextResponse } from "next/server";

export async function middleware(req) {
  // Temporarily bypass token validation
  return NextResponse.next();
}

// Protect specific routes (this will still match routes but won't enforce validation)
export const config = {
  matcher: [
    "/home/:path*",       // Protect the home page and its subpaths
    "/ratings/:path*",    // Protect the ratings page and its subpaths
    "/rate/:path*",       // Protect the rate page and its subpaths
  ],
};
