import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll() {},
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { code_snippet, repo_description, tech_stack, client_id } = await request.json();

    // ─────────────────────────────────────────────────
    // MOCK MODE — replace this block with real Claude API
    // once Anthropic credits are added
    // ─────────────────────────────────────────────────
    await new Promise(r => setTimeout(r, 2000));

    const securityReport = {
      overall_score: 82,
      risk_level: "low",
      vulnerabilities: [],
      warnings: [
        {
          severity: "medium",
          issue: "Ensure all API routes validate user session before processing",
          fix: "Add supabase.auth.getUser() check at top of every POST route"
        },
        {
          severity: "low",
          issue: "Rate limiting not detected on API routes",
          fix: "Add rate limiting middleware — use upstash/ratelimit for Next.js"
        }
      ],
      passed_checks: [
        "No hardcoded secrets found in code",
        "HTTPS enforced via Vercel",
        "Supabase RLS mentioned in setup",
        "Environment variables used for sensitive keys",
        "Auth check present in reviewed routes"
      ],
      recommendations: [
        "Add input validation on all form fields (zod or yup)",
        "Enable Supabase RLS on every table — double check agent_outputs table",
        "Add CORS headers to API routes",
        "Set up Vercel security headers in next.config.js"
      ],
      next_scan: "Schedule weekly — every Sunday night"
    };
    // ─────────────────────────────────────────────────

    const { data: savedSecurity, error } = await supabase
      .from("agent_outputs")
      .insert([{
        user_id: user.id,
        client_id,
        agent: "security",
        output: securityReport,
        status: "completed"
      }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, security: savedSecurity });
  } catch (err) {
    console.error("Security agent error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}