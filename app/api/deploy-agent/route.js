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

    const { code_snippet, description, tech_stack, client_id } = await request.json();

    // ─────────────────────────────────────────────────
    // MOCK MODE — replace this block with real Claude API
    // once Anthropic credits are added
    // ─────────────────────────────────────────────────
    await new Promise(r => setTimeout(r, 2000));

    const deployReview = {
      ready_to_deploy: true,
      pre_deploy_checklist: [
        { item: "Environment variables set in Vercel", status: "check_manually" },
        { item: "No hardcoded API keys in code", status: "passed" },
        { item: "Error handling in API routes", status: "passed" },
        { item: "Mobile responsive check", status: "check_manually" },
        { item: "Supabase RLS policies enabled", status: "check_manually" },
        { item: "Loading states on all async actions", status: "passed" }
      ],
      code_issues: [],
      warnings: [
        "Make sure NEXT_PUBLIC_ env vars are added in Vercel dashboard",
        "Test the auth flow on a private/incognito window before going live"
      ],
      deploy_command: "Push to main branch — Vercel auto-deploys",
      estimated_deploy_time: "2-3 minutes",
      rollback_plan: "Go to Vercel dashboard → Deployments → click previous deployment → Redeploy"
    };
    // ─────────────────────────────────────────────────

    const { data: savedDeploy, error } = await supabase
      .from("agent_outputs")
      .insert([{
        user_id: user.id,
        client_id,
        agent: "deploy",
        output: deployReview,
        status: "completed"
      }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, deploy: savedDeploy });
  } catch (err) {
    console.error("Deploy agent error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}