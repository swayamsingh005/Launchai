import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import Razorpay from "razorpay";

// Credit pack pricing — adjust these anytime
const CREDIT_PACKS = {
  small: { credits: 50, amount: 30000 },   // ₹300 for 50 runs
  medium: { credits: 100, amount: 50000 }, // ₹500 for 100 runs
  large: { credits: 250, amount: 100000 }, // ₹1000 for 250 runs
};

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

    const { pack } = await request.json(); // "small" | "medium" | "large"
    const selectedPack = CREDIT_PACKS[pack];

    if (!selectedPack) {
      return NextResponse.json({ error: "Invalid credit pack selected" }, { status: 400 });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const order = await razorpay.orders.create({
      amount: selectedPack.amount, // in paise
      currency: "INR",
      receipt: `credits_${user.id.slice(0, 8)}_${Date.now()}`,
      notes: {
        user_id: user.id,
        credits: selectedPack.credits,
        type: "credit_topup",
      },
    });

    // Save as pending — gets updated to "completed" after verify
    await supabase.from("credit_purchases").insert([{
      user_id: user.id,
      razorpay_order_id: order.id,
      credits_purchased: selectedPack.credits,
      amount_inr: selectedPack.amount / 100,
      status: "pending",
    }]);

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: selectedPack.amount,
      credits: selectedPack.credits,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("Create credit order error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}