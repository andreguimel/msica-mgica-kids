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

    // Create a placeholder "upsell" task to track this billing
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
    const BASE_URL = origin || "https://musicamagica.com.br";

    const priceInCents = 1500;
    const productName = "Upgrade Pacote Encantado - +2 músicas";

    const billingBody = {
      frequency: "ONE_TIME",
      methods: ["PIX"],
      products: [
        {
          externalId: upsellTask.id,
          name: productName,
          quantity: 1,
          price: priceInCents,
        },
      ],
      returnUrl: `${BASE_URL}/pagamento`,
      completionUrl: `${BASE_URL}/pagamento?upsell=true&paid=true&taskId=${taskId}&upsellTaskId=${upsellTask.id}`,
      customer: {
        name: task.child_name,
        email: customerEmail,
        cellphone: "11999999999",
        taxId: "52998224725",
      },
    };

    console.log("Creating upsell billing:", JSON.stringify(billingBody));

    const billingResponse = await fetch("https://api.abacatepay.com/v1/billing/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ABACATEPAY_API_KEY}`,
      },
      body: JSON.stringify(billingBody),
    });

    const billingText = await billingResponse.text();
    console.log("AbacatePay upsell response:", billingText);

    let billingData;
    try {
      billingData = JSON.parse(billingText);
    } catch {
      throw new Error(`AbacatePay returned non-JSON: ${billingText.substring(0, 200)}`);
    }

    if (!billingResponse.ok) {
      throw new Error(`AbacatePay error (${billingResponse.status}): ${billingText.substring(0, 300)}`);
    }

    const billingId = billingData.data?.id || billingData.id;
    const paymentUrl = billingData.data?.url || billingData.url;

    // Create Pix QR Code for inline display
    let brCode = "";
    let brCodeBase64 = "";

    try {
      const pixBody = {
        amount: priceInCents,
        expiresIn: 900,
        description: productName,
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
      console.log("AbacatePay upsell Pix QR response status:", pixResponse.status);

      if (pixResponse.ok) {
        const pixData = JSON.parse(pixText);
        brCode = pixData.data?.brCode || pixData.brCode || "";
        brCodeBase64 = pixData.data?.brCodeBase64 || pixData.brCodeBase64 || "";
      }
    } catch (pixError) {
      console.error("Pix QR Code error (non-fatal):", pixError);
    }

    // Update the upsell task with billing info
    await supabase
      .from("music_tasks")
      .update({
        billing_id: billingId || null,
        payment_url: paymentUrl || null,
      })
      .eq("id", upsellTask.id);

    return new Response(
      JSON.stringify({ billingId, paymentUrl, upsellTaskId: upsellTask.id, brCode, brCodeBase64 }),
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
