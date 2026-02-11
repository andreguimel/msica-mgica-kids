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

  // Origin validation
  const origin = req.headers.get("origin") || "";
  const allowedOrigins = ["lovable.app", "lovableproject.com", "localhost", "musicamagica.com"];
  if (!allowedOrigins.some((o) => origin.includes(o))) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { taskId, plan } = await req.json();

    const ABACATEPAY_API_KEY = Deno.env.get("ABACATEPAY_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!ABACATEPAY_API_KEY) throw new Error("ABACATEPAY_API_KEY not configured");
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

    // Determine price in cents
    const priceInCents = plan === "pacote" ? 2490 : 990;
    const productName = plan === "pacote"
      ? `Pacote Encantado - 3 músicas personalizadas`
      : `Música Mágica para ${task.child_name}`;

    const customerEmail = task.user_email || `customer-${taskId.substring(0, 8)}@musicamagica.com`;
    const PREVIEW_URL = "https://id-preview--2748641d-5c04-4c5c-a100-1488a0094549.lovable.app";

    // Create billing via Abacate Pay (customer is created inline)
    console.log("Creating billing with inline customer...");
    const billingBody = {
      frequency: "ONE_TIME",
      methods: ["PIX"],
      products: [
        {
          externalId: taskId,
          name: productName,
          quantity: 1,
          price: priceInCents,
        },
      ],
      returnUrl: `${PREVIEW_URL}/pagamento`,
      completionUrl: `${PREVIEW_URL}/pagamento?paid=true&taskId=${taskId}`,
      customer: {
        name: task.child_name,
        email: customerEmail,
        cellphone: "11999999999",
        taxId: "52998224725",
      },
    };
    console.log("Billing request body:", JSON.stringify(billingBody));

    const billingResponse = await fetch("https://api.abacatepay.com/v1/billing/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ABACATEPAY_API_KEY}`,
      },
      body: JSON.stringify(billingBody),
    });

    const billingText = await billingResponse.text();
    console.log("AbacatePay raw response:", billingText);
    console.log("AbacatePay status:", billingResponse.status);

    let billingData;
    try {
      billingData = JSON.parse(billingText);
    } catch {
      throw new Error(`AbacatePay returned non-JSON: ${billingText.substring(0, 200)}`);
    }

    if (!billingResponse.ok) {
      throw new Error(`AbacatePay error (${billingResponse.status}): ${billingText.substring(0, 300)}`);
    }

    // Try different response structures
    const billingId = billingData.data?.id || billingData.id;
    const paymentUrl = billingData.data?.url || billingData.url;

    console.log("Extracted billingId:", billingId, "paymentUrl:", paymentUrl);

    // Update task with billing info
    const { error: updateError } = await supabase
      .from("music_tasks")
      .update({
        billing_id: billingId || null,
        payment_url: paymentUrl || null,
        payment_status: "pending",
      })
      .eq("id", taskId);

    if (updateError) {
      console.error("DB update error:", updateError);
    }

    return new Response(
      JSON.stringify({ billingId, paymentUrl }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("create-billing error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro ao criar cobrança" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
