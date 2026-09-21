export default function Home() {
  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#f0f0f0" }}>
      <h1 style={{ fontSize: "3rem", marginBottom: "1rem" }}>Welcome to LaunchAI</h1>
      <p style={{ fontSize: "1.2rem", marginBottom: "2rem" }}>Build AI-powered applications with ease.</p>
      <a href="/dashboard" style={{ padding: "0.8rem 1.5rem", background: "#a78bfa", color: "#fff", borderRadius: "8px", textDecoration: "none" }}>Get Started</a>
    </main>
  );
}