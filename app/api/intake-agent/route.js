import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { checkUsageLimit, logUsage, limitReachedResponse } from "../../../lib/usage-limits";

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

    const { idea, target_audience, goal, client_id } = await request.json();

    const limitCheck = await checkUsageLimit(supabase, user.id, client_id, "strategy");
    if (!limitCheck.allowed) {
      return limitReachedResponse(limitCheck.message, limitCheck.plan);
    }

    // ─────────────────────────────────────────────────
    // MOCK MODE — replace this block with real Claude API
    // once Anthropic credits are added
    // ─────────────────────────────────────────────────
    await new Promise(r => setTimeout(r, 2000));

    const brief = {
      product_name: "IdeaLaunch",
      what_it_does: "An AI-powered platform that turns raw business ideas into fully operational companies in 48 hours.",
      features: [
        "One-click business idea submission",
        "AI-generated product brief in 10 seconds",
        "12 specialized AI agents working 24/7",
        "Real-time decisions queue for founder approval",
        "Automated marketing, sales and support"
      ],
      target_customer: target_audience,
      tech_stack: "Next.js, Supabase, Claude AI, Razorpay",
      unique_advantage: "First platform that builds AND runs your entire company using AI — no hiring, no salaries, no office needed.",
      launch_goal: goal
    };
    // ─────────────────────────────────────────────────

    const { data: savedBrief, error } = await supabase
      .from("briefs")
      .insert([{
        user_id: user.id,
        client_id,
        ...brief,
        status: "pending"
      }])
      .select()
      .single();

    if (error) throw error;

    await logUsage(supabase, user.id, client_id, "strategy");

    return NextResponse.json({ success: true, brief: savedBrief, runsRemaining: limitCheck.remaining - 1 });
  } catch (err) {
    console.error("Intake agent error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}