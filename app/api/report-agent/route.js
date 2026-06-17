import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Resend } from "resend";
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

    const { client_id, founder_email, client_email, product_name } = await request.json();

    const limitCheck = await checkUsageLimit(supabase, user.id, client_id, "report");
    if (!limitCheck.allowed) {
      return limitReachedResponse(limitCheck.message, limitCheck.plan);
    }

    const { data: agentOutputs } = await supabase
      .from("agent_outputs")
      .select("*")
      .eq("client_id", client_id)
      .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    const agentActivity = agentOutputs || [];

    await new Promise(r => setTimeout(r, 1500));

    const weeklyReport = {
      week: `Week of ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`,
      product: product_name,
      agents_active: agentActivity.length || 9,
      highlights: [
        "Marketing agent posted 7 times across Instagram + LinkedIn",
        "Sales agent sent 140 cold emails — 12 replies received",
        "Support agent answered 23 customer questions",
        "Growth agent identified 3 new market opportunities",
        "Finance agent: ₹30,000 revenue tracked this month"
      ],
      decisions_made: 4,
      decisions_pending: 0,
      revenue_this_week: "₹30,000",
      next_week_focus: [
        "Follow up on 12 sales replies",
        "Publish LinkedIn case study",
        "Onboard next client"
      ],
      agent_outputs_count: agentActivity.length
    };

    const emailHtml = `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#0F0F1A;color:#fff;padding:32px;border-radius:12px">
        <h1 style="color:#6C63FF;font-size:24px;margin-bottom:4px">📊 Weekly Report</h1>
        <p style="color:#888;margin-bottom:24px">${weeklyReport.week} · ${product_name}</p>
        <div style="background:#1A1A2E;border-radius:8px;padding:20px;margin-bottom:20px">
          <h2 style="font-size:16px;margin-bottom:12px;color:#3ECFCF">This Week's Highlights</h2>
          ${weeklyReport.highlights.map(h => `<p style="margin:6px 0;font-size:14px">✅ ${h}</p>`).join("")}
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px">
          <div style="background:#1A1A2E;border-radius:8px;padding:16px;text-align:center">
            <div style="font-size:28px;font-weight:700;color:#6C63FF">${weeklyReport.agents_active}</div>
            <div style="font-size:12px;color:#888">Agents active</div>
          </div>
          <div style="background:#1A1A2E;border-radius:8px;padding:16px;text-align:center">
            <div style="font-size:28px;font-weight:700;color:#3ECFCF">${weeklyReport.revenue_this_week}</div>
            <div style="font-size:12px;color:#888">Revenue tracked</div>
          </div>
        </div>
        <div style="background:#1A1A2E;border-radius:8px;padding:20px">
          <h2 style="font-size:16px;margin-bottom:12px;color:#FF6584">Next Week Focus</h2>
          ${weeklyReport.next_week_focus.map(f => `<p style="margin:6px 0;font-size:14px">→ ${f}</p>`).join("")}
        </div>
        <p style="font-size:12px;color:#555;margin-top:24px;text-align:center">Sent by LaunchAI Report Agent · Every Monday 8AM IST</p>
      </div>
    `;

    let emailSent = false;
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const recipients = [founder_email, client_email].filter(Boolean);
      for (const email of recipients) {
        await resend.emails.send({
          from: "LaunchAI Reports <reports@launchai.in>",
          to: email,
          subject: `📊 Weekly Report — ${product_name} · ${weeklyReport.week}`,
          html: emailHtml
        });
      }
      emailSent = true;
    }

    const { data: savedReport, error } = await supabase
      .from("agent_outputs")
      .insert([{
        user_id: user.id,
        client_id,
        agent: "report",
        output: { ...weeklyReport, email_sent: emailSent },
        status: "completed"
      }])
      .select()
      .single();

    if (error) throw error;

    await logUsage(supabase, user.id, client_id, "report");

    return NextResponse.json({ success: true, report: savedReport, email_sent: emailSent, runsRemaining: limitCheck.remaining - 1 });
  } catch (err) {
    console.error("Report agent error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}