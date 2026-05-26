"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase";

export default function Brief() {
  const [brief, setBrief] = useState(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchBrief = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

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
    fetchBrief();
  }, []);

  const handleApprove = async () => {
    setApproving(true);
    try {
      const supabase = createClient();
      await supabase.from("briefs")
        .update({ status: "approved" })
        .eq("id", brief.id);
      router.push("/payment");
    } catch (err) {
      alert("Something went wrong. Try again.");
      setApproving(false);
    }
  };

  const handleChanges = () => router.push("/onboarding");

  if (loading) return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Bebas+Neue&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #050312; font-family: 'Inter', sans-serif; }
        .loading { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1.5rem; }
        .spinner { width: 48px; height: 48px; border: 3px solid rgba(124,58,237,0.2); border-top-color: #7c3aed; border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .load-title { font-family: 'Bebas Neue', cursive; font-size: 1.8rem; color: #fff; letter-spacing: 0.05em; }
        .load-sub { font-size: 0.88rem; color: #6b7280; }
      `}</style>
      <div className="loading">
        <div className="spinner" />
        <div className="load-title">Intake Agent is working...</div>
        <div className="load-sub">Reading your idea and generating your product brief</div>
      </div>
    </>
  );

  if (!brief) return (
    <>
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } body { background: #050312; color: #fff; font-family: 'Inter', sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; }`}</style>
      <div style={{ textAlign: "center" }}>No brief found. <a href="/onboarding" style={{ color: "#a78bfa" }}>Go back to onboarding</a></div>
    </>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Bebas+Neue&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #050312; color: #f0eeff; font-family: 'Inter', sans-serif; }

        .page { min-height: 100vh; padding: 3rem 1.5rem; position: relative; overflow: hidden; }
        .bg-glow { position: fixed; width: 700px; height: 500px; border-radius: 50%; background: radial-gradient(circle, rgba(109,40,217,0.2) 0%, transparent 65%); top: -150px; left: 50%; transform: translateX(-50%); pointer-events: none; }

        .container { max-width: 720px; margin: 0 auto; position: relative; z-index: 1; }

        .top-bar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 2.5rem; }
        .logo { font-family: 'Bebas Neue', cursive; font-size: 1.6rem; letter-spacing: 0.06em; color: #fff; }
        .logo em { color: #a78bfa; font-style: normal; }
        .agent-badge { display: flex; align-items: center; gap: 0.5rem; background: rgba(124,58,237,0.1); border: 1px solid rgba(124,58,237,0.3); padding: 0.4rem 1rem; border-radius: 100px; font-size: 0.78rem; color: #c4b5fd; }
        .badge-dot { width: 6px; height: 6px; border-radius: 50%; background: #a78bfa; animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }

        .hero { margin-bottom: 2.5rem; }
        .hero-tag { font-size: 0.68rem; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; color: #7c3aed; margin-bottom: 0.75rem; }
        .hero-title { font-family: 'Bebas Neue', cursive; font-size: clamp(2.5rem, 6vw, 4rem); color: #fff; letter-spacing: 0.03em; line-height: 1; margin-bottom: 0.5rem; text-shadow: 0 0 40px rgba(124,58,237,0.3); }
        .hero-title em { color: #a78bfa; font-style: normal; }
        .hero-sub { font-size: 0.9rem; color: #6b7280; }

        .brief-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(124,58,237,0.2); border-radius: 24px; padding: 2rem; margin-bottom: 1rem; box-shadow: 0 0 60px rgba(124,58,237,0.06); }

        .product-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1.5rem; padding-bottom: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.06); flex-wrap: wrap; gap: 1rem; }
        .product-name { font-family: 'Bebas Neue', cursive; font-size: 2.2rem; color: #fff; letter-spacing: 0.03em; line-height: 1; }
        .status-pill { background: rgba(124,58,237,0.15); border: 1px solid rgba(124,58,237,0.3); color: #a78bfa; font-size: 0.72rem; font-weight: 600; padding: 0.3rem 0.9rem; border-radius: 100px; letter-spacing: 0.05em; text-transform: uppercase; white-space: nowrap; }

        .what-it-does { font-size: 1rem; color: #d1d5db; line-height: 1.7; margin-bottom: 2rem; }

        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; }
        .field { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 1.25rem; }
        .field-label { font-size: 0.65rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: #7c3aed; margin-bottom: 0.5rem; }
        .field-value { font-size: 0.88rem; color: #e9d5ff; line-height: 1.6; }

        .features-field { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 1.25rem; margin-bottom: 1rem; }
        .features-list { display: flex; flex-direction: column; gap: 0.5rem; margin-top: 0.5rem; }
        .feature-item { display: flex; align-items: center; gap: 0.75rem; font-size: 0.88rem; color: #e9d5ff; }
        .feature-dot { width: 6px; height: 6px; border-radius: 50%; background: #7c3aed; flex-shrink: 0; }

        .btn-row { display: flex; gap: 0.75rem; margin-top: 2rem; }
        .btn-changes { flex: 1; background: transparent; border: 1px solid rgba(255,255,255,0.12); color: #9ca3af; padding: 0.9rem; border-radius: 12px; font-size: 0.9rem; cursor: pointer; font-family: 'Inter', sans-serif; transition: all 0.2s; }
        .btn-changes:hover { border-color: rgba(255,255,255,0.25); color: #fff; }
        .btn-approve { flex: 2; background: linear-gradient(135deg, #7c3aed, #5b21b6); color: #fff; border: none; padding: 0.9rem; border-radius: 12px; font-size: 0.95rem; font-weight: 600; cursor: pointer; font-family: 'Inter', sans-serif; transition: all 0.25s; box-shadow: 0 6px 20px rgba(124,58,237,0.35); }
        .btn-approve:hover { transform: translateY(-1px); box-shadow: 0 10px 28px rgba(124,58,237,0.5); }
        .btn-approve:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        .note { font-size: 0.78rem; color: #4b5563; text-align: center; margin-top: 1rem; }

        @media (max-width: 600px) { .grid { grid-template-columns: 1fr; } .page { padding: 2rem 1rem; } }
      `}</style>

      <div className="bg-glow" />
      <div className="page">
        <div className="container">
          <div className="top-bar">
            <div className="logo">Launch<em>AI</em></div>
            <div className="agent-badge"><span className="badge-dot" />Intake Agent</div>
          </div>

          <div className="hero">
            <div className="hero-tag">Your product brief is ready</div>
            <div className="hero-title">Your AI company<br />is <em>almost live.</em></div>
            <div className="hero-sub">Our Intake Agent has analysed your idea and built your product brief. Review it below.</div>
          </div>

          <div className="brief-card">
            <div className="product-header">
              <div className="product-name">{brief.product_name}</div>
              <div className="status-pill">Brief Ready</div>
            </div>

            <div className="what-it-does">{brief.what_it_does}</div>

            <div className="features-field">
              <div className="field-label">5 Key Features</div>
              <div className="features-list">
                {(brief.features || []).map((f, i) => (
                  <div className="feature-item" key={i}>
                    <div className="feature-dot" />
                    {f}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid">
              <div className="field">
                <div className="field-label">Target Customer</div>
                <div className="field-value">{brief.target_customer}</div>
              </div>
              <div className="field">
                <div className="field-label">Tech Stack</div>
                <div className="field-value">{brief.tech_stack}</div>
              </div>
              <div className="field">
                <div className="field-label">Unique Advantage</div>
                <div className="field-value">{brief.unique_advantage}</div>
              </div>
              <div className="field">
                <div className="field-label">30-Day Launch Goal</div>
                <div className="field-value">{brief.launch_goal}</div>
              </div>
            </div>

            <div className="btn-row">
              <button className="btn-changes" onClick={handleChanges}>Request Changes</button>
              <button className="btn-approve" onClick={handleApprove} disabled={approving}>
                {approving ? "Approving..." : "Approve & Continue →"}
              </button>
            </div>
            <div className="note">Approving this brief will take you to payment</div>
          </div>
        </div>
      </div>
    </>
  );
}