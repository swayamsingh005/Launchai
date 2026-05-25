"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase";

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [idea, setIdea] = useState("");
  const [audience, setAudience] = useState("");
  const [goal, setGoal] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data: existing } = await supabase
        .from("clients")
        .select("id")
        .eq("user_id", user.id)
        .single();
      if (existing) { router.push("/brief"); return; }
      setUser(user);
    };
    checkUser();
  }, []);

  const handleSubmit = async () => {
    if (!idea.trim() || !audience.trim() || !goal.trim()) return;
    setLoading(true);

    try {
      const supabase = createClient();

      setLoadingText("Saving your idea...");
      const { data: clientData, error: clientError } = await supabase
        .from("clients")
        .insert([{
          user_id: user.id,
          email: user.email,
          idea: idea.trim(),
          target_audience: audience.trim(),
          goal: goal.trim(),
          status: "pending"
        }])
        .select()
        .single();

      if (clientError) throw clientError;

      setLoadingText("Intake Agent is reading your idea...");
      await new Promise(r => setTimeout(r, 1000));

      setLoadingText("Generating your product brief...");
      const response = await fetch("/api/intake-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea: idea.trim(),
          target_audience: audience.trim(),
          goal: goal.trim(),
          client_id: clientData.id
        })
      });

      const result = await response.json();
      if (!result.success) throw new Error(result.error);

      setLoadingText("Brief ready! Taking you there...");
      await new Promise(r => setTimeout(r, 800));
      router.push("/brief");

    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
      setLoading(false);
      setLoadingText("");
    }
  };

  const steps = [
    { num: 1, label: "Your idea" },
    { num: 2, label: "Your audience" },
    { num: 3, label: "Your goal" },
  ];

  if (loading) return (
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
        <div className="load-title">Intake Agent Active</div>
        <div className="load-sub">{loadingText}</div>
        <div className="load-note">This takes about 10 seconds...</div>
      </div>
    </>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Bebas+Neue&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #050312; color: #f0eeff; font-family: 'Inter', sans-serif; min-height: 100vh; }

        .page { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2rem 1.5rem; position: relative; overflow: hidden; }
        .bg-glow1 { position: fixed; width: 700px; height: 500px; border-radius: 50%; background: radial-gradient(circle, rgba(109,40,217,0.25) 0%, transparent 65%); top: -150px; left: 50%; transform: translateX(-50%); pointer-events: none; z-index: 0; }
        .bg-glow2 { position: fixed; width: 400px; height: 400px; border-radius: 50%; background: radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 65%); bottom: -100px; right: -100px; pointer-events: none; z-index: 0; }

        .card { background: rgba(255,255,255,0.03); border: 1px solid rgba(124,58,237,0.2); border-radius: 28px; padding: 3rem 2.5rem; width: 100%; max-width: 560px; position: relative; z-index: 1; box-shadow: 0 0 80px rgba(124,58,237,0.08), inset 0 1px 0 rgba(255,255,255,0.06); }

        .logo { font-family: 'Bebas Neue', cursive; font-size: 1.6rem; letter-spacing: 0.06em; color: #fff; text-align: center; margin-bottom: 2.5rem; }
        .logo em { color: #a78bfa; font-style: normal; }

        .progress-track { display: flex; align-items: center; justify-content: center; margin-bottom: 2.5rem; }
        .prog-step { display: flex; flex-direction: column; align-items: center; gap: 6px; }
        .prog-circle { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 500; transition: all 0.3s; border: 1.5px solid rgba(255,255,255,0.1); color: #6b7280; background: rgba(255,255,255,0.03); }
        .prog-circle.active { background: linear-gradient(135deg, #7c3aed, #5b21b6); border-color: #7c3aed; color: #fff; box-shadow: 0 0 20px rgba(124,58,237,0.4); }
        .prog-circle.done { background: rgba(124,58,237,0.2); border-color: rgba(124,58,237,0.4); color: #a78bfa; }
        .prog-label { font-size: 10px; color: #6b7280; letter-spacing: 0.05em; text-transform: uppercase; white-space: nowrap; }
        .prog-label.active { color: #a78bfa; }
        .prog-line { width: 60px; height: 1px; background: rgba(255,255,255,0.08); margin: 0 8px; margin-bottom: 22px; flex-shrink: 0; }
        .prog-line.done { background: rgba(124,58,237,0.4); }

        .step-content { min-height: 200px; }
        .step-tag { font-size: 0.68rem; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; color: #7c3aed; margin-bottom: 0.75rem; }
        .step-title { font-family: 'Bebas Neue', cursive; font-size: 2.2rem; letter-spacing: 0.03em; color: #fff; margin-bottom: 0.5rem; line-height: 1; text-shadow: 0 0 40px rgba(124,58,237,0.3); }
        .step-desc { font-size: 0.88rem; color: #9ca3af; margin-bottom: 1.5rem; line-height: 1.6; }

        .textarea { width: 100%; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 1rem 1.25rem; border-radius: 14px; font-size: 0.95rem; font-family: 'Inter', sans-serif; outline: none; resize: none; transition: all 0.2s; line-height: 1.6; min-height: 120px; }
        .textarea:focus { border-color: #7c3aed; background: rgba(124,58,237,0.06); box-shadow: 0 0 0 3px rgba(124,58,237,0.12); }
        .textarea::placeholder { color: #374151; }

        .example { font-size: 0.78rem; color: #4b5563; margin-top: 0.6rem; font-style: italic; }
        .example span { color: #7c3aed; }

        .btn-row { display: flex; gap: 0.75rem; margin-top: 2rem; align-items: center; }
        .btn-back { background: transparent; border: 1px solid rgba(255,255,255,0.1); color: #9ca3af; padding: 0.85rem 1.5rem; border-radius: 12px; font-size: 0.9rem; cursor: pointer; font-family: 'Inter', sans-serif; transition: all 0.2s; }
        .btn-back:hover { border-color: rgba(255,255,255,0.2); color: #fff; }
        .btn-next { flex: 1; background: linear-gradient(135deg, #7c3aed, #5b21b6); color: #fff; border: none; padding: 0.9rem; border-radius: 12px; font-size: 0.95rem; font-weight: 600; cursor: pointer; font-family: 'Inter', sans-serif; transition: all 0.25s; box-shadow: 0 6px 20px rgba(124,58,237,0.35); }
        .btn-next:hover { transform: translateY(-1px); box-shadow: 0 10px 28px rgba(124,58,237,0.5); }
        .btn-next:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
        .char-count { font-size: 0.72rem; color: #4b5563; text-align: right; margin-top: 0.4rem; }
      `}</style>

      <div className="bg-glow1" /><div className="bg-glow2" />

      <div className="card">
        <div className="logo">Launch<em>AI</em></div>

        <div className="progress-track">
          {steps.map((s, i) => (
            <div key={s.num} style={{ display: "flex", alignItems: "center" }}>
              <div className="prog-step">
                <div className={`prog-circle ${step === s.num ? "active" : step > s.num ? "done" : ""}`}>
                  {step > s.num ? "✓" : s.num}
                </div>
                <div className={`prog-label ${step === s.num ? "active" : ""}`}>{s.label}</div>
              </div>
              {i < steps.length - 1 && <div className={`prog-line ${step > s.num ? "done" : ""}`} />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="step-content">
            <div className="step-tag">Step 1 of 3</div>
            <div className="step-title">What's your idea?</div>
            <div className="step-desc">Describe the business you want to build. Don't overthink it — write like you're explaining to a friend.</div>
            <textarea className="textarea" placeholder="I want to build..." value={idea} onChange={e => setIdea(e.target.value)} maxLength={500} autoFocus />
            <div className="char-count">{idea.length}/500</div>
            <div className="example">e.g. <span>"A yoga studio booking app for small fitness studios in India"</span></div>
            <div className="btn-row">
              <button className="btn-next" onClick={() => setStep(2)} disabled={idea.trim().length < 10}>Next →</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="step-content">
            <div className="step-tag">Step 2 of 3</div>
            <div className="step-title">Who is it for?</div>
            <div className="step-desc">Describe your target customer. The more specific you are, the better our agents can plan for you.</div>
            <textarea className="textarea" placeholder="My target customer is..." value={audience} onChange={e => setAudience(e.target.value)} maxLength={300} autoFocus />
            <div className="char-count">{audience.length}/300</div>
            <div className="example">e.g. <span>"Working women aged 25–40 in Indian metro cities who go to yoga studios"</span></div>
            <div className="btn-row">
              <button className="btn-back" onClick={() => setStep(1)}>← Back</button>
              <button className="btn-next" onClick={() => setStep(3)} disabled={audience.trim().length < 10}>Next →</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="step-content">
            <div className="step-tag">Step 3 of 3</div>
            <div className="step-title">What's your goal?</div>
            <div className="step-desc">What do you want to achieve in the next 30 days? Give our agents a clear target to work towards.</div>
            <textarea className="textarea" placeholder="In 30 days I want to..." value={goal} onChange={e => setGoal(e.target.value)} maxLength={300} autoFocus />
            <div className="char-count">{goal.length}/300</div>
            <div className="example">e.g. <span>"Get 10 paying customers and ₹50,000 in revenue"</span></div>
            <div className="btn-row">
              <button className="btn-back" onClick={() => setStep(2)}>← Back</button>
              <button className="btn-next" onClick={handleSubmit} disabled={goal.trim().length < 10}>Submit & Launch →</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}