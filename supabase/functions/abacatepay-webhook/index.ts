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
    const body = await req.json();
    console.log("AbacatePay webhook received:", JSON.stringify(body));

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing Supabase config");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Handle both billing and pixQrCode webhook payloads
    const billing = body.data?.billing || body.data?.pixQrCode || body.data || body;
    const billingId = billing.id || billing.billingId;
    const status = billing.status;

    if (!billingId) {
      console.log("No billingId/pixId found in webhook payload");
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Processing webhook for ${billingId}, status: ${status}`);

    // Find the task by billing_id (which stores either billing ID or pix ID)
    const { data: task, error: fetchError } = await supabase
      .from("music_tasks")
      .select("*")
      .eq("billing_id", billingId)
      .single();

    if (fetchError || !task) {
      console.log(`No task found for billing_id ${billingId}`);
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if payment is confirmed
    const isPaid = status === "PAID" || status === "COMPLETED" || status === "completed" || status === "RECEIVED";

    if (isPaid && task.payment_status !== "paid") {
      console.log(`Payment confirmed for task ${task.id}, starting music generation...`);

      // Check if this is an upsell placeholder (should NOT trigger music generation)
      const isUpsell = task.lyrics === "__UPSELL__";

      // Update payment status
      await supabase
        .from("music_tasks")
        .update({ payment_status: "paid", ...(isUpsell ? { status: "completed" } : {}) })
        .eq("id", task.id);

      if (!isUpsell) {
        // Trigger music generation only for real tasks
        const startResponse = await fetch(`${SUPABASE_URL}/functions/v1/start-music-after-payment`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          },
          body: JSON.stringify({ taskId: task.id }),
        });

        const startResult = await startResponse.json();
        console.log("Start music result:", JSON.stringify(startResult));
      } else {
        console.log("Upsell task - skipping music generation");
      }
    } else {
      // Update payment status regardless
      await supabase
        .from("music_tasks")
        .update({ payment_status: status?.toLowerCase() || "unknown" })
        .eq("id", task.id);
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Webhook error:", e);
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
