"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../lib/supabase";

export default function Home() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const move = (e) => { setMouseX(e.clientX); setMouseY(e.clientY); };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  const handleWaitlist = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("waitlist")
        .insert([{ name, email }]);
      if (error) throw error;
      setSubmitted(true);
    } catch (err) {
      if (err.code === "23505") {
        alert("This email is already on the waitlist!");
      } else {
        alert("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const scrollToWaitlist = () => {
    document.getElementById("waitlist-form")?.scrollIntoView({ behavior: "smooth" });
  };

  const agents = [
    { icon: "🧠", name: "Strategy Agent", desc: "Plans your entire product — features, pricing, go-to-market" },
    { icon: "🎨", name: "Design Agent", desc: "Creates your brand, logo, and full UI automatically" },
    { icon: "💻", name: "Code Agent", desc: "Writes and deploys your product in 48 hours" },
    { icon: "📣", name: "Marketing Agent", desc: "Posts content daily, runs ads, grows your audience" },
    { icon: "💰", name: "Sales Agent", desc: "Finds customers, sends outreach, closes deals" },
    { icon: "🎧", name: "Support Agent", desc: "Answers every customer query 24/7 instantly" },
    { icon: "📊", name: "Finance Agent", desc: "Tracks revenue, sends invoices, weekly P&L reports" },
    { icon: "🔍", name: "Growth Agent", desc: "Monitors competitors, spots new market opportunities" },
    { icon: "📋", name: "Report Agent", desc: "Sends crisp daily company summary every morning" },
    { icon: "🚀", name: "Deploy Agent", desc: "Launches products live with zero downtime automatically" },
    { icon: "🔐", name: "Security Agent", desc: "Monitors threats and keeps your product protected" },
    { icon: "📬", name: "Outreach Agent", desc: "Sends personalised cold emails and follows up daily" },
  ];

  const steps = [
    { num: "01", title: "Submit Your Idea", desc: "Describe your business in plain English. No tech skills needed. Just your vision." },
    { num: "02", title: "AI Builds It", desc: "12 agents build your product, brand, website and launch plan in 48 hours." },
    { num: "03", title: "AI Runs It", desc: "Daily marketing, sales, support and finance — all handled. You only make final calls." },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Bebas+Neue&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: #050312; color: #f0eeff; font-family: 'Inter', sans-serif; overflow-x: hidden; }

        .cursor-glow {
          position: fixed; pointer-events: none; z-index: 999;
          width: 400px; height: 400px; border-radius: 50%;
          background: radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%);
          transform: translate(-50%, -50%);
          transition: left 0.1s, top 0.1s;
        }

        /* NAV */
        .nav {
          display: flex; align-items: center; justify-content: space-between;
          padding: 1.2rem 3rem; position: sticky; top: 0; z-index: 100;
          background: rgba(5,3,18,0.85); backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(124,58,237,0.12);
        }
        .logo { font-family: 'Bebas Neue', cursive; font-size: 1.9rem; letter-spacing: 0.06em; color: #fff; }
        .logo em { color: #a78bfa; font-style: normal; }
        .nav-right { display: flex; align-items: center; gap: 0.75rem; }
        .nav-signin {
          background: transparent; color: #a78bfa;
          border: 1px solid rgba(124,58,237,0.4);
          padding: 0.5rem 1.25rem; border-radius: 100px;
          font-size: 0.85rem; font-weight: 500; cursor: pointer;
          font-family: 'Inter', sans-serif; transition: all 0.2s;
        }
        .nav-signin:hover { background: rgba(124,58,237,0.1); border-color: #7c3aed; }
        .nav-cta {
          background: linear-gradient(135deg, #7c3aed, #5b21b6);
          color: #fff; border: none; padding: 0.55rem 1.5rem;
          border-radius: 100px; font-size: 0.85rem; font-weight: 600;
          cursor: pointer; font-family: 'Inter', sans-serif;
          transition: all 0.2s; box-shadow: 0 4px 20px rgba(124,58,237,0.3);
        }
        .nav-cta:hover { transform: translateY(-1px); box-shadow: 0 6px 28px rgba(124,58,237,0.45); }

        /* HERO */
        .hero {
          position: relative; min-height: 100vh;
          display: flex; flex-direction: column; align-items: center;
          justify-content: center; text-align: center;
          padding: 6rem 1.5rem 4rem; overflow: hidden;
        }
        .hero::before {
          content: '';
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(124,58,237,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(124,58,237,0.06) 1px, transparent 1px);
          background-size: 60px 60px;
          mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%);
        }
        .hero-glow1 {
          position: absolute; width: 900px; height: 600px; border-radius: 50%;
          background: radial-gradient(circle, rgba(109,40,217,0.35) 0%, transparent 65%);
          top: -200px; left: 50%; transform: translateX(-50%); pointer-events: none;
        }
        .hero-glow2 {
          position: absolute; width: 500px; height: 500px; border-radius: 50%;
          background: radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 65%);
          bottom: -100px; left: -100px; pointer-events: none;
        }
        .hero-glow3 {
          position: absolute; width: 400px; height: 400px; border-radius: 50%;
          background: radial-gradient(circle, rgba(167,139,250,0.15) 0%, transparent 65%);
          bottom: 0; right: -50px; pointer-events: none;
        }
        .orb {
          position: absolute; border-radius: 50%; pointer-events: none;
          animation: float 6s ease-in-out infinite;
        }
        .orb1 {
          width: 80px; height: 80px; top: 15%; left: 8%;
          background: radial-gradient(circle at 35% 35%, #a78bfa, #4c1d95);
          box-shadow: 0 20px 60px rgba(124,58,237,0.5), inset 0 -10px 20px rgba(0,0,0,0.3);
          animation-delay: 0s;
        }
        .orb2 {
          width: 50px; height: 50px; top: 25%; right: 10%;
          background: radial-gradient(circle at 35% 35%, #c4b5fd, #7c3aed);
          box-shadow: 0 15px 40px rgba(124,58,237,0.4), inset 0 -6px 15px rgba(0,0,0,0.3);
          animation-delay: 2s;
        }
        .orb3 {
          width: 120px; height: 120px; bottom: 20%; right: 8%;
          background: radial-gradient(circle at 35% 35%, #8b5cf6, #3730a3);
          box-shadow: 0 25px 70px rgba(124,58,237,0.45), inset 0 -15px 25px rgba(0,0,0,0.35);
          animation-delay: 1s;
        }
        .orb4 {
          width: 35px; height: 35px; bottom: 30%; left: 12%;
          background: radial-gradient(circle at 35% 35%, #e9d5ff, #7c3aed);
          box-shadow: 0 10px 30px rgba(167,139,250,0.5), inset 0 -5px 10px rgba(0,0,0,0.25);
          animation-delay: 3s;
        }
        @keyframes float {
          0%,100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-18px) rotate(3deg); }
          66% { transform: translateY(-8px) rotate(-2deg); }
        }
        .hero-ring {
          position: absolute; border-radius: 50%; pointer-events: none;
          border: 1px solid rgba(124,58,237,0.2); animation: spin 20s linear infinite;
        }
        .ring1 { width: 500px; height: 500px; top: 50%; left: 50%; transform: translate(-50%,-50%); }
        .ring2 { width: 750px; height: 750px; top: 50%; left: 50%; transform: translate(-50%,-50%); border-color: rgba(124,58,237,0.1); animation-duration: 35s; animation-direction: reverse; }
        @keyframes spin { from { transform: translate(-50%,-50%) rotate(0deg); } to { transform: translate(-50%,-50%) rotate(360deg); } }

        .hero-content { position: relative; z-index: 2; }
        .badge {
          display: inline-flex; align-items: center; gap: 0.5rem;
          background: rgba(124,58,237,0.1); border: 1px solid rgba(124,58,237,0.3);
          padding: 0.4rem 1.2rem; border-radius: 100px;
          font-size: 0.78rem; color: #c4b5fd; margin-bottom: 2.5rem;
          font-weight: 500; letter-spacing: 0.03em;
        }
        .badge-dot { width: 6px; height: 6px; border-radius: 50%; background: #a78bfa; animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(167,139,250,0.5)} 50%{opacity:0.6;box-shadow:0 0 0 6px rgba(167,139,250,0)} }

        .h1 {
          font-family: 'Bebas Neue', cursive;
          font-size: clamp(4.5rem, 12vw, 9rem);
          line-height: 0.92; letter-spacing: 0.03em;
          color: #ffffff; margin-bottom: 1.5rem;
          text-shadow: 0 0 80px rgba(124,58,237,0.4);
        }
        .h1 .purple {
          color: #a78bfa;
          text-shadow: 0 0 60px rgba(167,139,250,0.6), 0 0 120px rgba(124,58,237,0.3);
        }
        .hero-p {
          font-size: 1.05rem; color: #9ca3af; max-width: 500px;
          margin: 0 auto 3rem; line-height: 1.8; font-weight: 400;
        }

        .form { display: flex; flex-direction: column; gap: 0.75rem; max-width: 380px; margin: 0 auto 3.5rem; }
        .inp {
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1);
          color: #fff; padding: 0.9rem 1.2rem; border-radius: 12px;
          font-size: 0.95rem; font-family: 'Inter', sans-serif; outline: none; transition: all 0.2s;
        }
        .inp:focus { border-color: #7c3aed; background: rgba(124,58,237,0.08); box-shadow: 0 0 0 3px rgba(124,58,237,0.15); }
        .inp::placeholder { color: #4b5563; }
        .btn {
          background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%);
          color: #fff; border: none; padding: 0.95rem; border-radius: 12px;
          font-size: 0.95rem; font-weight: 600; cursor: pointer; transition: all 0.25s;
          font-family: 'Inter', sans-serif; box-shadow: 0 8px 24px rgba(124,58,237,0.35);
        }
        .btn:hover { transform: translateY(-2px); box-shadow: 0 14px 36px rgba(124,58,237,0.5); }
        .btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        .success {
          background: rgba(124,58,237,0.1); border: 1px solid rgba(124,58,237,0.3);
          border-radius: 20px; padding: 2.5rem; max-width: 380px; margin: 0 auto 3.5rem;
          text-align: center;
        }
        .success h3 { font-family: 'Bebas Neue', cursive; font-size: 1.8rem; color: #c4b5fd; letter-spacing: 0.05em; margin-bottom: 0.5rem; }
        .success p { color: #9ca3af; font-size: 0.9rem; }
        .success-login {
          margin-top: 1.25rem;
          background: linear-gradient(135deg, #7c3aed, #5b21b6);
          color: #fff; border: none; padding: 0.75rem 1.75rem;
          border-radius: 100px; font-size: 0.88rem; font-weight: 600;
          cursor: pointer; font-family: 'Inter', sans-serif;
          box-shadow: 0 4px 20px rgba(124,58,237,0.35); transition: all 0.2s;
        }
        .success-login:hover { transform: translateY(-1px); box-shadow: 0 8px 28px rgba(124,58,237,0.5); }

        .stats { display: flex; justify-content: center; gap: 3rem; flex-wrap: wrap; }
        .stat { text-align: center; }
        .stat-n { font-family: 'Bebas Neue', cursive; font-size: 3rem; color: #a78bfa; letter-spacing: 0.03em; text-shadow: 0 0 30px rgba(167,139,250,0.5); }
        .stat-l { font-size: 0.7rem; color: #6b7280; letter-spacing: 0.1em; text-transform: uppercase; margin-top: 0.2rem; }

        /* SECTIONS */
        .sep { height: 1px; background: linear-gradient(90deg, transparent, rgba(124,58,237,0.2), transparent); margin: 0 3rem; }
        .sec { padding: 7rem 2rem; max-width: 1100px; margin: 0 auto; }
        .sec-center { text-align: center; }
        .tag { font-size: 0.7rem; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; color: #7c3aed; margin-bottom: 1rem; }
        .sec-h { font-family: 'Bebas Neue', cursive; font-size: clamp(2.8rem, 6vw, 5rem); letter-spacing: 0.03em; line-height: 0.95; margin-bottom: 1rem; color: #fff; text-shadow: 0 0 60px rgba(124,58,237,0.25); }
        .sec-p { color: #9ca3af; font-size: 1rem; max-width: 480px; line-height: 1.75; }

        /* STEPS */
        .steps { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin-top: 3.5rem; }
        .step {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 24px; padding: 2.5rem 2rem;
          transition: all 0.3s; position: relative; overflow: hidden;
        }
        .step::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(167,139,250,0.4), transparent);
          opacity: 0; transition: opacity 0.3s;
        }
        .step:hover { border-color: rgba(124,58,237,0.3); transform: translateY(-6px); background: rgba(124,58,237,0.05); box-shadow: 0 20px 60px rgba(124,58,237,0.1); }
        .step:hover::before { opacity: 1; }
        .step-n { font-family: 'Bebas Neue', cursive; font-size: 5rem; color: rgba(124,58,237,0.2); line-height: 1; margin-bottom: 1.5rem; letter-spacing: 0.03em; }
        .step-t { font-size: 1.1rem; font-weight: 600; margin-bottom: 0.6rem; color: #fff; }
        .step-d { color: #9ca3af; font-size: 0.88rem; line-height: 1.7; }

        /* AGENTS */
        .agents-wrap { margin-top: 3.5rem; }
        .agents-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .agent {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px; padding: 1.25rem 1.5rem;
          display: flex; gap: 1rem; align-items: flex-start;
          transition: all 0.25s; position: relative; overflow: hidden;
        }
        .agent::after {
          content: ''; position: absolute; inset: 0; border-radius: 16px;
          background: linear-gradient(135deg, rgba(124,58,237,0.08) 0%, transparent 60%);
          opacity: 0; transition: opacity 0.25s;
        }
        .agent:hover { border-color: rgba(124,58,237,0.35); transform: translateY(-3px); box-shadow: 0 12px 40px rgba(124,58,237,0.12); }
        .agent:hover::after { opacity: 1; }
        .a-ico {
          width: 42px; height: 42px; border-radius: 10px; flex-shrink: 0;
          background: linear-gradient(135deg, rgba(124,58,237,0.3), rgba(76,29,149,0.3));
          border: 1px solid rgba(124,58,237,0.3);
          display: flex; align-items: center; justify-content: center; font-size: 1.15rem;
          box-shadow: 0 4px 12px rgba(124,58,237,0.2); position: relative; z-index: 1;
        }
        .a-name { font-size: 0.88rem; font-weight: 600; margin-bottom: 0.25rem; color: #e9d5ff; position: relative; z-index: 1; }
        .a-desc { color: #6b7280; font-size: 0.8rem; line-height: 1.5; position: relative; z-index: 1; }

        /* PRICING */
        .price-outer { position: relative; max-width: 520px; margin: 3.5rem auto 0; }
        .price-ring {
          position: absolute; inset: -20px; border-radius: 36px;
          border: 1px solid rgba(124,58,237,0.15);
          animation: spin 25s linear infinite;
        }
        .price-card {
          background: linear-gradient(135deg, rgba(124,58,237,0.1) 0%, rgba(76,29,149,0.06) 100%);
          border: 1px solid rgba(124,58,237,0.3);
          border-radius: 28px; padding: 3.5rem; text-align: center;
          position: relative; overflow: hidden;
          box-shadow: 0 0 100px rgba(124,58,237,0.12), inset 0 1px 0 rgba(255,255,255,0.08);
        }
        .price-card::before {
          content: ''; position: absolute; top: 0; left: 50%; transform: translateX(-50%);
          width: 70%; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(167,139,250,0.7), transparent);
        }
        .price-card::after {
          content: ''; position: absolute; bottom: -60px; right: -60px;
          width: 200px; height: 200px; border-radius: 50%;
          background: radial-gradient(circle, rgba(124,58,237,0.2), transparent 70%);
          pointer-events: none;
        }
        .price-num { font-family: 'Bebas Neue', cursive; font-size: 5.5rem; color: #c4b5fd; letter-spacing: 0.02em; line-height: 1; text-shadow: 0 0 40px rgba(167,139,250,0.5); position: relative; z-index: 1; }
        .price-mo { font-size: 0.88rem; color: #6b7280; margin-bottom: 1.25rem; position: relative; z-index: 1; }
        .price-desc { color: #9ca3af; font-size: 0.9rem; margin-bottom: 2rem; line-height: 1.7; max-width: 340px; margin-left: auto; margin-right: auto; position: relative; z-index: 1; }
        .perks { list-style: none; text-align: left; display: flex; flex-direction: column; gap: 0.85rem; margin-bottom: 2.5rem; position: relative; z-index: 1; }
        .perk { display: flex; gap: 0.85rem; align-items: center; font-size: 0.88rem; color: #d1d5db; }
        .perk-dot { width: 18px; height: 18px; border-radius: 50%; background: rgba(124,58,237,0.2); border: 1px solid rgba(124,58,237,0.4); display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 0.6rem; color: #a78bfa; }

        /* FOOTER */
        .footer {
          padding: 1.75rem 3rem; border-top: 1px solid rgba(255,255,255,0.05);
          display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;
        }
        .f-logo { font-family: 'Bebas Neue', cursive; font-size: 1.4rem; letter-spacing: 0.06em; }
        .f-logo em { color: #a78bfa; font-style: normal; }
        .f-copy { font-size: 0.78rem; color: #374151; }
        .f-signin {
          background: transparent; color: #a78bfa; border: 1px solid rgba(124,58,237,0.3);
          padding: 0.4rem 1rem; border-radius: 100px; font-size: 0.78rem;
          cursor: pointer; font-family: 'Inter', sans-serif; transition: all 0.2s;
        }
        .f-signin:hover { background: rgba(124,58,237,0.1); }

        @media (max-width: 600px) {
          .agents-grid { grid-template-columns: 1fr; }
          .nav { padding: 1rem 1.25rem; }
          .stats { gap: 1.5rem; }
          .footer { padding: 1.5rem; }
        }
      `}</style>

      {/* CURSOR GLOW */}
      <div className="cursor-glow" style={{ left: mouseX, top: mouseY }} />

      {/* NAV */}
      <nav className="nav">
        <div className="logo">Launch<em>AI</em></div>
        <div className="nav-right">
          <button className="nav-signin" onClick={() => router.push("/login")}>Sign In</button>
          <button className="nav-cta" onClick={scrollToWaitlist}>Join Waitlist →</button>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-glow1" /><div className="hero-glow2" /><div className="hero-glow3" />
        <div className="hero-ring ring1" /><div className="hero-ring ring2" />
        <div className="orb orb1" /><div className="orb orb2" /><div className="orb orb3" /><div className="orb orb4" />

        <div className="hero-content">
          <div className="badge"><span className="badge-dot" />Now accepting early access applications</div>
          <h1 className="h1">Idea In.<br /><span className="purple">Company Out.</span></h1>
          <p className="hero-p">Describe your business idea. Our 12 AI agents build your product, launch it, and run it every day — marketing, sales, support and all. You just say yes or no.</p>

          <div id="waitlist-form">
            {submitted ? (
              <div className="success">
                <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🚀</div>
                <h3>You're on the list!</h3>
                <p>We'll reach out with early access soon. Welcome to the future of business.</p>
                <button className="success-login" onClick={() => router.push("/login")}>
                  Sign In to Your Account →
                </button>
              </div>
            ) : (
              <form className="form" onSubmit={handleWaitlist}>
                <input className="inp" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} required />
                <input className="inp" type="email" placeholder="Your email address" value={email} onChange={e => setEmail(e.target.value)} required />
                <button className="btn" type="submit" disabled={loading}>{loading ? "Joining..." : "Get Early Access →"}</button>
              </form>
            )}
          </div>

          <div className="stats">
            {[["48H", "To build your product"], ["12", "AI agents working"], ["0", "Employees needed"], ["₹0", "Salary cost ever"]].map(([n, l]) => (
              <div className="stat" key={l}>
                <div className="stat-n">{n}</div>
                <div className="stat-l">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="sep" />

      {/* HOW IT WORKS */}
      <div className="sec">
        <p className="tag">How it works</p>
        <h2 className="sec-h">Three steps.<br />One AI company.</h2>
        <p className="sec-p">What used to need 20 people and 6 months — now happens in 48 hours, fully automated.</p>
        <div className="steps">
          {steps.map(s => (
            <div className="step" key={s.num}>
              <div className="step-n">{s.num}</div>
              <div className="step-t">{s.title}</div>
              <div className="step-d">{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="sep" />

      {/* AGENTS */}
      <div className="sec">
        <p className="tag">Your AI team</p>
        <h2 className="sec-h">12 agents.<br />Zero salaries.</h2>
        <p className="sec-p">Every department of a real company — run by AI 24/7. No hiring. No managing. No office.</p>
        <div className="agents-wrap">
          <div className="agents-grid">
            {agents.map(a => (
              <div className="agent" key={a.name}>
                <div className="a-ico">{a.icon}</div>
                <div>
                  <div className="a-name">{a.name}</div>
                  <div className="a-desc">{a.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="sep" />

      {/* PRICING */}
      <div className="sec sec-center">
        <p className="tag">Pricing</p>
        <h2 className="sec-h">One plan.<br />Everything included.</h2>
        <p className="sec-p" style={{ margin: "0 auto" }}>No hidden fees. No per-agent pricing. One flat monthly fee.</p>
        <div className="price-outer">
          <div className="price-card">
            <div className="price-num">₹30,000</div>
            <div className="price-mo">per month · cancel anytime</div>
            <p className="price-desc">Your complete AI company — built, launched, and operated every single day by 12 AI agents.</p>
            <ul className="perks">
              {[
                "Product built and launched in 48 hours",
                "Complete brand + website included",
                "Daily marketing content on autopilot",
                "AI sales agent finds & closes customers",
                "24/7 AI customer support",
                "Weekly business performance reports",
                "You only make the final decisions"
              ].map(p => (
                <li className="perk" key={p}>
                  <span className="perk-dot">✓</span>{p}
                </li>
              ))}
            </ul>
            <button className="btn" style={{ width: "100%", position: "relative", zIndex: 1 }} onClick={scrollToWaitlist}>
              Join the Waitlist →
            </button>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="footer">
        <div className="f-logo">Launch<em>AI</em></div>
        <div className="f-copy">© 2026 LaunchAI · Built by AI. Run by AI.</div>
        <button className="f-signin" onClick={() => router.push("/login")}>Sign In →</button>
      </footer>
    </>
  );
}