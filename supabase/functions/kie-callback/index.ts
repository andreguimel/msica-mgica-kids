import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing Supabase config");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const payload = await req.json();
    console.log("Kie.ai callback received:", JSON.stringify(payload).substring(0, 1000));

    // Try to get internalId (UUID) from query params first
    const url = new URL(req.url);
    const internalId = url.searchParams.get("internalId");
    let taskId = url.searchParams.get("taskId") || payload.data?.taskId;

    // Skip intermediate callbacks (text, first) - only process "complete"
    const callbackType = payload.data?.callbackType;
    if (callbackType && callbackType !== "complete") {
      console.log(`Skipping intermediate callback type: ${callbackType}`);
      return new Response(JSON.stringify({ status: "skipped", callbackType }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const status = payload.code === 200 ? "completed" : "failed";

    if (!internalId && !taskId) {
      console.error("No internalId or taskId in callback");
      return new Response(JSON.stringify({ status: "error", message: "No task identifier" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let audioUrl: string | null = null;
    let errorMessage: string | null = null;

    if (status === "completed") {
      // Extract audio URL from the callback data
      const songs = payload.data?.data;
      if (Array.isArray(songs) && songs.length > 0) {
        audioUrl = songs[0].audio_url || songs[0].audioUrl || null;
      }

      if (!audioUrl) {
        console.error("No audio URL in completed callback:", JSON.stringify(payload.data));
        errorMessage = "No audio URL in response";
      }
    } else {
      errorMessage = payload.msg || "Generation failed";
    }

    const updateColumn = internalId ? "id" : "task_id";
    const updateValue = internalId || taskId;

    console.log(`Updating task by ${updateColumn}=${updateValue}: status=${audioUrl ? "completed" : "failed"}, audioUrl=${audioUrl}`);

    const { error: dbError } = await supabase
      .from("music_tasks")
      .update({
        status: audioUrl ? "completed" : "failed",
        audio_url: audioUrl,
        error_message: errorMessage,
      })
      .eq(updateColumn, updateValue);

    if (dbError) {
      console.error("DB update error:", dbError);
      return new Response(JSON.stringify({ status: "error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ status: "received" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("kie-callback error:", e);
    return new Response(
      JSON.stringify({ status: "error", message: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
