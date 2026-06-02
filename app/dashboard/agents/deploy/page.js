"use client";
import { useEffect, useState } from "react";
import { createClient } from "../../../../lib/supabase";
import { useRouter } from "next/navigation";

export default function DeployAgent() {
  const [outputs, setOutputs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [description, setDescription] = useState("");
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => { fetchOutputs(); }, []);

  const fetchOutputs = async () => {
    const { data } = await supabase
      .from("agent_outputs")
      .select("*")
      .eq("agent", "deploy")
      .order("created_at", { ascending: false })
      .limit(10);
    setOutputs(data || []);
    setLoading(false);
  };

  const runAgent = async () => {
    if (!description.trim()) return;
    setRunning(true);
    try {
      const res = await fetch("/api/deploy-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description,
          tech_stack: "Next.js, Supabase, Vercel",
          client_id: "test"
        })
      });
      const data = await res.json();
      if (data.success) { await fetchOutputs(); setDescription(""); }
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
        .input-row { display: flex; gap: 0.75rem; margin-bottom: 2rem; }
        .desc-input { flex: 1; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #f0eeff; padding: 0.75rem 1rem; border-radius: 10px; font-size: 0.88rem; font-family: 'Space Grotesk', sans-serif; outline: none; }
        .desc-input:focus { border-color: rgba(124,58,237,0.5); }
        .desc-input::placeholder { color: #4b5563; }
        .run-btn { background: linear-gradient(135deg, #7c3aed, #5b21b6); border: none; color: #fff; padding: 0.6rem 1.5rem; border-radius: 10px; font-size: 0.85rem; cursor: pointer; font-family: 'Space Grotesk', sans-serif; font-weight: 500; transition: all 0.2s; white-space: nowrap; }
        .run-btn:hover { opacity: 0.85; }
        .run-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .section-title { font-size: 0.75rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: #7c3aed; margin-bottom: 1rem; }
        .output-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 1.25rem 1.5rem; margin-bottom: 1rem; }
        .output-time { font-size: 0.75rem; color: #4b5563; margin-bottom: 0.75rem; }
        .output-status { display: inline-block; font-size: 0.7rem; padding: 2px 8px; border-radius: 100px; background: rgba(34,197,94,0.15); border: 1px solid rgba(34,197,94,0.3); color: #4ade80; margin-left: 0.5rem; }
        .checklist { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1rem; }
        .check-item { display: flex; align-items: center; gap: 0.75rem; font-size: 0.85rem; padding: 0.5rem 0.75rem; border-radius: 8px; background: rgba(255,255,255,0.02); }
        .check-pass { color: #4ade80; }
        .check-manual { color: #fbbf24; }
        .check-fail { color: #f87171; }
        .sub-label { font-size: 0.72rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #7c3aed; margin-bottom: 0.5rem; margin-top: 0.75rem; }
        .warning-item { font-size: 0.82rem; color: #fbbf24; padding: 0.3rem 0; line-height: 1.5; }
        .empty-state { background: rgba(124,58,237,0.05); border: 1px dashed rgba(124,58,237,0.2); border-radius: 16px; padding: 3rem; text-align: center; color: #4b5563; font-size: 0.88rem; line-height: 1.6; }
        .ready-badge { display: inline-block; font-size: 0.7rem; padding: 2px 8px; border-radius: 100px; background: rgba(34,197,94,0.15); border: 1px solid rgba(34,197,94,0.3); color: #4ade80; margin-left: 0.5rem; }
      `}</style>

      <nav className="nav">
        <div className="logo">Launch<em>AI</em></div>
        <button className="back-btn" onClick={() => router.push("/dashboard")}>← Back to Dashboard</button>
      </nav>

      <div className="content">
        <div className="agent-header">
          <div className="agent-icon-big">🚀</div>
          <div>
            <div className="agent-title">Deploy Agent</div>
            <div className="agent-desc">Reviews your code before deploy — pre-deploy checklist, warnings and rollback plan</div>
          </div>
        </div>

        <div className="input-row">
          <input
            className="desc-input"
            placeholder="Describe what you're deploying e.g. Added new payment flow and agent pages..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            onKeyDown={e => e.key === "Enter" && runAgent()}
          />
          <button className="run-btn" onClick={runAgent} disabled={running || !description.trim()}>
            {running ? "Reviewing..." : "▶ Review"}
          </button>
        </div>

        <p className="section-title">Activity log — last 10 reviews</p>

        {loading ? (
          <div style={{ color: "#6b7280", fontSize: "0.85rem" }}>Loading activity...</div>
        ) : outputs.length === 0 ? (
          <div className="empty-state">
            No activity yet — describe what you're deploying and click Review.<br />
            Agent will give you a pre-deploy checklist before you push to production.
          </div>
        ) : (
          outputs.map(o => (
            <div className="output-card" key={o.id}>
              <div className="output-time">
                {new Date(o.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                <span className="output-status">{o.status}</span>
                {o.output?.ready_to_deploy && <span className="ready-badge">✓ Ready to deploy</span>}
              </div>
              <div className="sub-label">Pre-deploy Checklist</div>
              <div className="checklist">
                {(o.output?.pre_deploy_checklist || []).map((item, i) => (
                  <div className="check-item" key={i}>
                    <span className={item.status === "passed" ? "check-pass" : item.status === "check_manually" ? "check-manual" : "check-fail"}>
                      {item.status === "passed" ? "✅" : item.status === "check_manually" ? "⚠️" : "❌"}
                    </span>
                    <span style={{ color: "#d1d5db" }}>{item.item}</span>
                  </div>
                ))}
              </div>
              {o.output?.warnings?.length > 0 && (
                <>
                  <div className="sub-label">Warnings</div>
                  {o.output.warnings.map((w, i) => (
                    <div className="warning-item" key={i}>⚠ {w}</div>
                  ))}
                </>
              )}
            </div>
          ))
        )}
      </div>
    </main>
  );
}