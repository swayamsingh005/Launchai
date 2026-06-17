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

    const { product_name, target_audience, industry, client_id } = await request.json();

    const limitCheck = await checkUsageLimit(supabase, user.id, client_id, "design");
    if (!limitCheck.allowed) {
      return limitReachedResponse(limitCheck.message, limitCheck.plan);
    }

    await new Promise(r => setTimeout(r, 2000));

    const design = {
      brand_colors: {
        primary: "#6C63FF",
        secondary: "#3ECFCF",
        accent: "#FF6584",
        background: "#0F0F1A",
        text: "#FFFFFF"
      },
      fonts: {
        heading: "Inter or Space Grotesk — modern, clean, trustworthy",
        body: "Inter — highly readable at all sizes"
      },
      logo_direction: `Minimalist wordmark for ${product_name}. Use a single geometric icon that represents speed or AI. Avoid complex illustrations.`,
      landing_page_feedback: [
        "Hero section should have a bold one-line value proposition",
        "Add a short demo video or animated GIF above the fold",
        "Use dark background with purple/teal accents for tech credibility",
        "Social proof section with 3 client logos or testimonials",
        "Single CTA button — no distractions"
      ],
      social_graphic_style: `Clean dark cards with ${product_name} branding. White headline text, purple gradient accents. Include product screenshot or icon. 1080x1080 for Instagram, 1200x628 for LinkedIn.`,
      ui_recommendations: [
        "Use card-based layout for dashboard — easy to scan",
        "Micro-animations on button hover and page transitions",
        "Status indicators with colour coding (green=active, amber=pending, red=error)",
        "Mobile-first — 60% of your users will be on phone"
      ],
      target_vibe: `Professional yet approachable. ${target_audience} should feel like they found a trusted partner, not a tool.`
    };

    const { data: savedDesign, error } = await supabase
      .from("agent_outputs")
      .insert([{
        user_id: user.id,
        client_id,
        agent: "design",
        output: design,
        status: "completed"
      }])
      .select()
      .single();

    if (error) throw error;

    await logUsage(supabase, user.id, client_id, "design");

    return NextResponse.json({ success: true, design: savedDesign, runsRemaining: limitCheck.remaining - 1 });
  } catch (err) {
    console.error("Design agent error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}