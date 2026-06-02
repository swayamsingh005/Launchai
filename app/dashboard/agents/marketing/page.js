"use client";
import { useEffect, useState } from "react";
import { createClient } from "../../../../lib/supabase";
import { useRouter } from "next/navigation";

export default function MarketingAgent() {
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
      .eq("agent", "marketing")
      .order("created_at", { ascending: false })
      .limit(10);
    setOutputs(data || []);
    setLoading(false);
  };

  const runAgent = async (auto_post = false) => {
    setRunning(true);
    try {
      const res = await fetch("/api/marketing-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_name: "LaunchAI",
          target_audience: "Early stage founders",
          industry: "AI SaaS",
          tone: "Bold and inspiring",
          client_id: "test",
          auto_post
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
        .btn-row { margin-left: auto; display: flex; gap: 0.5rem; }
        .run-btn { background: linear-gradient(135deg, #7c3aed, #5b21b6); border: none; color: #fff; padding: 0.6rem 1.25rem; border-radius: 10px; font-size: 0.85rem; cursor: pointer; font-family: 'Space Grotesk', sans-serif; font-weight: 500; transition: all 0.2s; }
        .run-btn:hover { opacity: 0.85; transform: translateY(-1px); }
        .run-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
        .post-btn { background: linear-gradient(135deg, #059669, #047857); border: none; color: #fff; padding: 0.6rem 1.25rem; border-radius: 10px; font-size: 0.85rem; cursor: pointer; font-family: 'Space Grotesk', sans-serif; font-weight: 500; transition: all 0.2s; }
        .post-btn:hover { opacity: 0.85; }
        .post-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .section-title { font-size: 0.75rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: #7c3aed; margin-bottom: 1rem; }
        .output-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 1.25rem 1.5rem; margin-bottom: 1rem; }
        .output-time { font-size: 0.75rem; color: #4b5563; margin-bottom: 0.75rem; }
        .output-status { display: inline-block; font-size: 0.7rem; padding: 2px 8px; border-radius: 100px; background: rgba(34,197,94,0.15); border: 1px solid rgba(34,197,94,0.3); color: #4ade80; margin-left: 0.5rem; }
        .output-status.posted { background: rgba(16,185,129,0.2); border-color: rgba(16,185,129,0.4); color: #34d399; }
        .output-content { font-size: 0.85rem; color: #d1d5db; line-height: 1.7; white-space: pre-wrap; }
        .empty-state { background: rgba(124,58,237,0.05); border: 1px dashed rgba(124,58,237,0.2); border-radius: 16px; padding: 3rem; text-align: center; color: #4b5563; font-size: 0.88rem; line-height: 1.6; }
        .platform-tag { display: inline-block; font-size: 0.72rem; padding: 2px 8px; border-radius: 100px; background: rgba(124,58,237,0.15); color: #a78bfa; border: 1px solid rgba(124,58,237,0.2); margin-right: 0.4rem; margin-bottom: 0.75rem; }
      `}</style>

      <nav className="nav">
        <div className="logo">Launch<em>AI</em></div>
        <button className="back-btn" onClick={() => router.push("/dashboard")}>← Back to Dashboard</button>
      </nav>

      <div className="content">
        <div className="agent-header">
          <div className="agent-icon-big">📣</div>
          <div>
            <div className="agent-title">Marketing Agent</div>
            <div className="agent-desc">Generates daily content for Instagram, LinkedIn and Twitter — approve then auto-post via Buffer</div>
          </div>
          <div className="btn-row">
            <button className="run-btn" onClick={() => runAgent(false)} disabled={running}>
              {running ? "Running..." : "▶ Generate"}
            </button>
            <button className="post-btn" onClick={() => runAgent(true)} disabled={running}>
              🚀 Generate + Post
            </button>
          </div>
        </div>

        <p className="section-title">Activity log — last 10 runs</p>

        {loading ? (
          <div style={{ color: "#6b7280", fontSize: "0.85rem" }}>Loading activity...</div>
        ) : outputs.length === 0 ? (
          <div className="empty-state">
            No activity yet — click "Generate" to create today's content.<br />
            Use "Generate + Post" to auto-post via Buffer after approval.
          </div>
        ) : (
          outputs.map(o => (
            <div className="output-card" key={o.id}>
              <div className="output-time">
                {new Date(o.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                <span className={`output-status ${o.status === 'posted' ? 'posted' : ''}`}>{o.status}</span>
              </div>
              <span className="platform-tag">📸 Instagram</span>
              <span className="platform-tag">💼 LinkedIn</span>
              <span className="platform-tag">🐦 Twitter</span>
              <div className="output-content">
                {typeof o.output === 'object' ? JSON.stringify(o.output, null, 2) : o.output}
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}