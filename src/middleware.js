import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // Debugging: Log the token and request headers
  console.log("Middleware token:", token);
  console.log("Request headers:", req.headers);

  if (!token) {
    console.error("Token not found. Redirecting to login.");
    return NextResponse.redirect(new URL(`/login?error=Unauthorized`, req.url));
  }

  const currentTime = Math.floor(Date.now() / 1000);
  if (token.exp && token.exp < currentTime) {
    console.error("Token expired:", token);
    return NextResponse.redirect(new URL(`/login?error=SessionExpired`, req.url));
  }

  // Prevent caching of protected routes
  const res = NextResponse.next();
  res.headers.set("Cache-Control", "no-store");
  return res;
}

export const config = {
  matcher: ["/home/:path*", "/ratings/:path*", "/rate/:path*"],
};
