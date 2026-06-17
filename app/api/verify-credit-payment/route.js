import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import crypto from "crypto";

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

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = await request.json();

    // Verify the payment signature — this confirms it's a real Razorpay payment, not faked
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
    }

    // Find the pending purchase record for this order
    const { data: purchase, error: fetchError } = await supabase
      .from("credit_purchases")
      .select("*")
      .eq("razorpay_order_id", razorpay_order_id)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !purchase) {
      return NextResponse.json({ error: "Purchase record not found" }, { status: 404 });
    }

    // Mark purchase as completed
    await supabase
      .from("credit_purchases")
      .update({
        status: "completed",
        razorpay_payment_id,
      })
      .eq("id", purchase.id);

    // Add the credits to the client's account
    const { data: client } = await supabase
      .from("clients")
      .select("extra_credits")
      .eq("user_id", user.id)
      .single();

    const currentExtra = client?.extra_credits || 0;
    const newExtra = currentExtra + purchase.credits_purchased;

    await supabase
      .from("clients")
      .update({ extra_credits: newExtra })
      .eq("user_id", user.id);

    return NextResponse.json({
      success: true,
      creditsAdded: purchase.credits_purchased,
      newBalance: newExtra,
    });
  } catch (err) {
    console.error("Verify credit payment error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}