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

  const originHeader = req.headers.get("origin") || "";
  const allowedOrigins = ["lovable.app", "lovableproject.com", "localhost", "musicamagica.com", "vercel.app", "musicamagica.com.br"];
  if (!allowedOrigins.some((o) => originHeader.includes(o))) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { taskId, origin } = await req.json();

    const ABACATEPAY_API_KEY = Deno.env.get("ABACATEPAY_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!ABACATEPAY_API_KEY) throw new Error("ABACATEPAY_API_KEY not configured");
    if (!SUPABASE_URL) throw new Error("SUPABASE_URL not configured");
    if (!SUPABASE_SERVICE_ROLE_KEY) throw new Error("SUPABASE_SERVICE_ROLE_KEY not configured");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch the original task to get user email
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

    // Create a placeholder "upsell" task to track this payment
    const { data: upsellTask, error: upsellError } = await supabase
      .from("music_tasks")
      .insert({
        child_name: `upsell-${task.child_name}`,
        age_group: task.age_group,
        theme: task.theme,
        music_style: task.music_style,
        user_email: task.user_email,
        status: "awaiting_payment",
        payment_status: "pending",
        lyrics: "__UPSELL__",
      })
      .select("id")
      .single();

    if (upsellError || !upsellTask) {
      throw new Error("Failed to create upsell task");
    }

    const customerEmail = task.user_email || `customer-${taskId.substring(0, 8)}@musicamagica.com`;

    const priceInCents = 1500;
    const productName = "Upgrade Pacote Encantado - +2 músicas";

    // Create PIX QR Code directly
    const pixBody = {
      amount: priceInCents,
      expiresIn: 900,
      description: productName,
      customer: {
        name: task.child_name,
        email: customerEmail,
        cellphone: "11999999999",
        taxId: "52998224725",
      },
      metadata: {
        externalId: upsellTask.id,
      },
    };

    console.log("Creating upsell PIX QR Code:", JSON.stringify(pixBody));

    const pixResponse = await fetch("https://api.abacatepay.com/v1/pixQrCode/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ABACATEPAY_API_KEY}`,
      },
      body: JSON.stringify(pixBody),
    });

    const pixText = await pixResponse.text();
    console.log("AbacatePay upsell PIX response:", pixText);

    let pixData;
    try {
      pixData = JSON.parse(pixText);
    } catch {
      throw new Error(`AbacatePay returned non-JSON: ${pixText.substring(0, 200)}`);
    }

    if (!pixResponse.ok) {
      throw new Error(`AbacatePay error (${pixResponse.status}): ${pixText.substring(0, 300)}`);
    }

    const pixId = pixData.data?.id || pixData.id;
    const brCode = pixData.data?.brCode || pixData.brCode;
    const brCodeBase64 = pixData.data?.brCodeBase64 || pixData.brCodeBase64;

    // Update the upsell task with pix info
    await supabase
      .from("music_tasks")
      .update({
        billing_id: pixId || null,
        payment_url: brCode || null,
      })
      .eq("id", upsellTask.id);

    return new Response(
      JSON.stringify({ billingId: pixId, brCode, brCodeBase64, upsellTaskId: upsellTask.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("create-upsell-billing error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro ao criar cobrança de upsell" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
