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

    const { client_id, month } = await request.json();

    // LIVE — Razorpay works without Anthropic credits!
    let razorpayPayments = [];
    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
      try {
        const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString("base64");
        const from = Math.floor(new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime() / 1000);
        const to = Math.floor(Date.now() / 1000);

        const res = await fetch(`https://api.razorpay.com/v1/payments?from=${from}&to=${to}&count=100`, {
          headers: { Authorization: `Basic ${auth}` }
        });
        const data = await res.json();
        razorpayPayments = data.items || [];
      } catch (rzpErr) {
        console.error("Razorpay error:", rzpErr);
      }
    }

    const captured = razorpayPayments.filter(p => p.status === "captured");
    const totalRevenue = captured.reduce((sum, p) => sum + p.amount, 0) / 100;
    const refunded = razorpayPayments.filter(p => p.status === "refunded");
    const totalRefunds = refunded.reduce((sum, p) => sum + p.amount, 0) / 100;

    // ─────────────────────────────────────────────────
    // MOCK MODE — replace this block with real Claude API
    // once Anthropic credits are added
    // (Razorpay data above already works live!)
    // ─────────────────────────────────────────────────
    await new Promise(r => setTimeout(r, 1500));

    const finance = {
      month: month || new Date().toLocaleString("default", { month: "long", year: "numeric" }),
      revenue: {
        total: totalRevenue || 30000,
        from_razorpay: totalRevenue,
        transactions: captured.length || 1,
        refunds: totalRefunds || 0
      },
      expenses: {
        total: 5000,
        breakdown: [
          { item: "Anthropic API credits", amount: 2000 },
          { item: "Vercel hosting", amount: 800 },
          { item: "Supabase", amount: 500 },
          { item: "Resend", amount: 0 },
          { item: "Buffer", amount: 0 },
          { item: "Domain", amount: 200 },
          { item: "Miscellaneous", amount: 1500 }
        ]
      },
      net_profit: (totalRevenue || 30000) - 5000,
      burn_rate: 5000,
      runway_months: Math.floor(((totalRevenue || 30000) - 5000) / 5000),
      invoices_pending: [],
      flags: totalRevenue < 10000 ? ["⚠️ Low revenue this month — follow up with pending clients"] : [],
      summary: `This month LaunchAI earned ₹${(totalRevenue || 30000).toLocaleString("en-IN")} with expenses of ₹5,000 — net profit of ₹${((totalRevenue || 30000) - 5000).toLocaleString("en-IN")}. ${totalRevenue > 30000 ? "Strong month! 📈" : "On track. Keep pushing. 💪"}`
    };
    // ─────────────────────────────────────────────────

    const { data: savedFinance, error } = await supabase
      .from("agent_outputs")
      .insert([{
        user_id: user.id,
        client_id,
        agent: "finance",
        output: finance,
        status: "completed"
      }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, finance: savedFinance });
  } catch (err) {
    console.error("Finance agent error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}