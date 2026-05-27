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

    const { client_id, feedback } = await request.json();

    // Get client brief
    const { data: brief } = await supabase
      .from("briefs")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    const { data: client } = await supabase
      .from("clients")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!brief || !client) {
      return NextResponse.json({ error: "Brief or client not found" }, { status: 404 });
    }

    // ─────────────────────────────────────────────────
    // MOCK MODE — replace with real Claude API once credits added
    // ─────────────────────────────────────────────────
    await new Promise(r => setTimeout(r, 2500));

    const strategy = {
      launch_plan: `Start by building a minimal version of ${brief.product_name} with just the core feature: ${(brief.features || [])[0] || "the main feature"}. Launch to 10 beta users in week 1, gather feedback, iterate in week 2, then do a public launch in week 3 with a waitlist campaign.`,
      pricing_strategy: `Start with a freemium model — free tier with basic features, paid tier at ₹499/month. This lowers the barrier to entry and helps you get your first 50 users fast. Once you have traction, raise pricing to ₹999/month.`,
      marketing_channels: [
        "Instagram Reels — post 1 short demo video daily showing the product in action",
        "LinkedIn — target professionals in your audience with case studies",
        "WhatsApp Groups — find communities where your target customers hang out",
        "Cold Email — personalised outreach to 20 potential customers per day",
        "Product Hunt — launch on Day 30 for maximum visibility"
      ],
      weekly_roadmap: [
        { week: "Week 1", tasks: ["Build core MVP feature", "Set up landing page", "Onboard 5 beta testers", "Daily Instagram posts"] },
        { week: "Week 2", tasks: ["Fix bugs from beta feedback", "Add payment integration", "Start cold email campaign", "Publish 2 LinkedIn posts"] },
        { week: "Week 3", tasks: ["Public launch", "Run first paid ad campaign", "Reach out to 50 leads", "Collect 10 reviews"] },
        { week: "Week 4", tasks: ["Analyse metrics", "Iterate on feedback", "Scale what's working", "Prepare Product Hunt launch"] }
      ],
      decisions: [
        { title: "Approve pricing strategy", description: `Start with ₹499/month freemium model as suggested by Strategy Agent. Approve to proceed?` },
        { title: "Confirm marketing channel", description: "Strategy Agent recommends Instagram Reels as primary channel. Approve to activate Marketing Agent?" },
        { title: "Set launch date", description: "Strategy Agent suggests launching publicly in Week 3 (21 days from now). Approve this timeline?" }
      ]
    };
    // ─────────────────────────────────────────────────

    // Delete old strategy if regenerating
    await supabase.from("strategies").delete().eq("user_id", user.id);

    const { data: savedStrategy, error } = await supabase
      .from("strategies")
      .insert([{
        user_id: user.id,
        client_id: client_id || client.id,
        ...strategy,
        status: "pending"
      }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, strategy: savedStrategy });
  } catch (err) {
    console.error("Strategy agent error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}