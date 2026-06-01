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

    const { product_name, target_audience, leads, client_id } = await request.json();
    // V1: Client pastes their own lead list
    // leads = [{ name, company, role }]

    // ─────────────────────────────────────────────────
    // MOCK MODE — replace this block with real Claude API
    // once Anthropic credits are added
    // ─────────────────────────────────────────────────
    await new Promise(r => setTimeout(r, 2000));

    const outreachMessages = (leads || [
      { name: "Arjun Mehta", company: "FinEdge", role: "Founder" },
      { name: "Sneha Roy", company: "EduGrow", role: "CEO" }
    ]).map(lead => ({
      lead,
      linkedin_message: `Hi ${lead.name}, I saw what you're building at ${lead.company} — really interesting direction.\n\nI work with ${target_audience}s who are scaling fast but stretched thin on execution. We've built an AI system that handles marketing, sales, and support automatically.\n\nWould love to share how it might fit your stage. Open to a quick chat this week?`,
      email_subject: `${lead.company} + ${product_name} — quick idea`,
      email_body: `Hi ${lead.name},\n\nNoticed ${lead.company} is growing — congrats on what you're building.\n\nQuick question: how much time does your team spend on marketing, sales follow-ups, and customer support every week?\n\nMost founders we work with say 30-40 hours. We cut that to near zero using AI agents.\n\n${product_name} has 12 specialised agents that run your entire growth engine autonomously.\n\nWorth 15 mins this week to show you how?\n\nBest,\n[Your name]`,
      platform: "linkedin + email"
    }));
    // ─────────────────────────────────────────────────

    const { data: savedOutreach, error } = await supabase
      .from("agent_outputs")
      .insert([{
        user_id: user.id,
        client_id,
        agent: "outreach",
        output: { messages: outreachMessages, total_leads: outreachMessages.length },
        status: "pending_approval"
      }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, outreach: savedOutreach });
  } catch (err) {
    console.error("Outreach agent error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}