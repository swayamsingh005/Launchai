"use client";
import { useEffect, useState } from "react";
import { createClient } from "../../../lib/supabase";
import { useRouter } from "next/navigation";

export default function ActivityFeed() {
  const [outputs, setOutputs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => { fetchActivity(); }, []);

  const fetchActivity = async () => {
    const { data } = await supabase
      .from("agent_outputs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    setOutputs(data || []);
    setLoading(false);
  };

  const agentIcons = {
    strategy: "🧠", code: "💻", design: "🎨", marketing: "📣",
    sales: "💰", support: "🎧", finance: "📊", growth: "🔍",
    report: "📋", deploy: "🚀", security: "🔐", outreach: "📬"
  };

  const agentMessages = {
    strategy: "generated a 30-day launch strategy",
    code: "wrote and reviewed code",
    design: "created brand guidelines",
    marketing: "generated social media content",
    sales: "wrote cold email sequences",
    support: "answered a customer query",
    finance: "generated P&L report from Razorpay",
    growth: "found market opportunities via Tavily",
    report: "sent weekly summary email",
    deploy: "ran pre-deploy checklist",
    security: "completed security scan",
    outreach: "wrote personalised outreach messages"
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const filtered = filter === "all" ? outputs : outputs.filter(o => o.agent === filter);

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
        .content { padding: 2rem; max-width: 800px; margin: 0 auto; }
        .page-title { font-family: 'Bebas Neue', cursive; font-size: 2rem; letter-spacing: 0.03em; color: #fff; margin-bottom: 0.3rem; }
        .page-sub { font-size: 0.85rem; color: #6b7280; margin-bottom: 1.5rem; }
        .filters { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1.5rem; }
        .filter-btn { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); color: #6b7280; padding: 0.35rem 0.85rem; border-radius: 100px; font-size: 0.78rem; cursor: pointer; font-family: 'Space Grotesk', sans-serif; transition: all 0.2s; }
        .filter-btn:hover { border-color: rgba(124,58,237,0.3); color: #a78bfa; }
        .filter-btn.active { background: rgba(124,58,237,0.15); border-color: rgba(124,58,237,0.4); color: #a78bfa; }
        .feed { display: flex; flex-direction: column; gap: 0; }
        .feed-item { display: flex; gap: 1rem; padding: 1rem 0; border-bottom: 0.5px solid rgba(255,255,255,0.05); position: relative; }
        .feed-item:last-child { border-bottom: none; }
        .feed-line { position: absolute; left: 19px; top: 48px; bottom: -1px; width: 1px; background: rgba(255,255,255,0.05); }
        .feed-icon { width: 38px; height: 38px; border-radius: 10px; background: rgba(124,58,237,0.15); border: 1px solid rgba(124,58,237,0.2); display: flex; align-items: center; justify-content: center; font-size: 1.1rem; flex-shrink: 0; z-index: 1; }
        .feed-right { flex: 1; }
        .feed-main { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: 0.3rem; }
        .feed-text { font-size: 0.88rem; color: #d1d5db; line-height: 1.5; }
        .feed-agent { color: #a78bfa; font-weight: 500; }
        .feed-time { font-size: 0.75rem; color: #4b5563; white-space: nowrap; flex-shrink: 0; }
        .feed-status { display: inline-block; font-size: 0.68rem; padding: 1px 7px; border-radius: 100px; }
        .s-completed { background: rgba(34,197,94,0.12); border: 1px solid rgba(34,197,94,0.25); color: #4ade80; }
        .s-pending { background: rgba(234,179,8,0.12); border: 1px solid rgba(234,179,8,0.25); color: #fbbf24; }
        .s-sent { background: rgba(59,130,246,0.12); border: 1px solid rgba(59,130,246,0.25); color: #60a5fa; }
        .s-posted { background: rgba(16,185,129,0.12); border: 1px solid rgba(16,185,129,0.25); color: #34d399; }
        .refresh-btn { background: none; border: 1px solid rgba(255,255,255,0.08); color: #6b7280; padding: 0.35rem 0.85rem; border-radius: 100px; font-size: 0.78rem; cursor: pointer; font-family: 'Space Grotesk', sans-serif; transition: all 0.2s; }
        .refresh-btn:hover { border-color: rgba(124,58,237,0.3); color: #a78bfa; }
        .top-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; }
        .section-title { font-size: 0.75rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: #7c3aed; }
        .count-badge { font-size: 0.75rem; color: #6b7280; }
        .empty-state { background: rgba(124,58,237,0.05); border: 1px dashed rgba(124,58,237,0.2); border-radius: 16px; padding: 3rem; text-align: center; color: #4b5563; font-size: 0.88rem; line-height: 1.8; }
      `}</style>

      <nav className="nav">
        <div className="logo">Launch<em>AI</em></div>
        <button className="back-btn" onClick={() => router.push("/dashboard")}>← Back to Dashboard</button>
      </nav>

      <div className="content">
        <div className="page-title">Activity Feed ⚡</div>
        <div className="page-sub">Everything your 12 agents did — latest first</div>

        {/* FILTERS */}
        <div className="filters">
          <button className={`filter-btn ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>
            All ({outputs.length})
          </button>
          {["strategy","code","design","marketing","sales","support","finance","growth","report","deploy","security","outreach"].map(agent => {
            const count = outputs.filter(o => o.agent === agent).length;
            if (count === 0) return null;
            return (
              <button key={agent} className={`filter-btn ${filter === agent ? "active" : ""}`} onClick={() => setFilter(agent)}>
                {agentIcons[agent]} {agent} ({count})
              </button>
            );
          })}
        </div>

        <div className="top-row">
          <span className="section-title">Recent activity</span>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <span className="count-badge">{filtered.length} events</span>
            <button className="refresh-btn" onClick={fetchActivity}>↻ Refresh</button>
          </div>
        </div>

        {loading ? (
          <div style={{ color: "#6b7280", fontSize: "0.85rem" }}>Loading activity...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            No activity yet — go to any agent page and click Run.<br />
            Every agent run will show up here in real time.<br /><br />
            <span style={{ color: "#a78bfa" }}>Tip: Run the Growth or Finance agent first — they work live right now without Anthropic credits!</span>
          </div>
        ) : (
          <div className="feed">
            {filtered.map((o, index) => (
              <div className="feed-item" key={o.id}>
                {index < filtered.length - 1 && <div className="feed-line" />}
                <div className="feed-icon">{agentIcons[o.agent] || "🤖"}</div>
                <div className="feed-right">
                  <div className="feed-main">
                    <div className="feed-text">
                      <span className="feed-agent">{o.agent} agent</span> {agentMessages[o.agent] || "ran successfully"}
                      <span style={{ marginLeft: "0.5rem" }} className={`feed-status ${o.status === "completed" ? "s-completed" : o.status === "sent" ? "s-sent" : o.status === "posted" ? "s-posted" : "s-pending"}`}>
                        {o.status}
                      </span>
                    </div>
                    <div className="feed-time">{timeAgo(o.created_at)}</div>
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#4b5563" }}>
                    {new Date(o.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    {o.client_id && o.client_id !== "test" && <span style={{ marginLeft: "0.5rem", color: "#7c3aed" }}>· client: {o.client_id}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}