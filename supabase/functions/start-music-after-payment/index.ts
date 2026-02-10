import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const themeStyles: Record<string, string> = {
  animais: "children's music, cheerful, playful, cute, acoustic guitar",
  princesas: "children's music, magical, fairy tale, gentle, harp, flute",
  "super-herois": "children's music, heroic, energetic, upbeat, drums, brass",
  espaco: "children's music, cosmic, dreamy, synth, electronic, wonder",
  natureza: "children's music, peaceful, folk, acoustic, birds chirping",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { taskId } = await req.json();

    const KIE_API_KEY = Deno.env.get("KIE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!KIE_API_KEY) throw new Error("KIE_API_KEY not configured");
    if (!SUPABASE_URL) throw new Error("SUPABASE_URL not configured");
    if (!SUPABASE_SERVICE_ROLE_KEY) throw new Error("SUPABASE_SERVICE_ROLE_KEY not configured");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch the task
    const { data: task, error: fetchError } = await supabase
      .from("music_tasks")
      .select("*")
      .eq("id", taskId)
      .single();

    if (fetchError || !task) {
      return new Response(
        JSON.stringify({ error: "Task not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate status
    if (task.status !== "awaiting_payment") {
      return new Response(
        JSON.stringify({ error: `Invalid task status: ${task.status}. Expected awaiting_payment.` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send lyrics to Kie.ai
    const style = themeStyles[task.theme] || themeStyles.animais;
    const callBackUrl = `${SUPABASE_URL}/functions/v1/kie-callback`;

    console.log("Sending to Kie.ai after payment...");

    const kieResponse = await fetch("https://api.kie.ai/api/v1/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${KIE_API_KEY}`,
      },
      body: JSON.stringify({
        prompt: task.lyrics,
        customMode: true,
        instrumental: false,
        model: "V4",
        callBackUrl,
        style,
        title: task.child_name,
      }),
    });

    const kieData = await kieResponse.json();
    console.log("Kie.ai response:", JSON.stringify(kieData));

    if (!kieResponse.ok || kieData.code !== 200) {
      // Update task as failed
      await supabase
        .from("music_tasks")
        .update({ status: "failed", error_message: `Kie.ai error: ${kieData.msg || kieResponse.status}` })
        .eq("id", taskId);

      throw new Error(`Kie.ai error: ${kieData.msg || kieResponse.status}`);
    }

    const kieTaskId = kieData.data?.taskId;

    // Update task to processing with Kie task ID
    const { error: updateError } = await supabase
      .from("music_tasks")
      .update({ status: "processing", task_id: kieTaskId || null })
      .eq("id", taskId);

    if (updateError) {
      console.error("DB update error:", updateError);
      throw new Error("Failed to update task status");
    }

    return new Response(
      JSON.stringify({ success: true, kieTaskId }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("start-music-after-payment error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro ao iniciar geração" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
