"use client";
import { useEffect, useState } from "react";
import { createClient } from "../../../../lib/supabase";
import { useRouter } from "next/navigation";

export default function SalesAgent() {
  const [outputs, setOutputs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [leads, setLeads] = useState("");
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => { fetchOutputs(); }, []);

  const fetchOutputs = async () => {
    const { data } = await supabase
      .from("agent_outputs")
      .select("*")
      .eq("agent", "sales")
      .order("created_at", { ascending: false })
      .limit(10);
    setOutputs(data || []);
    setLoading(false);
  };

  const runAgent = async (auto_send = false) => {
    setRunning(true);
    try {
      // Parse leads from textarea — format: Name, Email, Company (one per line)
      const parsedLeads = leads.trim() ? leads.split("\n").map(line => {
        const [name, email, company] = line.split(",").map(s => s.trim());
        return { name, email, company };
      }).filter(l => l.email) : [];

      const res = await fetch("/api/sales-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_name: "LaunchAI",
          target_audience: "Early stage founders",
          leads: parsedLeads,
          client_id: "test",
          auto_send
        })
      });
      const data = await res.json();
      if (data.success) { await fetchOutputs(); setLeads(""); }
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
        .input-section { margin-bottom: 2rem; }
        .input-label { font-size: 0.78rem; color: #6b7280; margin-bottom: 0.5rem; display: block; }
        .leads-input { width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #f0eeff; padding: 0.75rem 1rem; border-radius: 10px; font-size: 0.85rem; font-family: 'Space Grotesk', sans-serif; outline: none; resize: vertical; min-height: 100px; }
        .leads-input:focus { border-color: rgba(124,58,237,0.5); }
        .leads-input::placeholder { color: #4b5563; }
        .btn-row { display: flex; gap: 0.5rem; margin-top: 0.75rem; }
        .run-btn { background: linear-gradient(135deg, #7c3aed, #5b21b6); border: none; color: #fff; padding: 0.6rem 1.25rem; border-radius: 10px; font-size: 0.85rem; cursor: pointer; font-family: 'Space Grotesk', sans-serif; font-weight: 500; transition: all 0.2s; }
        .run-btn:hover { opacity: 0.85; }
        .run-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .send-btn { background: linear-gradient(135deg, #059669, #047857); border: none; color: #fff; padding: 0.6rem 1.25rem; border-radius: 10px; font-size: 0.85rem; cursor: pointer; font-family: 'Space Grotesk', sans-serif; font-weight: 500; transition: all 0.2s; }
        .send-btn:hover { opacity: 0.85; }
        .send-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .section-title { font-size: 0.75rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: #7c3aed; margin-bottom: 1rem; }
        .output-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 1.25rem 1.5rem; margin-bottom: 1rem; }
        .output-time { font-size: 0.75rem; color: #4b5563; margin-bottom: 0.75rem; }
        .output-status { display: inline-block; font-size: 0.7rem; padding: 2px 8px; border-radius: 100px; background: rgba(34,197,94,0.15); border: 1px solid rgba(34,197,94,0.3); color: #4ade80; margin-left: 0.5rem; }
        .output-content { font-size: 0.85rem; color: #d1d5db; line-height: 1.7; white-space: pre-wrap; }
        .empty-state { background: rgba(124,58,237,0.05); border: 1px dashed rgba(124,58,237,0.2); border-radius: 16px; padding: 3rem; text-align: center; color: #4b5563; font-size: 0.88rem; line-height: 1.6; }
        .hint { font-size: 0.75rem; color: #4b5563; margin-top: 0.4rem; }
      `}</style>

      <nav className="nav">
        <div className="logo">Launch<em>AI</em></div>
        <button className="back-btn" onClick={() => router.push("/dashboard")}>← Back to Dashboard</button>
      </nav>

      <div className="content">
        <div className="agent-header">
          <div className="agent-icon-big">💰</div>
          <div>
            <div className="agent-title">Sales Agent</div>
            <div className="agent-desc">Writes personalised cold emails for each lead — approve then send via Resend</div>
          </div>
        </div>

        <div className="input-section">
          <label className="input-label">Paste your leads — one per line: Name, Email, Company</label>
          <textarea
            className="leads-input"
            placeholder={"Rahul Sharma, rahul@techstartup.com, TechStartup\nPriya Patel, priya@growthco.com, GrowthCo"}
            value={leads}
            onChange={e => setLeads(e.target.value)}
          />
          <p className="hint">Leave empty to use sample leads for testing</p>
          <div className="btn-row">
            <button className="run-btn" onClick={() => runAgent(false)} disabled={running}>
              {running ? "Running..." : "▶ Generate Emails"}
            </button>
            <button className="send-btn" onClick={() => runAgent(true)} disabled={running}>
              📧 Generate + Send
            </button>
          </div>
        </div>

        <p className="section-title">Activity log — last 10 runs</p>

        {loading ? (
          <div style={{ color: "#6b7280", fontSize: "0.85rem" }}>Loading activity...</div>
        ) : outputs.length === 0 ? (
          <div className="empty-state">
            No activity yet — paste leads above and click Generate.<br />
            Use "Generate + Send" to send emails automatically via Resend.
          </div>
        ) : (
          outputs.map(o => (
            <div className="output-card" key={o.id}>
              <div className="output-time">
                {new Date(o.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                <span className="output-status">{o.status}</span>
              </div>
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