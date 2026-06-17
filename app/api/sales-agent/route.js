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

    const { product_name, target_audience, leads, client_id, auto_send } = await request.json();

    const limitCheck = await checkUsageLimit(supabase, user.id, client_id, "sales");
    if (!limitCheck.allowed) {
      return limitReachedResponse(limitCheck.message, limitCheck.plan);
    }

    await new Promise(r => setTimeout(r, 2000));

    const emails = (leads || [
      { name: "Rahul Sharma", email: "rahul@example.com", company: "TechStartup" },
      { name: "Priya Patel", email: "priya@example.com", company: "GrowthCo" }
    ]).map(lead => ({
      to: lead.email,
      name: lead.name,
      company: lead.company,
      subject: `Quick question about ${lead.company}'s growth`,
      body: `Hi ${lead.name},\n\nI noticed ${lead.company} is working on some exciting things.\n\nMost ${target_audience}s I talk to are spending 40+ hours/week on marketing, sales, and support — tasks that could be fully automated.\n\n${product_name} has 12 AI agents that handle all of this for you. One founder went from 0 to ₹3L MRR in 60 days using it.\n\nWould a 15-min call this week make sense?\n\nBest,\n[Founder Name]`,
      follow_up_day: 3
    }));

    const sendResults = [];
    if (auto_send && process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      for (const email of emails) {
        try {
          const result = await resend.emails.send({
            from: "LaunchAI <hello@launchai.in>",
            to: email.to,
            subject: email.subject,
            text: email.body,
          });
          sendResults.push({ email: email.to, status: "sent", id: result.id });
        } catch (sendErr) {
          sendResults.push({ email: email.to, status: "failed", error: sendErr.message });
        }
      }
    }

    const { data: savedEmails, error } = await supabase
      .from("agent_outputs")
      .insert([{
        user_id: user.id,
        client_id,
        agent: "sales",
        output: { emails, send_results: sendResults },
        status: auto_send ? "sent" : "pending_approval"
      }])
      .select()
      .single();

    if (error) throw error;

    await logUsage(supabase, user.id, client_id, "sales");

    return NextResponse.json({ success: true, emails: savedEmails, send_results: sendResults, runsRemaining: limitCheck.remaining - 1 });
  } catch (err) {
    console.error("Sales agent error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}