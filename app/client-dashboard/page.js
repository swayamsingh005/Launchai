"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase";

export default function ClientDashboard() {
  const [user, setUser] = useState(null);
  const [client, setClient] = useState(null);
  const [brief, setBrief] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUser(user);

      const { data: clientData } = await supabase
        .from("clients")
        .select("*")
        .eq("user_id", user.id)
        .single();
      setClient(clientData);

      const { data: briefData } = await supabase
        .from("briefs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      setBrief(briefData);
      setLoading(false);
    };
    load();
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  const agents = [
    { icon: "🧠", name: "Strategy Agent", status: "Active" },
    { icon: "🎨", name: "Design Agent", status: "Active" },
    { icon: "💻", name: "Code Agent", status: "Working" },
    { icon: "📣", name: "Marketing Agent", status: "Active" },
    { icon: "💰", name: "Sales Agent", status: "Active" },
    { icon: "🎧", name: "Support Agent", status: "Active" },
    { icon: "📊", name: "Finance Agent", status: "Idle" },
    { icon: "🔍", name: "Growth Agent", status: "Idle" },
    { icon: "📋", name: "Report Agent", status: "Idle" },
    { icon: "🚀", name: "Deploy Agent", status: "Working" },
    { icon: "🔐", name: "Security Agent", status: "Active" },
    { icon: "📬", name: "Outreach Agent", status: "Idle" },
  ];

  const statusColor = {
    "Active": "#1D9E75",
    "Working": "#7c3aed",
    "Idle": "#374151"
  };

  if (loading) return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Bebas+Neue&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #050312; font-family: 'Inter', sans-serif; }
        .loading { min-height: 100vh; display: flex; align-items: center; justify-content: center; }
        .spinner { width: 40px; height: 40px; border: 3px solid rgba(124,58,237,0.2); border-top-color: #7c3aed; border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
      <div className="loading"><div className="spinner" /></div>
    </>
  );

  const firstName = user?.user_metadata?.full_name?.split(" ")[0] ||
    user?.email?.split("@")[0] || "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Bebas+Neue&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #050312; color: #f0eeff; font-family: 'Inter', sans-serif; min-height: 100vh; }

        .nav { display: flex; align-items: center; justify-content: space-between; padding: 1.2rem 2rem; border-bottom: 1px solid rgba(124,58,237,0.12); background: rgba(5,3,18,0.9); backdrop-filter: blur(20px); position: sticky; top: 0; z-index: 100; }
        .logo { font-family: 'Bebas Neue', cursive; font-size: 1.6rem; letter-spacing: 0.06em; color: #fff; }
        .logo em { color: #a78bfa; font-style: normal; }
        .nav-right { display: flex; align-items: center; gap: 1rem; }
        .user-pill { display: flex; align-items: center; gap: 0.5rem; background: rgba(124,58,237,0.1); border: 1px solid rgba(124,58,237,0.2); padding: 0.4rem 1rem; border-radius: 100px; font-size: 0.8rem; color: #c4b5fd; }
        .avatar { width: 24px; height: 24px; border-radius: 50%; background: linear-gradient(135deg, #7c3aed, #5b21b6); display: flex; align-items: center; justify-content: center; font-size: 11px; color: #fff; font-weight: 600; }
        .signout-btn { background: transparent; border: 1px solid rgba(255,255,255,0.1); color: #6b7280; padding: 0.4rem 1rem; border-radius: 100px; font-size: 0.78rem; cursor: pointer; font-family: 'Inter', sans-serif; transition: all 0.2s; }
        .signout-btn:hover { border-color: rgba(255,255,255,0.2); color: #fff; }

        .page { padding: 2.5rem 2rem; max-width: 1100px; margin: 0 auto; }

        .greeting { margin-bottom: 2.5rem; }
        .greeting-text { font-family: 'Bebas Neue', cursive; font-size: clamp(2rem, 5vw, 3.2rem); letter-spacing: 0.05em; color: #fff; display: flex; align-items: center; gap: 0.75rem; }
        .greeting-sub { font-size: 0.88rem; color: #6b7280; margin-top: 0.4rem; }

        .product-banner { background: linear-gradient(135deg, rgba(124,58,237,0.15), rgba(76,29,149,0.08)); border: 1px solid rgba(124,58,237,0.3); border-radius: 20px; padding: 1.5rem 2rem; margin-bottom: 2rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; }
        .product-info { }
        .product-label { font-size: 0.65rem; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; color: #7c3aed; margin-bottom: 0.4rem; }
        .product-name { font-family: 'Bebas Neue', cursive; font-size: 2rem; color: #fff; letter-spacing: 0.03em; }
        .product-desc { font-size: 0.85rem; color: #9ca3af; margin-top: 0.3rem; max-width: 500px; }
        .active-pill { background: rgba(29,158,117,0.15); border: 1px solid rgba(29,158,117,0.3); color: #1D9E75; font-size: 0.75rem; font-weight: 600; padding: 0.4rem 1rem; border-radius: 100px; display: flex; align-items: center; gap: 0.4rem; }
        .active-dot { width: 6px; height: 6px; border-radius: 50%; background: #1D9E75; animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }

        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
        .stat-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 1.25rem 1.5rem; }
        .stat-label { font-size: 0.68rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #6b7280; margin-bottom: 0.75rem; }
        .stat-value { font-family: 'Bebas Neue', cursive; font-size: 2.2rem; color: #a78bfa; letter-spacing: 0.03em; }
        .stat-sub { font-size: 0.75rem; color: #4b5563; margin-top: 0.3rem; }

        .section-title { font-size: 0.7rem; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; color: #7c3aed; margin-bottom: 1rem; }

        .agents-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 0.75rem; margin-bottom: 2rem; }
        .agent-card { background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 1rem 1.25rem; display: flex; align-items: center; gap: 0.75rem; transition: all 0.2s; }
        .agent-card:hover { border-color: rgba(124,58,237,0.25); background: rgba(124,58,237,0.04); }
        .agent-icon { width: 36px; height: 36px; border-radius: 9px; background: linear-gradient(135deg, rgba(124,58,237,0.25), rgba(76,29,149,0.25)); border: 1px solid rgba(124,58,237,0.2); display: flex; align-items: center; justify-content: center; font-size: 1rem; flex-shrink: 0; }
        .agent-name { font-size: 0.85rem; font-weight: 500; color: #e9d5ff; }
        .agent-status { font-size: 0.7rem; margin-top: 0.2rem; font-weight: 500; }

        .coming-soon { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; padding: 2rem; text-align: center; }
        .cs-icon { font-size: 2.5rem; margin-bottom: 1rem; }
        .cs-title { font-family: 'Bebas Neue', cursive; font-size: 1.5rem; color: #fff; letter-spacing: 0.05em; margin-bottom: 0.5rem; }
        .cs-sub { font-size: 0.85rem; color: #6b7280; line-height: 1.6; }

        @media (max-width: 600px) { .page { padding: 1.5rem 1rem; } .nav { padding: 1rem; } }
      `}</style>

      {/* NAV */}
      <nav className="nav">
        <div className="logo">Launch<em>AI</em></div>
        <div className="nav-right">
          <div className="user-pill">
            <div className="avatar">{firstName[0].toUpperCase()}</div>
            {user?.email}
          </div>
          <button className="signout-btn" onClick={handleSignOut}>Sign out</button>
        </div>
      </nav>

      <div className="page">
        {/* Greeting */}
        <div className="greeting">
          <div className="greeting-text">
            {greeting}, {firstName.toUpperCase()} 👋
          </div>
          <div className="greeting-sub">
            Your AI company is live — here's what's happening today
          </div>
        </div>

        {/* Product Banner */}
        {brief && (
          <div className="product-banner">
            <div className="product-info">
              <div className="product-label">Your AI Company</div>
              <div className="product-name">{brief.product_name}</div>
              <div className="product-desc">{brief.what_it_does}</div>
            </div>
            <div className="active-pill">
              <div className="active-dot" />
              Active
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="stats">
          <div className="stat-card">
            <div className="stat-label">AI Agents</div>
            <div className="stat-value">12</div>
            <div className="stat-sub">All deployed</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Days Running</div>
            <div className="stat-value">1</div>
            <div className="stat-sub">Since activation</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Tasks Done</div>
            <div className="stat-value">0</div>
            <div className="stat-sub">More coming soon</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Plan</div>
            <div className="stat-value" style={{ fontSize: "1.4rem" }}>₹30K</div>
            <div className="stat-sub">per month · active</div>
          </div>
        </div>

        {/* Agents */}
        <div className="section-title">Your 12 AI Agents</div>
        <div className="agents-grid">
          {agents.map(a => (
            <div className="agent-card" key={a.name}>
              <div className="agent-icon">{a.icon}</div>
              <div>
                <div className="agent-name">{a.name}</div>
                <div className="agent-status" style={{ color: statusColor[a.status] }}>
                  {a.status}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Coming Soon */}
        <div className="coming-soon">
          <div className="cs-icon">⚡</div>
          <div className="cs-title">Decisions & Reports Coming Soon</div>
          <div className="cs-sub">
            Your agents are working. Soon you'll see decisions to approve,
            daily reports, and live agent activity right here.
          </div>
        </div>
      </div>
    </>
  );
}