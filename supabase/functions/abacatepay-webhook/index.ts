import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function sendBrevoEmail(apiKey: string, to: string, subject: string, htmlContent: string) {
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "accept": "application/json",
      "content-type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      sender: { name: "Música Mágica", email: "andreguimel@gmail.com" },
      to: [{ email: to }],
      subject,
      htmlContent,
    }),
  });
  const data = await response.json();
  if (!response.ok) {
    console.error("Brevo error:", JSON.stringify(data));
  }
  return data;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log("AbacatePay webhook received:", JSON.stringify(body));

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");

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
    const isExpired = status === "EXPIRED" || status === "CANCELLED" || status === "expired" || status === "cancelled";

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

      // Send admin "Venda Confirmada" email
      if (BREVO_API_KEY) {
        const planLabel = task.theme ? `Tema: ${task.theme}` : "";
        const adminHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
  body { font-family: Arial, sans-serif; background: #f0fdf4; margin: 0; padding: 0; }
  .container { max-width: 520px; margin: 0 auto; padding: 24px; }
  .card { background: #ffffff; border-radius: 16px; padding: 32px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
  .badge { display: inline-block; background: #d1fae5; color: #065f46; border-radius: 8px; padding: 6px 14px; font-size: 13px; font-weight: 700; margin-bottom: 20px; }
  h2 { color: #1f2937; margin: 0 0 20px; }
  .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f3f4f6; font-size: 14px; }
  .label { color: #6b7280; }
  .value { color: #111827; font-weight: 600; }
  .price { color: #059669; font-size: 26px; font-weight: 800; margin-top: 20px; }
</style></head>
<body><div class="container"><div class="card">
  <div class="badge">✅ Venda Confirmada!</div>
  <h2>💰 Pagamento recebido!</h2>
  <div class="row"><span class="label">👶 Criança</span><span class="value">${task.child_name}</span></div>
  ${planLabel ? `<div class="row"><span class="label">🎨 Tema</span><span class="value">${task.theme}</span></div>` : ""}
  <div class="row"><span class="label">📧 E-mail cliente</span><span class="value">${task.user_email || "(não informado)"}</span></div>
  <div class="row"><span class="label">🪪 ID do pedido</span><span class="value">${task.id.substring(0, 8)}...</span></div>
  <div class="row"><span class="label">📦 Tipo</span><span class="value">${isUpsell ? "Upsell" : "Pedido principal"}</span></div>
  <div class="price">🎉 Venda confirmada!</div>
</div></div></body></html>`;

        sendBrevoEmail(BREVO_API_KEY, "andreguimel@gmail.com", "✅ Venda Confirmada — Música Mágica", adminHtml)
          .catch((e) => console.error("Failed to send sale email:", e));
      }

    } else if (isExpired && task.payment_status !== "paid") {
      console.log(`Payment expired/cancelled for task ${task.id}`);

      // Update payment status
      await supabase
        .from("music_tasks")
        .update({ payment_status: status?.toLowerCase() || "expired" })
        .eq("id", task.id);

      if (BREVO_API_KEY) {
        // Admin abandonment email
        const adminAbandonHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
  body { font-family: Arial, sans-serif; background: #fff7ed; margin: 0; padding: 0; }
  .container { max-width: 520px; margin: 0 auto; padding: 24px; }
  .card { background: #ffffff; border-radius: 16px; padding: 32px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
  .badge { display: inline-block; background: #fed7aa; color: #9a3412; border-radius: 8px; padding: 6px 14px; font-size: 13px; font-weight: 700; margin-bottom: 20px; }
  h2 { color: #1f2937; margin: 0 0 20px; }
  .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f3f4f6; font-size: 14px; }
  .label { color: #6b7280; }
  .value { color: #111827; font-weight: 600; }
  .note { margin-top: 20px; background: #fef3c7; border-radius: 10px; padding: 14px; font-size: 13px; color: #92400e; }
</style></head>
<body><div class="container"><div class="card">
  <div class="badge">⚠️ Abandono de Carrinho</div>
  <h2>Cliente não pagou o Pix</h2>
  <div class="row"><span class="label">👶 Criança</span><span class="value">${task.child_name}</span></div>
  <div class="row"><span class="label">🎨 Tema</span><span class="value">${task.theme}</span></div>
  <div class="row"><span class="label">📧 E-mail</span><span class="value">${task.user_email || "(não informado)"}</span></div>
  <div class="row"><span class="label">📌 Status</span><span class="value">${status}</span></div>
  <div class="note">📨 Um e-mail de recuperação com 50% de desconto foi enviado automaticamente para o cliente (se tiver e-mail cadastrado).</div>
</div></div></body></html>`;

        const adminEmailPromise = sendBrevoEmail(
          BREVO_API_KEY,
          "andreguimel@gmail.com",
          "⚠️ Abandono de Carrinho — Música Mágica",
          adminAbandonHtml
        ).catch((e) => console.error("Failed to send abandonment admin email:", e));

        // Client recovery email (only if we have an email)
        const clientEmail = task.user_email;
        let clientEmailPromise = Promise.resolve();
        if (clientEmail && clientEmail !== "(não informado)" && !clientEmail.includes("@musicamagica.com")) {
          const recoveryLink = `https://musicamagica.com.br/criar?coupon=RESGATE50`;
          const clientRecoveryHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
  body { font-family: 'Segoe UI', Arial, sans-serif; background: #fdf2f8; margin: 0; padding: 0; }
  .container { max-width: 520px; margin: 0 auto; padding: 32px 24px; }
  .card { background: #ffffff; border-radius: 24px; padding: 40px 32px; text-align: center; box-shadow: 0 4px 24px rgba(0,0,0,0.06); }
  h1 { color: #ec4899; font-size: 26px; margin-bottom: 8px; }
  .subtitle { color: #6b7280; font-size: 15px; margin-bottom: 28px; line-height: 1.6; }
  .coupon-box { background: linear-gradient(135deg, #fce7f3, #ede9fe); border-radius: 16px; padding: 24px; margin: 24px 0; }
  .coupon-label { color: #6b7280; font-size: 13px; margin: 0 0 8px; }
  .coupon-code { font-size: 36px; font-weight: 800; color: #ec4899; letter-spacing: 4px; margin: 0; }
  .discount { color: #7c3aed; font-size: 14px; font-weight: 600; margin-top: 6px; }
  .btn { display: inline-block; background: linear-gradient(135deg, #ec4899, #8b5cf6); color: #ffffff !important; text-decoration: none; padding: 18px 44px; border-radius: 16px; font-weight: 700; font-size: 17px; margin: 20px 0 8px; }
  .timer { color: #ef4444; font-size: 13px; font-weight: 600; margin-top: 4px; }
  .footer { text-align: center; color: #9ca3af; font-size: 12px; margin-top: 24px; }
</style></head>
<body>
  <div class="container">
    <div class="card">
      <div style="font-size: 52px; margin-bottom: 16px;">🎵</div>
      <h1>Oi! Esqueceu a música de ${task.child_name}? 🎶</h1>
      <p class="subtitle">
        Você quase criou a música personalizada de <strong>${task.child_name}</strong>.<br>
        Por isso, estamos oferecendo um desconto especial só para você!
      </p>
      
      <div class="coupon-box">
        <p class="coupon-label">Seu cupom exclusivo:</p>
        <p class="coupon-code">RESGATE50</p>
        <p class="discount">✨ 50% de desconto por 24 horas</p>
      </div>
      
      <a href="${recoveryLink}" class="btn">🎁 Resgatar meu desconto →</a>
      <p class="timer">⏰ Oferta válida por 24 horas</p>
    </div>
    <p class="footer">
      Música Mágica para Crianças 🎶<br>
      Você recebeu este e-mail porque iniciou a criação de uma música.<br>
      Este é um e-mail automático.
    </p>
  </div>
</body>
</html>`;

          clientEmailPromise = sendBrevoEmail(
            BREVO_API_KEY,
            clientEmail,
            `Oi! Esqueceu a música de ${task.child_name}? 🎵 — 50% OFF por 24h`,
            clientRecoveryHtml
          ).catch((e) => console.error("Failed to send client recovery email:", e));
        }

        await Promise.all([adminEmailPromise, clientEmailPromise]);
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
