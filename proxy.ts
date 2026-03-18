import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export const proxy = auth((request) => {
  if (!request.auth && request.nextUrl.pathname !== "/login") {
    const newUrl = new URL("/signin", request.nextUrl.origin);
    return NextResponse.redirect(newUrl);
  }
});

export const config = {
  matcher: ["/my-account", "/my-account/:path*"],
};
