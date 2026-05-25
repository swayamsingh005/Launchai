"use client";
import { useEffect, useState } from "react";
import { createClient } from "../../lib/supabase";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUser(user);
      setLoading(false);
    };
    getUser();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const agents = [
    { icon: "🧠", name: "Strategy Agent", status: "idle", color: "#7c3aed" },
    { icon: "🎨", name: "Design Agent", status: "idle", color: "#7c3aed" },
    { icon: "💻", name: "Code Agent", status: "idle", color: "#7c3aed" },
    { icon: "📣", name: "Marketing Agent", status: "idle", color: "#7c3aed" },
    { icon: "💰", name: "Sales Agent", status: "idle", color: "#7c3aed" },
    { icon: "🎧", name: "Support Agent", status: "idle", color: "#7c3aed" },
    { icon: "📊", name: "Finance Agent", status: "idle", color: "#7c3aed" },
    { icon: "🔍", name: "Growth Agent", status: "idle", color: "#7c3aed" },
    { icon: "📋", name: "Report Agent", status: "idle", color: "#7c3aed" },
    { icon: "🚀", name: "Deploy Agent", status: "idle", color: "#7c3aed" },
    { icon: "🔐", name: "Security Agent", status: "idle", color: "#7c3aed" },
    { icon: "📬", name: "Outreach Agent", status: "idle", color: "#7c3aed" },
  ];

  const decisions = [
    { id: 1, title: "Approve new client brief", desc: "Riya's yoga studio booking app — review the product brief before build starts.", priority: "high" },
    { id: 2, title: "Confirm pricing strategy", desc: "Marketing Agent suggests running a 20% launch discount. Approve?", priority: "medium" },
    { id: 3, title: "Review weekly report", desc: "Your company performance report for Week 1 is ready.", priority: "low" },
  ];

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#08061a", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#a78bfa", fontFamily: "'Space Grotesk', sans-serif", fontSize: "1rem" }}>Loading your dashboard...</div>
    </div>
  );

  return (
    <main style={{ minHeight: "100vh", background: "#08061a", color: "#f0eeff", fontFamily: "'Space Grotesk', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600&family=Bebas+Neue&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #08061a; }
        .nav {
          display: flex; align-items: center; justify-content: space-between;
          padding: 1.1rem 2rem;
          background: rgba(8,6,26,0.9);
          border-bottom: 1px solid rgba(124,58,237,0.15);
          position: sticky; top: 0; z-index: 100;
          backdrop-filter: blur(16px);
        }
        .logo { font-family: 'Bebas Neue', cursive; font-size: 1.6rem; letter-spacing: 0.05em; }
        .logo em { color: #a78bfa; font-style: normal; }
        .nav-right { display: flex; align-items: center; gap: 1rem; }
        .user-pill {
          display: flex; align-items: center; gap: 0.5rem;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          padding: 0.4rem 1rem; border-radius: 100px; font-size: 0.82rem; color: #9ca3af;
        }
        .avatar { width: 24px; height: 24px; border-radius: 50%; background: #7c3aed; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; color: #fff; font-weight: 600; }
        .sign-out {
          background: none; border: 1px solid rgba(255,255,255,0.1);
          color: #6b7280; padding: 0.4rem 1rem; border-radius: 100px;
          font-size: 0.82rem; cursor: pointer; font-family: 'Space Grotesk', sans-serif;
          transition: all 0.2s;
        }
        .sign-out:hover { border-color: rgba(239,68,68,0.4); color: #ef4444; }
        .content { padding: 2rem; max-width: 1200px; margin: 0 auto; }
        .greeting { margin-bottom: 2rem; }
        .greeting h1 { font-family: 'Bebas Neue', cursive; font-size: 2.2rem; letter-spacing: 0.03em; color: #fff; margin-bottom: 0.3rem; }
        .greeting p { font-size: 0.88rem; color: #6b7280; }
        .stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 2rem; }
        .stat-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px; padding: 1.25rem 1.5rem;
        }
        .stat-label { font-size: 0.75rem; color: #6b7280; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 0.5rem; }
        .stat-value { font-family: 'Bebas Neue', cursive; font-size: 2rem; letter-spacing: 0.03em; color: #a78bfa; }
        .stat-sub { font-size: 0.75rem; color: #4b5563; margin-top: 0.25rem; }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem; }
        .section-title { font-size: 0.75rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: #7c3aed; margin-bottom: 1rem; }
        .decisions { display: flex; flex-direction: column; gap: 0.75rem; }
        .decision {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px; padding: 1rem 1.25rem;
          display: flex; justify-content: space-between; align-items: center;
          gap: 1rem;
        }
        .decision-left {}
        .decision-title { font-size: 0.9rem; font-weight: 500; color: #f0eeff; margin-bottom: 0.25rem; }
        .decision-desc { font-size: 0.8rem; color: #6b7280; line-height: 1.4; }
        .decision-btns { display: flex; gap: 0.5rem; flex-shrink: 0; }
        .btn-yes { background: rgba(34,197,94,0.15); border: 1px solid rgba(34,197,94,0.3); color: #4ade80; padding: 0.35rem 0.9rem; border-radius: 8px; font-size: 0.8rem; cursor: pointer; font-family: 'Space Grotesk', sans-serif; font-weight: 500; transition: all 0.15s; }
        .btn-yes:hover { background: rgba(34,197,94,0.25); }
        .btn-no { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.25); color: #f87171; padding: 0.35rem 0.9rem; border-radius: 8px; font-size: 0.8rem; cursor: pointer; font-family: 'Space Grotesk', sans-serif; font-weight: 500; transition: all 0.15s; }
        .btn-no:hover { background: rgba(239,68,68,0.2); }
        .priority-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; margin-top: 4px; }
        .agents-panel {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 20px; padding: 1.5rem;
        }
        .agents-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem; }
        .agent-row {
          display: flex; align-items: center; gap: 0.75rem;
          padding: 0.6rem 0.75rem;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 10px;
        }
        .agent-ico { font-size: 1rem; width: 32px; height: 32px; background: rgba(124,58,237,0.15); border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .agent-name { font-size: 0.8rem; font-weight: 500; color: #d1d5db; flex: 1; }
        .agent-status { font-size: 0.68rem; padding: 2px 7px; border-radius: 100px; background: rgba(107,114,128,0.2); color: #6b7280; border: 1px solid rgba(107,114,128,0.2); }
        .empty-state {
          background: rgba(124,58,237,0.05);
          border: 1px dashed rgba(124,58,237,0.2);
          border-radius: 16px; padding: 2rem; text-align: center;
          color: #4b5563; font-size: 0.88rem; line-height: 1.6;
        }
        @media (max-width: 768px) {
          .stats-row { grid-template-columns: repeat(2, 1fr); }
          .grid-2 { grid-template-columns: 1fr; }
          .agents-grid { grid-template-columns: 1fr; }
          .content { padding: 1.25rem; }
        }
      `}</style>

      {/* NAV */}
      <nav className="nav">
        <div className="logo">Launch<em>AI</em></div>
        <div className="nav-right">
          <div className="user-pill">
            <div className="avatar">{user?.email?.[0]?.toUpperCase()}</div>
            {user?.email}
          </div>
          <button className="sign-out" onClick={signOut}>Sign out</button>
        </div>
      </nav>

      <div className="content">
        {/* GREETING */}
        <div className="greeting">
          <h1>Good morning, Swayam 👋</h1>
          <p>Here's what's happening at LaunchAI today — {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>

        {/* STATS */}
        <div className="stats-row">
          <div className="stat-card">
            <p className="stat-label">Total Clients</p>
            <p className="stat-value">0</p>
            <p className="stat-sub">Waiting for first client</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Monthly Revenue</p>
            <p className="stat-value">₹0</p>
            <p className="stat-sub">Target: ₹30,000</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">AI Agents</p>
            <p className="stat-value">12</p>
            <p className="stat-sub">All ready to deploy</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Decisions Pending</p>
            <p className="stat-value">3</p>
            <p className="stat-sub">Needs your review</p>
          </div>
        </div>

        <div className="grid-2">
          {/* DECISIONS QUEUE */}
          <div>
            <p className="section-title">Decisions queue — needs your yes/no</p>
            <div className="decisions">
              {decisions.map(d => (
                <div className="decision" key={d.id}>
                  <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                    <div className="priority-dot" style={{ background: d.priority === "high" ? "#f87171" : d.priority === "medium" ? "#fbbf24" : "#6b7280" }} />
                    <div className="decision-left">
                      <p className="decision-title">{d.title}</p>
                      <p className="decision-desc">{d.desc}</p>
                    </div>
                  </div>
                  <div className="decision-btns">
                    <button className="btn-yes">Yes</button>
                    <button className="btn-no">No</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AGENTS */}
          <div>
            <p className="section-title">Your 12 AI agents</p>
            <div className="agents-panel">
              <div className="agents-grid">
                {agents.map(a => (
                  <div className="agent-row" key={a.name}>
                    <div className="agent-ico">{a.icon}</div>
                    <span className="agent-name">{a.name}</span>
                    <span className="agent-status">Idle</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CLIENTS */}
        <div>
          <p className="section-title">Active clients</p>
          <div className="empty-state">
            No clients yet — your first client will appear here once they sign up and submit their idea.<br />
            Share your waitlist link to get started: <strong style={{ color: "#a78bfa" }}>launchai-vert.vercel.app</strong>
          </div>
        </div>
      </div>
    </main>
  );
}