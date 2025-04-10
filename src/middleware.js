import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // Debugging: Log the token and request headers
  console.log("Middleware token:", token);
  console.log("Request headers:", req.headers);

  if (!token) {
    return NextResponse.redirect(new URL(`/login?error=Unauthorized`, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/home/:path*", "/ratings/:path*", "/rate/:path*"],
};
