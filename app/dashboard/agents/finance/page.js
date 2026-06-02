"use client";
import { useEffect, useState } from "react";
import { createClient } from "../../../../lib/supabase";
import { useRouter } from "next/navigation";

export default function FinanceAgent() {
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
      .eq("agent", "finance")
      .order("created_at", { ascending: false })
      .limit(10);
    setOutputs(data || []);
    setLoading(false);
  };

  const runAgent = async () => {
    setRunning(true);
    try {
      const res = await fetch("/api/finance-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: "test", month: new Date().toLocaleString("default", { month: "long", year: "numeric" }) })
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
        .run-btn { margin-left: auto; background: linear-gradient(135deg, #7c3aed, #5b21b6); border: none; color: #fff; padding: 0.6rem 1.5rem; border-radius: 10px; font-size: 0.9rem; cursor: pointer; font-family: 'Space Grotesk', sans-serif; font-weight: 500; transition: all 0.2s; }
        .run-btn:hover { opacity: 0.85; transform: translateY(-1px); }
        .run-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
        .live-badge { display: inline-block; font-size: 0.7rem; padding: 2px 8px; border-radius: 100px; background: rgba(34,197,94,0.15); border: 1px solid rgba(34,197,94,0.3); color: #4ade80; margin-left: 0.5rem; vertical-align: middle; }
        .section-title { font-size: 0.75rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: #7c3aed; margin-bottom: 1rem; }
        .finance-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
        .finance-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 1rem 1.25rem; }
        .finance-label { font-size: 0.72rem; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.4rem; }
        .finance-value { font-family: 'Bebas Neue', cursive; font-size: 1.6rem; color: #a78bfa; }
        .finance-value.green { color: #4ade80; }
        .finance-value.red { color: #f87171; }
        .output-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 1.25rem 1.5rem; margin-bottom: 1rem; }
        .output-time { font-size: 0.75rem; color: #4b5563; margin-bottom: 0.75rem; }
        .output-status { display: inline-block; font-size: 0.7rem; padding: 2px 8px; border-radius: 100px; background: rgba(34,197,94,0.15); border: 1px solid rgba(34,197,94,0.3); color: #4ade80; margin-left: 0.5rem; }
        .output-content { font-size: 0.85rem; color: #d1d5db; line-height: 1.7; white-space: pre-wrap; }
        .empty-state { background: rgba(124,58,237,0.05); border: 1px dashed rgba(124,58,237,0.2); border-radius: 16px; padding: 3rem; text-align: center; color: #4b5563; font-size: 0.88rem; line-height: 1.6; }
        .summary-text { font-size: 0.88rem; color: #a78bfa; background: rgba(124,58,237,0.08); border: 1px solid rgba(124,58,237,0.15); border-radius: 10px; padding: 0.75rem 1rem; margin-bottom: 1rem; line-height: 1.6; }
        @media (max-width: 600px) { .finance-grid { grid-template-columns: 1fr 1fr; } }
      `}</style>

      <nav className="nav">
        <div className="logo">Launch<em>AI</em></div>
        <button className="back-btn" onClick={() => router.push("/dashboard")}>← Back to Dashboard</button>
      </nav>

      <div className="content">
        <div className="agent-header">
          <div className="agent-icon-big">📊</div>
          <div>
            <div className="agent-title">Finance Agent <span className="live-badge">🟢 Live</span></div>
            <div className="agent-desc">Tracks revenue from Razorpay, calculates P&L and flags payment issues</div>
          </div>
          <button className="run-btn" onClick={runAgent} disabled={running}>
            {running ? "Fetching..." : "▶ Run Agent"}
          </button>
        </div>

        <p className="section-title">Activity log — last 10 runs</p>

        {loading ? (
          <div style={{ color: "#6b7280", fontSize: "0.85rem" }}>Loading activity...</div>
        ) : outputs.length === 0 ? (
          <div className="empty-state">
            No activity yet — click "Run Agent" to fetch your P&L from Razorpay.<br />
            This agent is already live — no Anthropic credits needed!
          </div>
        ) : (
          outputs.map(o => (
            <div className="output-card" key={o.id}>
              <div className="output-time">
                {new Date(o.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                <span className="output-status">{o.status}</span>
              </div>
              {o.output?.summary && <div className="summary-text">{o.output.summary}</div>}
              <div className="finance-grid">
                <div className="finance-card">
                  <div className="finance-label">Revenue</div>
                  <div className="finance-value green">₹{(o.output?.revenue?.total || 0).toLocaleString('en-IN')}</div>
                </div>
                <div className="finance-card">
                  <div className="finance-label">Expenses</div>
                  <div className="finance-value red">₹{(o.output?.expenses?.total || 0).toLocaleString('en-IN')}</div>
                </div>
                <div className="finance-card">
                  <div className="finance-label">Net Profit</div>
                  <div className="finance-value">₹{(o.output?.net_profit || 0).toLocaleString('en-IN')}</div>
                </div>
              </div>
              <div className="output-content">
                {JSON.stringify(o.output?.expenses?.breakdown || {}, null, 2)}
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}