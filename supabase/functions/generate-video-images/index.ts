import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const themePrompts: Record<string, string[]> = {
  animais: [
    "playing with cute puppies, kittens and bunnies in a sunny meadow",
    "riding a friendly elephant through a colorful jungle",
    "swimming with dolphins and tropical fish in a crystal clear ocean",
    "feeding baby birds in a magical treehouse garden",
    "having a picnic with forest animals like foxes, deer and squirrels",
  ],
  princesas: [
    "wearing a sparkling crown in a magical fairy tale castle",
    "dancing with butterflies in an enchanted rose garden",
    "riding a white unicorn through a rainbow sky",
    "having a royal tea party with fairy friends",
    "exploring a crystal palace with shimmering towers",
  ],
  "super-herois": [
    "flying through a colorful city skyline with a superhero cape",
    "saving friendly animals with amazing superpowers",
    "standing heroically on top of a mountain at sunset",
    "racing through space with rocket boots near planets",
    "discovering a secret superhero hideout with gadgets",
  ],
  espaco: [
    "floating among colorful planets and twinkling stars",
    "piloting a cute rocket ship through a nebula",
    "meeting friendly aliens on a purple moon",
    "discovering a rainbow galaxy with shooting stars",
    "bouncing on a trampoline on the moon with Earth in background",
  ],
  natureza: [
    "exploring a magical waterfall surrounded by flowers",
    "climbing a giant beanstalk into fluffy clouds",
    "playing in a field of sunflowers under a rainbow",
    "discovering a hidden garden with glowing mushrooms",
    "sailing a leaf boat down a sparkly stream through a forest",
  ],
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !LOVABLE_API_KEY) {
      throw new Error("Missing required env vars");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { taskId, childName, theme } = await req.json();

    if (!taskId || !childName || !theme) {
      return new Response(JSON.stringify({ error: "taskId, childName, theme required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Generating video images for task ${taskId}, child: ${childName}, theme: ${theme}`);

    const scenes = themePrompts[theme] || themePrompts["natureza"];
    // Pick 4 random scenes
    const shuffled = scenes.sort(() => Math.random() - 0.5);
    const selectedScenes = shuffled.slice(0, 4);

    const imageUrls: string[] = [];

    for (let i = 0; i < selectedScenes.length; i++) {
      const prompt = `Cute colorful children's illustration of a child named ${childName} ${selectedScenes[i]}. Whimsical cartoon style, soft pastel colors, warm lighting, adorable characters, no text, no words, no letters. High quality digital art, 16:9 aspect ratio.`;

      console.log(`Generating image ${i + 1}/4: ${prompt.substring(0, 80)}...`);

      try {
        const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-image",
            messages: [{ role: "user", content: prompt }],
            modalities: ["image", "text"],
          }),
        });

        if (!aiResponse.ok) {
          console.error(`AI gateway error for image ${i + 1}: ${aiResponse.status}`);
          continue;
        }

        const aiData = await aiResponse.json();
        const imageData = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

        if (!imageData || !imageData.startsWith("data:image")) {
          console.error(`No image data in response for image ${i + 1}`);
          continue;
        }

        // Extract base64 data
        const base64Match = imageData.match(/^data:image\/(\w+);base64,(.+)$/);
        if (!base64Match) {
          console.error(`Invalid base64 format for image ${i + 1}`);
          continue;
        }

        const imageFormat = base64Match[1];
        const base64Data = base64Match[2];

        // Decode base64 to Uint8Array
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let j = 0; j < binaryString.length; j++) {
          bytes[j] = binaryString.charCodeAt(j);
        }

        const filePath = `images/${taskId}_${i + 1}.${imageFormat}`;
        console.log(`Uploading image ${i + 1} to music-files/${filePath} (${bytes.length} bytes)`);

        const { error: uploadError } = await supabase.storage
          .from("music-files")
          .upload(filePath, bytes, {
            contentType: `image/${imageFormat}`,
            upsert: true,
          });

        if (uploadError) {
          console.error(`Upload error for image ${i + 1}:`, uploadError);
          continue;
        }

        // Generate signed URL (30 days)
        const { data: signedData, error: signedError } = await supabase.storage
          .from("music-files")
          .createSignedUrl(filePath, 2592000);

        if (signedError || !signedData?.signedUrl) {
          console.error(`Signed URL error for image ${i + 1}:`, signedError);
          continue;
        }

        imageUrls.push(signedData.signedUrl);
        console.log(`Image ${i + 1} stored successfully`);
      } catch (imgError) {
        console.error(`Error generating image ${i + 1}:`, imgError);
        continue;
      }
    }

    if (imageUrls.length === 0) {
      console.error("No images were generated successfully");
      return new Response(JSON.stringify({ error: "Failed to generate any images" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Generated ${imageUrls.length} images. Saving to database...`);

    const { error: dbError } = await supabase
      .from("music_tasks")
      .update({ video_images: imageUrls })
      .eq("id", taskId);

    if (dbError) {
      console.error("DB update error:", dbError);
      return new Response(JSON.stringify({ error: "Failed to save images" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Successfully saved ${imageUrls.length} images for task ${taskId}`);

    return new Response(JSON.stringify({ success: true, imageCount: imageUrls.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-video-images error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
