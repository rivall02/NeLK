import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

const nextAuth = NextAuth(authConfig);

export const proxy = nextAuth.auth;
export default nextAuth.auth;

export const config = {
  // Exclude static assets, Next.js internals, and image routes
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
