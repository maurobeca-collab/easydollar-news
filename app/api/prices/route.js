import { getSupabaseAdmin } from "../../../../lib/supabaseAdmin";

// Body: { code, stageId?, data?, currentStage?, status? }
export async function POST(req) {
  let body;
  try { body = await req.json(); } catch { return Response.json({ error: "Bad request" }, { status: 400 }); }
  const { code, stageId, data, currentStage, status } = body || {};
  if (!code) return Response.json({ error: "Missing code" }, { status: 400 });

  const sb = getSupabaseAdmin();

  // Validate the code → resolve the starter (never trust an id from the client).
  const { data: starter, error: e1 } = await sb.from("starters").select("id, status").eq("access_code", code).single();
  if (e1 || !starter) return Response.json({ error: "Not found" }, { status: 404 });

  // Save the stage's data (the starter's own input for the current stage).
  if (stageId && data) {
    const { error } = await sb.from("stage_data").upsert({ starter_id: starter.id, stage_id: stageId, data });
    if (error) return Response.json({ error: error.message }, { status: 500 });
    // First time they touch anything, move them off "invited" so HR sees real activity.
    if (starter.status === "invited" && !status) {
      await sb.from("starters").update({ status: "in_progress" }).eq("id", starter.id);
    }
  }

  // Advance / update status.
  if (typeof currentStage === "number" || status) {
    const patch = {};
    if (typeof currentStage === "number") patch.current_stage = currentStage;
    if (status) patch.status = status;
    if (status === "completed") patch.completed_at = new Date().toISOString();
    const { error } = await sb.from("starters").update(patch).eq("id", starter.id);
    if (error) return Response.json({ error: error.message }, { status: 500 });
    if (status === "completed") {
      await sb.from("audit_log").insert({ starter_id: starter.id, actor: "starter", action: "completed onboarding" });
    }
  }

  // Return the fresh record so the client can re-render from source of truth.
  const { data: fresh } = await sb.rpc("get_starter_by_code", { p_code: code });
  return Response.json(fresh);
}
