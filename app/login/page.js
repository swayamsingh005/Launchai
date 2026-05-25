"use client";
import { createClient } from '../../lib/supabase';
import { useState } from 'react';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const signInWithGoogle = async () => {
    setLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <main style={{
      minHeight: '100vh',
      background: '#08061a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Space Grotesk', sans-serif",
      padding: '1rem',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600&family=Bebas+Neue&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(124,58,237,0.25);
          border-radius: 24px;
          padding: 3rem 2.5rem;
          width: 100%;
          max-width: 420px;
          text-align: center;
          box-shadow: 0 0 80px rgba(124,58,237,0.1);
          position: relative;
          overflow: hidden;
        }
        .card::before {
          content: '';
          position: absolute;
          top: 0; left: 50%; transform: translateX(-50%);
          width: 60%; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(167,139,250,0.6), transparent);
        }
        .glow {
          position: absolute;
          width: 300px; height: 300px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(124,58,237,0.2), transparent 70%);
          top: -150px; left: 50%; transform: translateX(-50%);
          pointer-events: none;
        }
        .logo {
          font-family: 'Bebas Neue', cursive;
          font-size: 2rem;
          letter-spacing: 0.05em;
          color: #fff;
          margin-bottom: 0.5rem;
          position: relative;
          z-index: 1;
        }
        .logo em { color: #a78bfa; font-style: normal; }
        .tagline {
          font-size: 0.85rem;
          color: #6b7280;
          margin-bottom: 2.5rem;
          position: relative;
          z-index: 1;
        }
        .title {
          font-size: 1.4rem;
          font-weight: 600;
          color: #f0eeff;
          margin-bottom: 0.5rem;
          position: relative;
          z-index: 1;
        }
        .subtitle {
          font-size: 0.88rem;
          color: #9ca3af;
          margin-bottom: 2rem;
          line-height: 1.6;
          position: relative;
          z-index: 1;
        }
        .google-btn {
          width: 100%;
          background: #fff;
          color: #111;
          border: none;
          padding: 0.9rem 1.5rem;
          border-radius: 12px;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          transition: all 0.2s;
          font-family: 'Space Grotesk', sans-serif;
          position: relative;
          z-index: 1;
        }
        .google-btn:hover {
          background: #f3f4f6;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(255,255,255,0.15);
        }
        .google-btn:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }
        .google-icon {
          width: 20px; height: 20px;
        }
        .divider {
          display: flex; align-items: center; gap: 1rem;
          margin: 1.5rem 0;
          position: relative; z-index: 1;
        }
        .divider-line { flex: 1; height: 1px; background: rgba(255,255,255,0.08); }
        .divider-text { font-size: 0.78rem; color: #4b5563; }
        .footer-text {
          font-size: 0.75rem;
          color: #4b5563;
          margin-top: 1.5rem;
          line-height: 1.6;
          position: relative; z-index: 1;
        }
      `}</style>

      <div className="card">
        <div className="glow" />
        <div className="logo">Launch<em>AI</em></div>
        <p className="tagline">Idea In. Company Out.</p>
        <h1 className="title">Welcome back</h1>
        <p className="subtitle">Sign in to access your AI-powered company dashboard and manage your agents.</p>

        <button className="google-btn" onClick={signInWithGoogle} disabled={loading}>
          <svg className="google-icon" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {loading ? 'Signing in...' : 'Continue with Google'}
        </button>

        <p className="footer-text">
          By signing in you agree to our Terms of Service.<br />
          Your AI company is waiting for you.
        </p>
      </div>
    </main>
  );
}