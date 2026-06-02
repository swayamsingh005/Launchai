"use client";
import { useEffect, useState } from "react";
import { createClient } from "../../../../lib/supabase";
import { useRouter } from "next/navigation";

export default function GrowthAgent() {
  const [outputs, setOutputs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => { fetchOutputs(); }, []);

  const fetchOutputs = async () => {
    const { data } = await supabase
      .from("agent_outputs")
      .select("*")
      .eq("agent", "growth")
      .order("created_at", { ascending: false })
      .limit(10);
    setOutputs(data || []);
    setLoading(false);
  };

  const runAgent = async () => {
    setRunning(true);
    try {
      const res = await fetch("/api/growth-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_name: "LaunchAI",
          industry: "AI SaaS",
          competitors: ["Zapier", "Make", "AutoGPT"],
          client_id: "test"
        })
      });
      const data = await res.json();
      if (data.success) await fetchOutputs();
    } catch (err) { console.error(err); }
    setRunning(false);
  };

  return (
    <main style={{ minHeight: "100vh", background: "#08061a", color: "#f0eeff", fontFamily: "'Space Grotesk', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600&family=Bebas+Neue&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .nav { display: flex; align-items: center; justify-content: space-between; padding: 1.1rem 2rem; background: rgba(8,6,26,0.9); border-bottom: 1px solid rgba(124,58,237,0.15); position: sticky; top: 0; z-index: 100; backdrop-filter: blur(16px); }
        .logo { font-family: 'Bebas Neue', cursive; font-size: 1.6rem; letter-spacing: 0.05em; }
        .logo em { color: #a78bfa; font-style: normal; }
        .back-btn { background: none; border: 1px solid rgba(255,255,255,0.1); color: #9ca3af; padding: 0.4rem 1rem; border-radius: 100px; font-size: 0.82rem; cursor: pointer; font-family: 'Space Grotesk', sans-serif; transition: all 0.2s; }
        .back-btn:hover { border-color: rgba(167,139,250,0.4); color: #a78bfa; }
        .content { padding: 2rem; max-width: 900px; margin: 0 auto; }
        .agent-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem; }
        .agent-icon-big { width: 56px; height: 56px; background: rgba(124,58,237,0.2); border: 1px solid rgba(124,58,237,0.3); border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; flex-shrink: 0; }
        .agent-title { font-family: 'Bebas Neue', cursive; font-size: 2rem; letter-spacing: 0.03em; color: #fff; }
        .agent-desc { font-size: 0.85rem; color: #6b7280; margin-top: 0.2rem; }
        .live-badge { display: inline-block; font-size: 0.7rem; padding: 2px 8px; border-radius: 100px; background: rgba(34,197,94,0.15); border: 1px solid rgba(34,197,94,0.3); color: #4ade80; margin-left: 0.5rem; vertical-align: middle; }
        .run-btn { margin-left: auto; background: linear-gradient(135deg, #7c3aed, #5b21b6); border: none; color: #fff; padding: 0.6rem 1.5rem; border-radius: 10px; font-size: 0.9rem; cursor: pointer; font-family: 'Space Grotesk', sans-serif; font-weight: 500; transition: all 0.2s; }
        .run-btn:hover { opacity: 0.85; transform: translateY(-1px); }
        .run-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
        .section-title { font-size: 0.75rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: #7c3aed; margin-bottom: 1rem; }
        .output-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 1.25rem 1.5rem; margin-bottom: 1rem; }
        .output-time { font-size: 0.75rem; color: #4b5563; margin-bottom: 0.75rem; }
        .output-status { display: inline-block; font-size: 0.7rem; padding: 2px 8px; border-radius: 100px; background: rgba(34,197,94,0.15); border: 1px solid rgba(34,197,94,0.3); color: #4ade80; margin-left: 0.5rem; }
        .sub-section { margin-bottom: 1rem; }
        .sub-label { font-size: 0.72rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #7c3aed; margin-bottom: 0.5rem; }
        .item { font-size: 0.85rem; color: #d1d5db; line-height: 1.6; padding: 0.4rem 0; border-bottom: 0.5px solid rgba(255,255,255,0.04); }
        .item:last-child { border-bottom: none; }
        .item-link { font-size: 0.8rem; color: #a78bfa; text-decoration: none; }
        .item-link:hover { text-decoration: underline; }
        .score-badge { display: inline-block; font-family: 'Bebas Neue', cursive; font-size: 1.4rem; color: #4ade80; margin-right: 0.5rem; }
        .empty-state { background: rgba(124,58,237,0.05); border: 1px dashed rgba(124,58,237,0.2); border-radius: 16px; padding: 3rem; text-align: center; color: #4b5563; font-size: 0.88rem; line-height: 1.6; }
      `}</style>

      <nav className="nav">
        <div className="logo">Launch<em>AI</em></div>
        <button className="back-btn" onClick={() => router.push("/dashboard")}>← Back to Dashboard</button>
      </nav>

      <div className="content">
        <div className="agent-header">
          <div className="agent-icon-big">🔍</div>
          <div>
            <div className="agent-title">Growth Agent <span className="live-badge">🟢 Live</span></div>
            <div className="agent-desc">Monitors competitors and market trends using Tavily — weekly growth opportunities</div>
          </div>
          <button className="run-btn" onClick={runAgent} disabled={running}>
            {running ? "Searching..." : "▶ Run Agent"}
          </button>
        </div>

        <p className="section-title">Activity log — last 10 runs</p>

        {loading ? (
          <div style={{ color: "#6b7280", fontSize: "0.85rem" }}>Loading activity...</div>
        ) : outputs.length === 0 ? (
          <div className="empty-state">
            No activity yet — click "Run Agent" to get this week's growth insights.<br />
            This agent is already live using Tavily search — no Anthropic credits needed!
          </div>
        ) : (
          outputs.map(o => (
            <div className="output-card" key={o.id}>
              <div className="output-time">
                {new Date(o.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                <span className="output-status">{o.status}</span>
                {o.output?.growth_score && <span style={{ marginLeft: "0.5rem", fontSize: "0.75rem", color: "#4ade80" }}>Score: {o.output.growth_score}/100</span>}
              </div>

              {o.output?.weekly_summary?.opportunities?.length > 0 && (
                <div className="sub-section">
                  <div className="sub-label">🚀 Opportunities</div>
                  {o.output.weekly_summary.opportunities.map((item, i) => (
                    <div className="item" key={i}>→ {item}</div>
                  ))}
                </div>
              )}

              {o.output?.weekly_summary?.recommended_actions?.length > 0 && (
                <div className="sub-section">
                  <div className="sub-label">✅ Recommended Actions</div>
                  {o.output.weekly_summary.recommended_actions.map((item, i) => (
                    <div className="item" key={i}>• {item}</div>
                  ))}
                </div>
              )}

              {o.output?.competitor_news?.length > 0 && (
                <div className="sub-section">
                  <div className="sub-label">📰 Competitor News</div>
                  {o.output.competitor_news.map((item, i) => (
                    <div className="item" key={i}>
                      <a className="item-link" href={item.url} target="_blank" rel="noreferrer">{item.title}</a>
                      <div style={{ fontSize: "0.78rem", color: "#6b7280", marginTop: "0.2rem" }}>{item.summary}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </main>
  );
}