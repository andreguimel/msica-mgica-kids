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
  const originHeader = req.headers.get("origin") || "";
  const allowedOrigins = ["lovable.app", "lovableproject.com", "localhost", "musicamagica.com", "vercel.app", "musicamagica.com.br"];
  if (!allowedOrigins.some((o) => originHeader.includes(o))) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { taskId, plan, origin, customerName, customerEmail: reqEmail, customerCpf } = await req.json();

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

    const customerEmail = reqEmail || task.user_email || `customer-${taskId.substring(0, 8)}@musicamagica.com`;

    // Update task with customer email if provided
    if (reqEmail && reqEmail !== task.user_email) {
      await supabase.from("music_tasks").update({ user_email: reqEmail }).eq("id", taskId);
    }

    // Create PIX QR Code directly (real PIX, not a billing link)
    console.log("Creating PIX QR Code...");
    const pixBody = {
      amount: priceInCents,
      expiresIn: 900, // 15 minutes
      description: productName,
      customer: {
        name: customerName || task.child_name,
        email: customerEmail,
        cellphone: "11999999999",
        taxId: customerCpf || "52998224725",
      },
      metadata: {
        externalId: taskId,
      },
    };

    const pixResponse = await fetch("https://api.abacatepay.com/v1/pixQrCode/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ABACATEPAY_API_KEY}`,
      },
      body: JSON.stringify(pixBody),
    });

    const pixText = await pixResponse.text();
    console.log("AbacatePay PIX response:", pixText);

    let pixData;
    try {
      pixData = JSON.parse(pixText);
    } catch {
      throw new Error(`AbacatePay returned non-JSON: ${pixText.substring(0, 200)}`);
    }

    if (!pixResponse.ok) {
      throw new Error(`AbacatePay PIX error (${pixResponse.status}): ${pixText.substring(0, 300)}`);
    }

    const pixId = pixData.data?.id || pixData.id;
    const brCode = pixData.data?.brCode || pixData.brCode;
    const brCodeBase64 = pixData.data?.brCodeBase64 || pixData.brCodeBase64;

    console.log("Extracted pixId:", pixId);

    // Update task with pix info (store pix ID in billing_id for webhook tracking)
    const { error: updateError } = await supabase
      .from("music_tasks")
      .update({
        billing_id: pixId || null,
        payment_url: brCode || null, // Store brCode in payment_url for reference
        payment_status: "pending",
      })
      .eq("id", taskId);

    if (updateError) {
      console.error("DB update error:", updateError);
    }

    return new Response(
      JSON.stringify({ billingId: pixId, brCode, brCodeBase64 }),
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
