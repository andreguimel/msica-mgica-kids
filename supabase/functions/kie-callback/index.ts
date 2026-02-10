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

    // Try to get taskId from query params first, then from payload
    const url = new URL(req.url);
    let taskId = url.searchParams.get("taskId") || payload.data?.taskId;
    
    // If still no taskId, try to find it by matching the song ID in our database
    if (!taskId) {
      const songs = payload.data?.data;
      if (Array.isArray(songs) && songs.length > 0) {
        const songId = songs[0].id;
        if (songId) {
          console.log("No taskId in payload, looking up by song content...");
          // Try to find the task by checking recent processing tasks
          const { data: tasks } = await supabase
            .from("music_tasks")
            .select("task_id")
            .eq("status", "processing")
            .order("created_at", { ascending: false })
            .limit(5);
          
          if (tasks && tasks.length === 1) {
            taskId = tasks[0].task_id;
            console.log("Found single processing task:", taskId);
          } else {
            console.log("Multiple or no processing tasks found, cannot auto-match");
          }
        }
      }
    }

    // Skip intermediate callbacks (text, first) - only process "complete"
    const callbackType = payload.data?.callbackType;
    if (callbackType && callbackType !== "complete") {
      console.log(`Skipping intermediate callback type: ${callbackType}`);
      return new Response(JSON.stringify({ status: "skipped", callbackType }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const status = payload.code === 200 ? "completed" : "failed";

    if (!taskId) {
      console.error("No taskId in callback payload");
      return new Response(JSON.stringify({ status: "error", message: "No taskId" }), {
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

    console.log(`Updating task ${taskId}: status=${audioUrl ? "completed" : "failed"}, audioUrl=${audioUrl}`);

    const { error: dbError } = await supabase
      .from("music_tasks")
      .update({
        status: audioUrl ? "completed" : "failed",
        audio_url: audioUrl,
        error_message: errorMessage,
      })
      .eq("task_id", taskId);

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
