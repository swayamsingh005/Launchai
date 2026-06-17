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

    const strategy = {
      thirty_day_plan: {
        week1: "Build landing page, set up payments, finalize pricing",
        week2: "Launch on social media, start cold outreach to first 50 leads",
        week3: "Onboard first 5 customers, collect feedback, fix issues",
        week4: "Scale marketing, hit 10 paying customers, plan next month"
      },
      pricing_strategy: `Start at a price ${target_audience} won't hesitate on. Offer a discount for early adopters.`,
      target_audience_breakdown: target_audience,
      key_metrics_to_track: ["Signups", "Conversion rate", "Revenue", "Churn"],
      launch_goal: goal
    };
    // ─────────────────────────────────────────────────

    const { data: savedStrategy, error } = await supabase
      .from("agent_outputs")
      .insert([{
        user_id: user.id,
        client_id,
        agent: "strategy",
        output: strategy,
        status: "completed"
      }])
      .select()
      .single();

    if (error) throw error;

    await logUsage(supabase, user.id, client_id, "strategy");

    return NextResponse.json({ success: true, strategy: savedStrategy, runsRemaining: limitCheck.remaining - 1 });
  } catch (err) {
    console.error("Strategy agent error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}