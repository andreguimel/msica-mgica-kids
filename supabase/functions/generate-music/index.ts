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
      animais: "happy children's music with animal sounds, playful xylophone and ukulele, farm animals theme",
      princesas: "magical fairy tale children's music, gentle harp and celesta, princess waltz style",
      "super-herois": "heroic upbeat children's music, exciting brass and drums, superhero adventure theme",
      espaco: "dreamy space-themed children's music, synthesizer and twinkling bells, cosmic adventure",
      natureza: "gentle nature-themed children's music, acoustic guitar and flute, birds singing, peaceful garden",
    };

    const style = themeStyles[theme] || themeStyles.animais;
    const prompt = `${style}, suitable for children aged ${ageGroup} years old, Brazilian Portuguese children's song style, cheerful and catchy melody, 90 BPM`;

    const response = await fetch("https://api.elevenlabs.io/v1/music", {
      method: "POST",
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        duration_seconds: 30,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ElevenLabs Music error:", response.status, errorText);
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições atingido. Tente novamente em breve." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`ElevenLabs Music error: ${response.status}`);
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
