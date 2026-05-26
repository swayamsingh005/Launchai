"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase";

export default function Payment() {
  const [user, setUser] = useState(null);
  const [brief, setBrief] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUser(user);

      const { data } = await supabase
        .from("briefs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      setBrief(data);
      setLoading(false);
    };
    load();
  }, []);

  const handlePayment = async () => {
    setPaying(true);
    try {
      // Load Razorpay script
      await new Promise((resolve, reject) => {
        if (window.Razorpay) { resolve(); return; }
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
      });

      // Create order
      const orderRes = await fetch("/api/create-order", { method: "POST" });
      const { order, error } = await orderRes.json();
      if (error) throw new Error(error);

      // Open Razorpay popup
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "LaunchAI",
        description: "AI Company — Monthly Subscription",
        order_id: order.id,
        prefill: {
          email: user.email,
          name: user.user_metadata?.full_name || "",
        },
        theme: { color: "#7c3aed" },
        handler: async (response) => {
          // Verify payment
          const verifyRes = await fetch("/api/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          const result = await verifyRes.json();
          if (result.success) {
            router.push("/client-dashboard");
          } else {
            alert("Payment verification failed. Contact support.");
          }
        },
        modal: {
          ondismiss: () => { setPaying(false); }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
      setPaying(false);
    }
  };

  if (loading) return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #050312; font-family: 'Inter', sans-serif; }
        .loading { min-height: 100vh; display: flex; align-items: center; justify-content: center; }
        .spinner { width: 40px; height: 40px; border: 3px solid rgba(124,58,237,0.2); border-top-color: #7c3aed; border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
      <div className="loading"><div className="spinner" /></div>
    </>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Bebas+Neue&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #050312; color: #f0eeff; font-family: 'Inter', sans-serif; min-height: 100vh; }

        .page { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2rem 1.5rem; position: relative; }
        .bg-glow { position: fixed; width: 800px; height: 600px; border-radius: 50%; background: radial-gradient(circle, rgba(109,40,217,0.2) 0%, transparent 65%); top: -200px; left: 50%; transform: translateX(-50%); pointer-events: none; }

        .card { background: rgba(255,255,255,0.03); border: 1px solid rgba(124,58,237,0.2); border-radius: 28px; padding: 3rem 2.5rem; width: 100%; max-width: 520px; position: relative; z-index: 1; box-shadow: 0 0 80px rgba(124,58,237,0.08); text-align: center; }

        .logo { font-family: 'Bebas Neue', cursive; font-size: 1.6rem; letter-spacing: 0.06em; color: #fff; margin-bottom: 2rem; }
        .logo em { color: #a78bfa; font-style: normal; }

        .rocket { font-size: 3rem; margin-bottom: 1.25rem; }

        .tag { font-size: 0.68rem; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; color: #7c3aed; margin-bottom: 0.75rem; }
        .title { font-family: 'Bebas Neue', cursive; font-size: clamp(2rem, 5vw, 3rem); color: #fff; letter-spacing: 0.03em; line-height: 1.1; margin-bottom: 0.75rem; text-shadow: 0 0 40px rgba(124,58,237,0.3); }
        .title em { color: #a78bfa; font-style: normal; }
        .subtitle { font-size: 0.9rem; color: #9ca3af; margin-bottom: 2rem; line-height: 1.6; }

        .price-box { background: rgba(124,58,237,0.08); border: 1px solid rgba(124,58,237,0.25); border-radius: 20px; padding: 1.75rem; margin-bottom: 2rem; }
        .price-num { font-family: 'Bebas Neue', cursive; font-size: 4rem; color: #c4b5fd; letter-spacing: 0.02em; line-height: 1; text-shadow: 0 0 30px rgba(167,139,250,0.4); }
        .price-period { font-size: 0.85rem; color: #6b7280; margin-top: 0.3rem; }

        .perks { list-style: none; text-align: left; display: flex; flex-direction: column; gap: 0.6rem; margin-bottom: 2rem; }
        .perk { display: flex; align-items: center; gap: 0.75rem; font-size: 0.85rem; color: #d1d5db; }
        .perk-check { width: 18px; height: 18px; border-radius: 50%; background: rgba(124,58,237,0.2); border: 1px solid rgba(124,58,237,0.4); display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 0.6rem; color: #a78bfa; }

        .brief-banner { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 0.85rem 1.25rem; margin-bottom: 2rem; display: flex; align-items: center; gap: 0.75rem; text-align: left; }
        .brief-label { font-size: 0.65rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #7c3aed; }
        .brief-name { font-size: 0.95rem; font-weight: 500; color: #e9d5ff; margin-top: 0.1rem; }

        .btn-pay { width: 100%; background: linear-gradient(135deg, #7c3aed, #5b21b6); color: #fff; border: none; padding: 1.1rem; border-radius: 14px; font-size: 1rem; font-weight: 600; cursor: pointer; font-family: 'Inter', sans-serif; transition: all 0.25s; box-shadow: 0 8px 24px rgba(124,58,237,0.4); }
        .btn-pay:hover { transform: translateY(-2px); box-shadow: 0 14px 36px rgba(124,58,237,0.55); }
        .btn-pay:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        .secure-note { font-size: 0.75rem; color: #4b5563; margin-top: 1rem; display: flex; align-items: center; justify-content: center; gap: 0.4rem; }

        @media (max-width: 500px) { .card { padding: 2rem 1.5rem; } }
      `}</style>

      <div className="bg-glow" />
      <div className="page">
        <div className="card">
          <div className="logo">Launch<em>AI</em></div>

          <div className="rocket">🚀</div>
          <div className="tag">One last step</div>
          <div className="title">Activate your<br /><em>AI company</em></div>
          <div className="subtitle">Your brief is approved. Pay once to activate all 12 AI agents and start building your company today.</div>

          {brief && (
            <div className="brief-banner">
              <div style={{ fontSize: "1.5rem" }}>✅</div>
              <div>
                <div className="brief-label">Brief approved</div>
                <div className="brief-name">{brief.product_name}</div>
              </div>
            </div>
          )}

          <div className="price-box">
            <div className="price-num">₹30,000</div>
            <div className="price-period">per month · cancel anytime</div>
          </div>

          <ul className="perks">
            {[
              "Product built and launched in 48 hours",
              "All 12 AI agents activated immediately",
              "Daily marketing, sales and support",
              "Weekly performance reports",
              "You only make the final decisions",
            ].map(p => (
              <li className="perk" key={p}>
                <span className="perk-check">✓</span>{p}
              </li>
            ))}
          </ul>

          <button className="btn-pay" onClick={handlePayment} disabled={paying}>
            {paying ? "Opening payment..." : "Pay ₹30,000 & Activate →"}
          </button>

          <div className="secure-note">
            🔒 Secured by Razorpay · UPI, Cards, Net Banking accepted
          </div>
        </div>
      </div>
    </>
  );
}