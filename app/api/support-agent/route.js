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

    const { question, product_info, client_id } = await request.json();

    // ─────────────────────────────────────────────────
    // MOCK MODE — replace this block with real Claude API
    // once Anthropic credits are added
    // ─────────────────────────────────────────────────
    await new Promise(r => setTimeout(r, 1500));

    const response = {
      question,
      answer: `Thanks for reaching out! Based on what you've asked — "${question}" — here's what I can tell you:\n\nOur platform is designed specifically for founders who want to move fast without building a large team. Everything from strategy to marketing to sales runs on autopilot once you're set up.\n\nIf you need more specific help, our founder typically responds within a few hours. You can also check our FAQ at [link].`,
      confidence: "high",
      escalate_to_founder: false,
      suggested_faq_addition: question.length > 20 ? question : null
    };
    // ─────────────────────────────────────────────────

    const { data: savedResponse, error } = await supabase
      .from("agent_outputs")
      .insert([{
        user_id: user.id,
        client_id,
        agent: "support",
        output: response,
        status: "completed"
      }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, response: savedResponse });
  } catch (err) {
    console.error("Support agent error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}