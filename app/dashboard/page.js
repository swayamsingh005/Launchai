"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();

  useEffect(() => {
    // In real app, check auth
  }, []);

  return (
    <main style={{ minHeight: "100vh", padding: "2rem" }}>
      <h1>Dashboard</h1>
      <p>This is a placeholder dashboard page.</p>
    </main>
  );
}