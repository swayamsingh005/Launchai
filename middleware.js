import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

const ADMIN_EMAIL = "swayamsingh855@gmail.com";

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  const response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // ─── NOT LOGGED IN ───────────────────────────────
  if (!user) {
    if (
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/onboarding") ||
      pathname.startsWith("/brief") ||
      pathname.startsWith("/client-dashboard") ||
      pathname.startsWith("/payment")
    ) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return response;
  }

  const isAdmin = user.email === ADMIN_EMAIL;

  // ─── LOGGED IN → SKIP LOGIN PAGE ─────────────────
  if (pathname === "/login") {
    if (isAdmin) return NextResponse.redirect(new URL("/dashboard", request.url));
    // client → check where they are in the flow
    const { data: client } = await supabase
      .from("clients")
      .select("id, status")
      .eq("user_id", user.id)
      .single();
    if (!client) return NextResponse.redirect(new URL("/onboarding", request.url));
    if (client.status === "active") return NextResponse.redirect(new URL("/client-dashboard", request.url));
    return NextResponse.redirect(new URL("/brief", request.url));
  }

  // ─── ADMIN ROUTES ─────────────────────────────────
  if (pathname.startsWith("/dashboard")) {
    if (!isAdmin) {
      // non-admin trying to access founder dashboard → redirect them
      const { data: client } = await supabase
        .from("clients")
        .select("id, status")
        .eq("user_id", user.id)
        .single();
      if (!client) return NextResponse.redirect(new URL("/onboarding", request.url));
      if (client.status === "active") return NextResponse.redirect(new URL("/client-dashboard", request.url));
      return NextResponse.redirect(new URL("/brief", request.url));
    }
    return response;
  }

  // ─── CLIENT ROUTES ────────────────────────────────
  if (pathname.startsWith("/onboarding")) {
    if (isAdmin) return NextResponse.redirect(new URL("/dashboard", request.url));
    const { data: client } = await supabase
      .from("clients")
      .select("id, status")
      .eq("user_id", user.id)
      .single();
    if (client) return NextResponse.redirect(new URL("/brief", request.url));
    return response;
  }

  if (pathname.startsWith("/brief")) {
    if (isAdmin) return NextResponse.redirect(new URL("/dashboard", request.url));
    const { data: client } = await supabase
      .from("clients")
      .select("id, status")
      .eq("user_id", user.id)
      .single();
    if (!client) return NextResponse.redirect(new URL("/onboarding", request.url));
    return response;
  }

  if (pathname.startsWith("/client-dashboard")) {
    if (isAdmin) return NextResponse.redirect(new URL("/dashboard", request.url));
    const { data: client } = await supabase
      .from("clients")
      .select("id, status")
      .eq("user_id", user.id)
      .single();
    if (!client) return NextResponse.redirect(new URL("/onboarding", request.url));
    if (client.status !== "active") return NextResponse.redirect(new URL("/brief", request.url));
    return response;
  }

  if (pathname.startsWith("/payment")) {
    if (isAdmin) return NextResponse.redirect(new URL("/dashboard", request.url));
    const { data: client } = await supabase
      .from("clients")
      .select("id, status")
      .eq("user_id", user.id)
      .single();
    if (!client) return NextResponse.redirect(new URL("/onboarding", request.url));
    if (client.status === "active") return NextResponse.redirect(new URL("/client-dashboard", request.url));
    return response;
  }

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/onboarding/:path*",
    "/brief/:path*",
    "/client-dashboard/:path*",
    "/payment/:path*",
    "/login"
  ],
};