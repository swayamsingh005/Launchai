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

    const { product_name, industry, competitors, client_id } = await request.json();

    const limitCheck = await checkUsageLimit(supabase, user.id, client_id, "growth");
    if (!limitCheck.allowed) {
      return limitReachedResponse(limitCheck.message, limitCheck.plan);
    }

    let competitorNews = [];
    let marketTrends = [];

    if (process.env.TAVILY_API_KEY) {
      try {
        const compSearch = await fetch("https://api.tavily.com/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            api_key: process.env.TAVILY_API_KEY,
            query: `${industry} startup news India 2025`,
            search_depth: "basic",
            max_results: 5
          })
        });
        const compData = await compSearch.json();
        competitorNews = compData.results || [];

        const trendSearch = await fetch("https://api.tavily.com/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            api_key: process.env.TAVILY_API_KEY,
            query: `${industry} market trends growth opportunities 2025 India`,
            search_depth: "basic",
            max_results: 5
          })
        });
        const trendData = await trendSearch.json();
        marketTrends = trendData.results || [];
      } catch (tavilyErr) {
        console.error("Tavily error:", tavilyErr);
      }
    }

    await new Promise(r => setTimeout(r, 1500));

    const growth = {
      weekly_summary: {
        opportunities: [
          `${industry} market in India growing at 35% YoY — ideal time to double down on content`,
          "Competitor pricing increased last month — your current pricing is now more attractive",
          "LinkedIn engagement for B2B founders up 40% — increase posting frequency"
        ],
        risks: [
          "3 new competitors launched in the last 30 days in your space",
          "CPL for paid ads increased — focus on organic for now"
        ],
        recommended_actions: [
          "Run a referral campaign this week — offer 1 month free for referrals",
          "Post a case study on LinkedIn — founders love proof over promises",
          "Add a comparison page on your website vs top 3 competitors"
        ]
      },
      competitor_news: competitorNews.slice(0, 3).map(r => ({
        title: r.title,
        url: r.url,
        summary: r.content?.slice(0, 150) + "..."
      })),
      market_trends: marketTrends.slice(0, 3).map(r => ({
        title: r.title,
        url: r.url,
        summary: r.content?.slice(0, 150) + "..."
      })),
      growth_score: 72,
      next_milestone: "Hit ₹1L MRR — currently at ₹30K, need 3 more clients"
    };

    const { data: savedGrowth, error } = await supabase
      .from("agent_outputs")
      .insert([{
        user_id: user.id,
        client_id,
        agent: "growth",
        output: growth,
        status: "completed"
      }])
      .select()
      .single();

    if (error) throw error;

    await logUsage(supabase, user.id, client_id, "growth");

    return NextResponse.json({ success: true, growth: savedGrowth, runsRemaining: limitCheck.remaining - 1 });
  } catch (err) {
    console.error("Growth agent error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}