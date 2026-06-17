import { NextResponse } from "next/server";

// Cost reference per agent (rough INR estimate per run, used for tracking only)
const AGENT_COST_ESTIMATE = {
  strategy: 8,
  code: 12,
  design: 6,
  marketing: 4,
  sales: 8,
  support: 3,
  finance: 4,
  growth: 6,
  report: 8,
  outreach: 6,
  deploy: 5,
  security: 6,
};

/**
 * Checks if a client can run an agent based on their monthly limit + extra credits.
 * Call this at the top of every agent route, right after auth check.
 *
 * Usage:
 *   const limitCheck = await checkUsageLimit(supabase, user.id, client_id, "marketing");
 *   if (!limitCheck.allowed) {
 *     return NextResponse.json({ error: limitCheck.message, limitReached: true }, { status: 429 });
 *   }
 */
export async function checkUsageLimit(supabase, userId, clientId, agent) {
  // Fetch the client's current plan + usage
  const { data: client, error } = await supabase
    .from("clients")
    .select("monthly_limit, runs_used_this_month, extra_credits, plan")
    .eq("user_id", userId)
    .single();

  if (error || !client) {
    // No client row yet (e.g. founder testing) — allow it, default behavior
    return { allowed: true, remaining: null };
  }

  const totalAvailable = client.monthly_limit + (client.extra_credits || 0);
  const used = client.runs_used_this_month || 0;

  if (used >= totalAvailable) {
    return {
      allowed: false,
      message: `You've used all ${totalAvailable} runs this month on the ${client.plan} plan. Buy more credits or upgrade your plan to continue.`,
      remaining: 0,
      plan: client.plan,
    };
  }

  return {
    allowed: true,
    remaining: totalAvailable - used,
    plan: client.plan,
  };
}

/**
 * Logs the usage after a successful agent run and increments the counter.
 * Call this AFTER the agent successfully completes its work.
 *
 * Usage:
 *   await logUsage(supabase, user.id, client_id, "marketing", estimatedTokens);
 */
export async function logUsage(supabase, userId, clientId, agent, tokensUsed = 0) {
  const costInr = AGENT_COST_ESTIMATE[agent] || 5;

  // Insert usage record
  await supabase.from("usage_tracking").insert([
    {
      user_id: userId,
      client_id: clientId,
      agent,
      tokens_used: tokensUsed,
      cost_inr: costInr,
    },
  ]);

  // Increment the client's monthly counter
  // First check if they're using extra_credits (over their base limit) or still within monthly_limit
  const { data: client } = await supabase
    .from("clients")
    .select("monthly_limit, runs_used_this_month, extra_credits")
    .eq("user_id", userId)
    .single();

  if (client) {
    const newRunsUsed = (client.runs_used_this_month || 0) + 1;
    let newExtraCredits = client.extra_credits || 0;

    // If they've gone past the monthly_limit, deduct from extra_credits instead
    if (newRunsUsed > client.monthly_limit && newExtraCredits > 0) {
      newExtraCredits = Math.max(0, newExtraCredits - 1);
    }

    await supabase
      .from("clients")
      .update({
        runs_used_this_month: newRunsUsed,
        extra_credits: newExtraCredits,
      })
      .eq("user_id", userId);
  }
}

/**
 * Standard response helper for when limit is reached.
 */
export function limitReachedResponse(message, plan) {
  return NextResponse.json(
    {
      error: message,
      limitReached: true,
      plan,
    },
    { status: 429 }
  );
}