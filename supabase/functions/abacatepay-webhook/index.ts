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
    const ABACATEPAY_API_KEY = Deno.env.get("ABACATEPAY_API_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing Supabase config");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // AbacatePay webhook sends billing data
    const billing = body.data?.billing || body.data || body;
    const billingId = billing.id || billing.billingId;
    const status = billing.status;

    if (!billingId) {
      console.log("No billingId found in webhook payload");
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Processing webhook for billing ${billingId}, status: ${status}`);

    // Verify billing exists in AbacatePay to prevent forged webhooks
    if (ABACATEPAY_API_KEY) {
      try {
        const verifyResponse = await fetch(`https://api.abacatepay.com/v1/billing/list`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${ABACATEPAY_API_KEY}`,
          },
        });
        if (verifyResponse.ok) {
          const billings = await verifyResponse.json();
          const realBilling = (billings.data || []).find((b: any) => b.id === billingId);
          if (!realBilling) {
            console.error(`Billing ${billingId} not found in AbacatePay - possible forged webhook`);
            return new Response(JSON.stringify({ ok: true }), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
          // Use the real status from AbacatePay, not the webhook payload
          const realStatus = realBilling.status;
          console.log(`Verified billing ${billingId} real status: ${realStatus}`);
          if (realStatus !== "PAID" && realStatus !== "COMPLETED" && realStatus !== "completed") {
            console.log(`Billing ${billingId} not paid (status: ${realStatus}), ignoring`);
            return new Response(JSON.stringify({ ok: true }), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
        }
      } catch (verifyError) {
        console.error("Billing verification error (non-fatal):", verifyError);
        // Fall through to process normally if verification fails
      }
    }

    // Find the task by billing_id
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

    // Check if payment is confirmed (PAID or COMPLETED)
    const isPaid = status === "PAID" || status === "COMPLETED" || status === "completed";

    if (isPaid && task.payment_status !== "paid") {
      console.log(`Payment confirmed for task ${task.id}, starting music generation...`);

      // Update payment status
      await supabase
        .from("music_tasks")
        .update({ payment_status: "paid", status: "awaiting_payment" })
        .eq("id", task.id);

      // Trigger music generation
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
