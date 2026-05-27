"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase";

export default function Strategy() {
  const [strategy, setStrategy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [approving, setApproving] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const { data } = await supabase
        .from("strategies")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (!data) {
        // No strategy yet — generate one
        setGenerating(true);
        const { data: client } = await supabase
          .from("clients")
          .select("id")
          .eq("user_id", user.id)
          .single();

        const res = await fetch("/api/strategy-agent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ client_id: client?.id })
        });
        const result = await res.json();
        if (result.success) {
          setStrategy(result.strategy);
        } else {
          alert("Failed to generate strategy. Please try again.");
        }
        setGenerating(false);
      } else {
        setStrategy(data);
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleApprove = async () => {
    setApproving(true);
    try {
      const supabase = createClient();
      await supabase.from("strategies")
        .update({ status: "approved" })
        .eq("id", strategy.id);
      await supabase.from("clients")
        .update({ status: "active" })
        .eq("user_id", strategy.user_id);
      router.push("/client-dashboard");
    } catch (err) {
      alert("Something went wrong. Try again.");
      setApproving(false);
    }
  };

  const handleRegenerate = async () => {
    if (!feedback.trim()) return;
    setRegenerating(true);
    try {
      const res = await fetch("/api/strategy-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedback: feedback.trim() })
      });
      const result = await res.json();
      if (result.success) {
        setStrategy(result.strategy);
        setFeedback("");
        setShowFeedback(false);
      }
    } catch (err) {
      alert("Regeneration failed. Try again.");
    }
    setRegenerating(false);
  };

  if (loading || generating) return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Bebas+Neue&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #050312; font-family: 'Inter', sans-serif; }
        .loading { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1.5rem; }
        .spinner { width: 56px; height: 56px; border: 3px solid rgba(124,58,237,0.15); border-top-color: #7c3aed; border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .load-title { font-family: 'Bebas Neue', cursive; font-size: 2rem; color: #fff; letter-spacing: 0.05em; text-shadow: 0 0 30px rgba(124,58,237,0.4); }
        .load-sub { font-size: 0.9rem; color: #7c3aed; font-weight: 500; }
        .load-note { font-size: 0.78rem; color: #4b5563; }
      `}</style>
      <div className="loading">
        <div className="spinner" />
        <div className="load-title">Strategy Agent Active</div>
        <div className="load-sub">{generating ? "Building your 30-day launch plan..." : "Loading your strategy..."}</div>
        <div className="load-note">This takes about 15 seconds...</div>
      </div>
    </>
  );

  if (!strategy) return (
    <>
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } body { background: #050312; color: #fff; font-family: 'Inter', sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; }`}</style>
      <div style={{ textAlign: "center" }}>
        <p>No strategy found.</p>
        <button onClick={() => router.push("/client-dashboard")} style={{ color: "#a78bfa", background: "none", border: "none", cursor: "pointer", marginTop: "1rem" }}>Go to dashboard</button>
      </div>
    </>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Bebas+Neue&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #050312; color: #f0eeff; font-family: 'Inter', sans-serif; }
        .page { min-height: 100vh; padding: 3rem 1.5rem; position: relative; }
        .bg-glow { position: fixed; width: 700px; height: 500px; border-radius: 50%; background: radial-gradient(circle, rgba(109,40,217,0.18) 0%, transparent 65%); top: -150px; left: 50%; transform: translateX(-50%); pointer-events: none; }
        .container { max-width: 800px; margin: 0 auto; position: relative; z-index: 1; }
        .top-bar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 2.5rem; flex-wrap: wrap; gap: 1rem; }
        .logo { font-family: 'Bebas Neue', cursive; font-size: 1.6rem; letter-spacing: 0.06em; color: #fff; }
        .logo em { color: #a78bfa; font-style: normal; }
        .agent-badge { display: flex; align-items: center; gap: 0.5rem; background: rgba(124,58,237,0.1); border: 1px solid rgba(124,58,237,0.3); padding: 0.4rem 1rem; border-radius: 100px; font-size: 0.78rem; color: #c4b5fd; }
        .badge-dot { width: 6px; height: 6px; border-radius: 50%; background: #a78bfa; animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .hero { margin-bottom: 2.5rem; }
        .hero-tag { font-size: 0.68rem; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; color: #7c3aed; margin-bottom: 0.75rem; }
        .hero-title { font-family: 'Bebas Neue', cursive; font-size: clamp(2.2rem, 5vw, 3.5rem); color: #fff; letter-spacing: 0.03em; line-height: 1; margin-bottom: 0.5rem; text-shadow: 0 0 40px rgba(124,58,237,0.3); }
        .hero-title em { color: #a78bfa; font-style: normal; }
        .hero-sub { font-size: 0.9rem; color: #6b7280; }
        .section { background: rgba(255,255,255,0.03); border: 1px solid rgba(124,58,237,0.15); border-radius: 20px; padding: 1.75rem; margin-bottom: 1rem; }
        .section-label { font-size: 0.65rem; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; color: #7c3aed; margin-bottom: 0.85rem; display: flex; align-items: center; gap: 0.5rem; }
        .section-text { font-size: 0.9rem; color: #d1d5db; line-height: 1.8; }
        .channels { display: flex; flex-direction: column; gap: 0.6rem; margin-top: 0.5rem; }
        .channel { display: flex; align-items: flex-start; gap: 0.75rem; font-size: 0.88rem; color: #d1d5db; }
        .channel-dot { width: 6px; height: 6px; border-radius: 50%; background: #7c3aed; flex-shrink: 0; margin-top: 6px; }
        .roadmap { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-top: 0.5rem; }
        .week-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 1rem; }
        .week-title { font-size: 0.78rem; font-weight: 600; color: #a78bfa; margin-bottom: 0.6rem; letter-spacing: 0.05em; text-transform: uppercase; }
        .week-tasks { display: flex; flex-direction: column; gap: 0.4rem; }
        .week-task { font-size: 0.8rem; color: #9ca3af; display: flex; gap: 0.5rem; align-items: flex-start; }
        .week-task::before { content: "→"; color: #7c3aed; flex-shrink: 0; }
        .decisions { display: flex; flex-direction: column; gap: 0.75rem; margin-top: 0.5rem; }
        .decision { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 1rem 1.25rem; }
        .decision-title { font-size: 0.88rem; font-weight: 600; color: #e9d5ff; margin-bottom: 0.3rem; }
        .decision-desc { font-size: 0.8rem; color: #6b7280; line-height: 1.5; }
        .btn-row { display: flex; gap: 0.75rem; margin-top: 2rem; flex-wrap: wrap; }
        .btn-changes { flex: 1; min-width: 140px; background: transparent; border: 1px solid rgba(255,255,255,0.12); color: #9ca3af; padding: 0.9rem; border-radius: 12px; font-size: 0.9rem; cursor: pointer; font-family: 'Inter', sans-serif; transition: all 0.2s; }
        .btn-changes:hover { border-color: rgba(255,255,255,0.25); color: #fff; }
        .btn-approve { flex: 2; min-width: 200px; background: linear-gradient(135deg, #7c3aed, #5b21b6); color: #fff; border: none; padding: 0.9rem; border-radius: 12px; font-size: 0.95rem; font-weight: 600; cursor: pointer; font-family: 'Inter', sans-serif; transition: all 0.25s; box-shadow: 0 6px 20px rgba(124,58,237,0.35); }
        .btn-approve:hover { transform: translateY(-1px); box-shadow: 0 10px 28px rgba(124,58,237,0.5); }
        .btn-approve:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        .feedback-box { margin-top: 1rem; background: rgba(255,255,255,0.02); border: 1px solid rgba(124,58,237,0.2); border-radius: 16px; padding: 1.25rem; }
        .feedback-label { font-size: 0.78rem; color: #9ca3af; margin-bottom: 0.75rem; }
        .feedback-textarea { width: 100%; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 0.85rem 1rem; border-radius: 10px; font-size: 0.88rem; font-family: 'Inter', sans-serif; outline: none; resize: none; min-height: 80px; transition: all 0.2s; }
        .feedback-textarea:focus { border-color: #7c3aed; background: rgba(124,58,237,0.06); }
        .feedback-textarea::placeholder { color: #374151; }
        .btn-regenerate { margin-top: 0.75rem; width: 100%; background: rgba(124,58,237,0.15); border: 1px solid rgba(124,58,237,0.3); color: #a78bfa; padding: 0.75rem; border-radius: 10px; font-size: 0.88rem; font-weight: 500; cursor: pointer; font-family: 'Inter', sans-serif; transition: all 0.2s; }
        .btn-regenerate:hover { background: rgba(124,58,237,0.25); }
        .btn-regenerate:disabled { opacity: 0.5; cursor: not-allowed; }
        @media (max-width: 600px) { .roadmap { grid-template-columns: 1fr; } .page { padding: 2rem 1rem; } }
      `}</style>

      <div className="bg-glow" />
      <div className="page">
        <div className="container">
          <div className="top-bar">
            <div className="logo">Launch<em>AI</em></div>
            <div className="agent-badge"><span className="badge-dot" />Strategy Agent</div>
          </div>

          <div className="hero">
            <div className="hero-tag">Your 30-day plan is ready</div>
            <div className="hero-title">Your <em>launch strategy</em><br />is live.</div>
            <div className="hero-sub">Strategy Agent has built your complete go-to-market plan. Review and approve to activate your agents.</div>
          </div>

          {/* Launch Plan */}
          <div className="section">
            <div className="section-label">🚀 Launch Plan</div>
            <div className="section-text">{strategy.launch_plan}</div>
          </div>

          {/* Pricing Strategy */}
          <div className="section">
            <div className="section-label">💰 Pricing Strategy</div>
            <div className="section-text">{strategy.pricing_strategy}</div>
          </div>

          {/* Marketing Channels */}
          <div className="section">
            <div className="section-label">📣 Marketing Channels</div>
            <div className="channels">
              {(strategy.marketing_channels || []).map((c, i) => (
                <div className="channel" key={i}>
                  <div className="channel-dot" />
                  {c}
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Roadmap */}
          <div className="section">
            <div className="section-label">📅 30-Day Roadmap</div>
            <div className="roadmap">
              {(strategy.weekly_roadmap || []).map((w, i) => (
                <div className="week-card" key={i}>
                  <div className="week-title">{w.week}</div>
                  <div className="week-tasks">
                    {(w.tasks || []).map((t, j) => (
                      <div className="week-task" key={j}>{t}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Decisions */}
          <div className="section">
            <div className="section-label">⚡ Decisions Queued For You</div>
            <div className="decisions">
              {(strategy.decisions || []).map((d, i) => (
                <div className="decision" key={i}>
                  <div className="decision-title">{d.title}</div>
                  <div className="decision-desc">{d.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="btn-row">
            <button className="btn-changes" onClick={() => setShowFeedback(!showFeedback)}>
              Request Changes
            </button>
            <button className="btn-approve" onClick={handleApprove} disabled={approving}>
              {approving ? "Activating agents..." : "Approve Strategy & Activate →"}
            </button>
          </div>

          {/* Feedback Box */}
          {showFeedback && (
            <div className="feedback-box">
              <div className="feedback-label">Tell Strategy Agent what to change:</div>
              <textarea
                className="feedback-textarea"
                placeholder="e.g. Focus more on college students, change pricing to ₹299/month, add YouTube as a channel..."
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
              />
              <button
                className="btn-regenerate"
                onClick={handleRegenerate}
                disabled={regenerating || !feedback.trim()}
              >
                {regenerating ? "Regenerating strategy..." : "Regenerate Strategy →"}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}