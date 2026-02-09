import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { theme, ageGroup } = await req.json();

    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
    if (!ELEVENLABS_API_KEY) {
      throw new Error("ELEVENLABS_API_KEY is not configured");
    }

    const themeStyles: Record<string, string> = {
      animais: "happy cheerful children's music with xylophone, ukulele, playful melody, animal farm theme",
      princesas: "magical fairy tale music, gentle harp, celesta, twinkling bells, princess waltz",
      "super-herois": "heroic upbeat children's music, exciting brass fanfare, drums, superhero adventure",
      espaco: "dreamy space themed music, synthesizer, twinkling stars, cosmic adventure melody",
      natureza: "gentle nature music, acoustic guitar, flute, birds singing, peaceful garden melody",
    };

    const style = themeStyles[theme] || themeStyles.animais;
    const prompt = `${style}, suitable for children aged ${ageGroup} years old, cheerful and catchy`;

    const response = await fetch("https://api.elevenlabs.io/v1/sound-generation", {
      method: "POST",
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: prompt,
        duration_seconds: 15,
        prompt_influence: 0.5,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ElevenLabs SFX error:", response.status, errorText);
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições atingido. Tente novamente em breve." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes no ElevenLabs." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`ElevenLabs SFX error: ${response.status}`);
    }

    const audioBuffer = await response.arrayBuffer();

    return new Response(audioBuffer, {
      headers: {
        ...corsHeaders,
        "Content-Type": "audio/mpeg",
      },
    });
  } catch (e) {
    console.error("generate-music error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro ao gerar música" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
