"use client";
import { useEffect, useState } from "react";
import { createClient } from "../../lib/supabase";
import { useRouter } from "next/navigation";

export default function AdminPanel() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState([]);
  const [waitlist, setWaitlist] = useState([]);
  const [agentOutputs, setAgentOutputs] = useState([]);
  const [stats, setStats] = useState({ totalClients: 0, totalRevenue: 0, waitlistCount: 0, agentRuns: 0 });
  const router = useRouter();
  const supabase = createClient();

  // Your email — only this email can access admin
  const ADMIN_EMAIL = "swayamsingh855@gmail.com";

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      if (user.email !== ADMIN_EMAIL) { router.push("/dashboard"); return; }
      setUser(user);
      await fetchAllData();
      setLoading(false);
    };
    load();
  }, []);

  const fetchAllData = async () => {
    // Fetch all clients
    const { data: clientsData } = await supabase
      .from("clients")
      .select("*")
      .order("created_at", { ascending: false });

    // Fetch waitlist
    const { data: waitlistData } = await supabase
      .from("waitlist")
      .select("*")
      .order("created_at", { ascending: false });

    // Fetch agent outputs
    const { data: outputsData } = await supabase
      .from("agent_outputs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    const clientsList = clientsData || [];
    const waitlistList = waitlistData || [];
    const outputsList = outputsData || [];

    setClients(clientsList);
    setWaitlist(waitlistList);
    setAgentOutputs(outputsList);
    setStats({
      totalClients: clientsList.filter(c => c.status === "active").length,
      totalRevenue: clientsList.filter(c => c.status === "active").length * 30000,
      waitlistCount: waitlistList.length,
      agentRuns: outputsList.length
    });
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#08061a", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#a78bfa", fontFamily: "'Space Grotesk', sans-serif" }}>Loading admin panel...</div>
    </div>
  );

  return (
    <main style={{ minHeight: "100vh", background: "#08061a", color: "#f0eeff", fontFamily: "'Space Grotesk', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600&family=Bebas+Neue&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .nav { display: flex; align-items: center; justify-content: space-between; padding: 1.1rem 2rem; background: rgba(8,6,26,0.9); border-bottom: 1px solid rgba(124,58,237,0.15); position: sticky; top: 0; z-index: 100; backdrop-filter: blur(16px); }
        .logo { font-family: 'Bebas Neue', cursive; font-size: 1.6rem; letter-spacing: 0.05em; }
        .logo em { color: #a78bfa; font-style: normal; }
        .admin-badge { font-size: 0.72rem; padding: 2px 10px; border-radius: 100px; background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.3); color: #f87171; margin-left: 0.75rem; vertical-align: middle; }
        .back-btn { background: none; border: 1px solid rgba(255,255,255,0.1); color: #9ca3af; padding: 0.4rem 1rem; border-radius: 100px; font-size: 0.82rem; cursor: pointer; font-family: 'Space Grotesk', sans-serif; transition: all 0.2s; }
        .back-btn:hover { border-color: rgba(167,139,250,0.4); color: #a78bfa; }
        .content { padding: 2rem; max-width: 1200px; margin: 0 auto; }
        .page-title { font-family: 'Bebas Neue', cursive; font-size: 2rem; letter-spacing: 0.03em; color: #fff; margin-bottom: 0.3rem; }
        .page-sub { font-size: 0.85rem; color: #6b7280; margin-bottom: 2rem; }
        .stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 2rem; }
        .stat-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 1.25rem 1.5rem; }
        .stat-label { font-size: 0.75rem; color: #6b7280; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 0.5rem; }
        .stat-value { font-family: 'Bebas Neue', cursive; font-size: 2rem; letter-spacing: 0.03em; color: #a78bfa; }
        .stat-sub { font-size: 0.75rem; color: #4b5563; margin-top: 0.25rem; }
        .section { margin-bottom: 2.5rem; }
        .section-title { font-size: 0.75rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: #7c3aed; margin-bottom: 1rem; }
        .table { width: 100%; border-collapse: collapse; }
        .table th { font-size: 0.72rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #6b7280; padding: 0.6rem 1rem; text-align: left; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .table td { font-size: 0.85rem; color: #d1d5db; padding: 0.8rem 1rem; border-bottom: 1px solid rgba(255,255,255,0.04); }
        .table tr:hover td { background: rgba(255,255,255,0.02); }
        .status-active { display: inline-block; font-size: 0.7rem; padding: 2px 8px; border-radius: 100px; background: rgba(34,197,94,0.15); border: 1px solid rgba(34,197,94,0.3); color: #4ade80; }
        .status-pending { display: inline-block; font-size: 0.7rem; padding: 2px 8px; border-radius: 100px; background: rgba(234,179,8,0.15); border: 1px solid rgba(234,179,8,0.3); color: #fbbf24; }
        .agent-tag { display: inline-block; font-size: 0.7rem; padding: 2px 8px; border-radius: 100px; background: rgba(124,58,237,0.15); border: 1px solid rgba(124,58,237,0.2); color: #a78bfa; }
        .empty { font-size: 0.85rem; color: #4b5563; padding: 2rem; text-align: center; background: rgba(255,255,255,0.02); border-radius: 12px; }
        .table-wrap { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; overflow: hidden; }
        .agent-grid-mini { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem; }
        .agent-stat { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 0.75rem 1rem; text-align: center; }
        .agent-stat-name { font-size: 0.75rem; color: #6b7280; margin-bottom: 0.3rem; }
        .agent-stat-count { font-family: 'Bebas Neue', cursive; font-size: 1.4rem; color: #a78bfa; }
        @media (max-width: 768px) { .stats-row { grid-template-columns: repeat(2, 1fr); } .agent-grid-mini { grid-template-columns: repeat(2, 1fr); } .content { padding: 1.25rem; } }
      `}</style>

      <nav className="nav">
        <div className="logo">Launch<em>AI</em> <span className="admin-badge">ADMIN</span></div>
        <button className="back-btn" onClick={() => router.push("/dashboard")}>← Back to Dashboard</button>
      </nav>

      <div className="content">
        <div className="page-title">Admin Panel 🛡️</div>
        <div className="page-sub">Full business overview — only visible to you · {user?.email}</div>

        {/* STATS */}
        <div className="stats-row">
          <div className="stat-card">
            <p className="stat-label">Active Clients</p>
            <p className="stat-value">{stats.totalClients}</p>
            <p className="stat-sub">Paying ₹30,000/mo each</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Total Revenue</p>
            <p className="stat-value">₹{stats.totalRevenue.toLocaleString('en-IN')}</p>
            <p className="stat-sub">This month</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Waitlist</p>
            <p className="stat-value">{stats.waitlistCount}</p>
            <p className="stat-sub">People waiting to join</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Agent Runs</p>
            <p className="stat-value">{stats.agentRuns}</p>
            <p className="stat-sub">Total outputs generated</p>
          </div>
        </div>

        {/* AGENT ACTIVITY BREAKDOWN */}
        <div className="section">
          <p className="section-title">Agent activity breakdown</p>
          <div className="agent-grid-mini">
            {["strategy","code","design","marketing","sales","support","finance","growth","report","deploy","security","outreach"].map(agent => {
              const count = agentOutputs.filter(o => o.agent === agent).length;
              const icons = { strategy:"🧠", code:"💻", design:"🎨", marketing:"📣", sales:"💰", support:"🎧", finance:"📊", growth:"🔍", report:"📋", deploy:"🚀", security:"🔐", outreach:"📬" };
              return (
                <div className="agent-stat" key={agent}>
                  <div className="agent-stat-name">{icons[agent]} {agent}</div>
                  <div className="agent-stat-count">{count}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ALL CLIENTS */}
        <div className="section">
          <p className="section-title">All clients ({clients.length})</p>
          <div className="table-wrap">
            {clients.length === 0 ? (
              <div className="empty">No clients yet — share launchai-vert.vercel.app to get your first client</div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Revenue</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map(c => (
                    <tr key={c.id}>
                      <td>{c.email}</td>
                      <td><span className={c.status === "active" ? "status-active" : "status-pending"}>{c.status}</span></td>
                      <td style={{ color: "#4ade80" }}>₹{c.status === "active" ? "30,000" : "0"}/mo</td>
                      <td style={{ color: "#6b7280" }}>{new Date(c.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* WAITLIST */}
        <div className="section">
          <p className="section-title">Waitlist ({waitlist.length})</p>
          <div className="table-wrap">
            {waitlist.length === 0 ? (
              <div className="empty">No waitlist signups yet</div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Signed up</th>
                  </tr>
                </thead>
                <tbody>
                  {waitlist.map(w => (
                    <tr key={w.id}>
                      <td>{w.name || "—"}</td>
                      <td>{w.email}</td>
                      <td style={{ color: "#6b7280" }}>{new Date(w.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* RECENT AGENT OUTPUTS */}
        <div className="section">
          <p className="section-title">Recent agent outputs ({agentOutputs.length})</p>
          <div className="table-wrap">
            {agentOutputs.length === 0 ? (
              <div className="empty">No agent runs yet — go to an agent page and click Run</div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Agent</th>
                    <th>Status</th>
                    <th>Client</th>
                    <th>Run at</th>
                  </tr>
                </thead>
                <tbody>
                  {agentOutputs.map(o => (
                    <tr key={o.id}>
                      <td><span className="agent-tag">{o.agent}</span></td>
                      <td><span className={o.status === "completed" || o.status === "sent" ? "status-active" : "status-pending"}>{o.status}</span></td>
                      <td style={{ color: "#6b7280" }}>{o.client_id || "—"}</td>
                      <td style={{ color: "#6b7280" }}>{new Date(o.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}