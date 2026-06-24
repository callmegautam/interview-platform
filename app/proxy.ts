import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/auth/session";
import { cookies } from "next/headers";

const protectedPrefixes = ["/interviews", "/questions", "/settings"];
const publicRoutes = ["/login", "/signup", "/"];

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  const isProtectedRoute = protectedPrefixes.some((prefix) => path.startsWith(prefix));
  const isPublicRoute = publicRoutes.some((route) => path === route);
  const isInterviewRoute = path.startsWith("/interview");

  if (isInterviewRoute) {
    return NextResponse.next();
  }

  const cookie = (await cookies()).get("session")?.value;
  const session = await decrypt(cookie);

  if (isProtectedRoute && !session?.userId) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  if (
    isPublicRoute &&
    session?.userId &&
    path !== "/interviews"
  ) {
    return NextResponse.redirect(new URL("/interviews", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
