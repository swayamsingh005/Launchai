import { NextResponse } from "next/server";
import Razorpay from "razorpay";
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

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const order = await razorpay.orders.create({
      amount: 3000000, // ₹30,000 in paise
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
      notes: {
        user_id: user.id,
        email: user.email,
      },
    });

    return NextResponse.json({ success: true, order });
  } catch (err) {
    console.error("Create order error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}