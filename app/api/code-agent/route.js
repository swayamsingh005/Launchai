import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll() {},
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { task, tech_stack, existing_code, client_id } = await request.json();
    // task = what the client wants built
    // tech_stack = their stack (Next.js, Supabase etc)
    // existing_code = optional code snippet for context

    // ─────────────────────────────────────────────────
    // MOCK MODE — replace this block with real Claude API
    // once Anthropic credits are added
    // ─────────────────────────────────────────────────
    await new Promise(r => setTimeout(r, 2000));

    const codeOutput = {
      task,
      solution: {
        explanation: `Here's how to implement "${task}" in ${tech_stack}:`,
        code: `// ${task}
// Tech stack: ${tech_stack}

export default function Feature() {
  // TODO: Replace with real Claude API implementation
  // This is a mock response
  return (
    <div>
      <h1>Feature: ${task}</h1>
      <p>Implementation coming soon...</p>
    </div>
  );
}`,
        files_to_edit: ["pages/index.js", "components/Feature.js"],
        steps: [
          "Create the component file",
          "Import and add to your main page",
          "Test locally with npm run dev",
          "Push to GitHub to deploy"
        ]
      },
      code_review: {
        issues: [],
        suggestions: [
          "Add error boundary around new components",
          "Add loading state for async operations",
          "Make sure to handle mobile responsive layout"
        ]
      },
      estimated_time: "30-45 minutes to implement"
    };
    // ─────────────────────────────────────────────────

    const { data: savedCode, error } = await supabase
      .from("agent_outputs")
      .insert([{
        user_id: user.id,
        client_id,
        agent: "code",
        output: codeOutput,
        status: "completed"
      }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, code: savedCode });
  } catch (err) {
    console.error("Code agent error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}