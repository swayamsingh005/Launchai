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

    const { product_name, target_audience, industry, tone, client_id, auto_post } = await request.json();

    // ─────────────────────────────────────────────────
    // MOCK MODE — replace this block with real Claude API
    // once Anthropic credits are added
    // ─────────────────────────────────────────────────
    await new Promise(r => setTimeout(r, 2000));

    const content = {
      instagram: {
        caption: `🚀 What if you could launch your startup in 48 hours?\n\nMost founders spend months on things that don't matter.\n\n${product_name} gives ${target_audience} everything they need:\n✅ AI strategy in seconds\n✅ Marketing that runs itself\n✅ Sales on autopilot\n\nThe future of building is here.\n\n#StartupIndia #AIStartup #Founders #${industry.replace(/\s/g, "")} #LaunchFast`,
        best_time: "7:00 PM IST",
        format: "Single image post — use product dashboard screenshot"
      },
      linkedin: {
        post: `I used to think building a startup required a full team.\n\nStrategy team. Marketing team. Sales team. Support team.\n\nThen I discovered ${product_name}.\n\n12 AI agents working 24/7 for your startup. Each one specialised. Each one relentless.\n\nIn 30 days, here's what happened:\n→ 200+ cold emails sent automatically\n→ Daily social content posted without lifting a finger\n→ Customer queries answered at 3am\n\nThis is not the future. This is available right now.\n\nIf you're a ${target_audience} trying to move fast — check the link in comments.\n\n#${industry.replace(/\s/g, "")} #AITools #StartupLife #Productivity`,
        best_time: "8:00 AM IST Tuesday or Wednesday",
        format: "Text post with 1 follow-up comment with link"
      },
      twitter: {
        thread: [
          `Most ${target_audience}s burn out because they're doing everything alone.\n\nHere's how ${product_name} fixes that with 12 AI agents 🧵`,
          `Agent 1: Strategy Agent\nGenerates your full 30-day launch plan in seconds.\nPricing. Audience. Roadmap. Done.`,
          `Agent 2: Marketing Agent\nWrites and posts daily content to Instagram, LinkedIn, Twitter.\nYou approve. It posts.`,
          `Agent 3: Sales Agent\nWrites 20 personalised cold emails every day.\nYou approve. Resend delivers them.`,
          `The result?\nA startup that runs while you sleep.\n\nTry ${product_name} today → [link]`
        ],
        best_time: "12:00 PM IST"
      }
    };
    // ─────────────────────────────────────────────────

    // AUTO POST via Buffer API if client approved
    if (auto_post && process.env.BUFFER_ACCESS_TOKEN) {
      try {
        const profilesRes = await fetch("https://api.bufferapp.com/1/profiles.json", {
          headers: { Authorization: `Bearer ${process.env.BUFFER_ACCESS_TOKEN}` }
        });
        const profiles = await profilesRes.json();

        if (profiles && profiles.length > 0) {
          await fetch("https://api.bufferapp.com/1/updates/create.json", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.BUFFER_ACCESS_TOKEN}`,
              "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
              "profile_ids[]": profiles[0].id,
              text: content.instagram.caption,
              scheduled_at: new Date(Date.now() + 60 * 60 * 1000).toISOString()
            })
          });
        }
      } catch (bufferErr) {
        console.error("Buffer post error:", bufferErr);
      }
    }

    const { data: savedContent, error } = await supabase
      .from("agent_outputs")
      .insert([{
        user_id: user.id,
        client_id,
        agent: "marketing",
        output: content,
        status: auto_post ? "posted" : "pending_approval"
      }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, content: savedContent });
  } catch (err) {
    console.error("Marketing agent error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}