const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const headers = {
  "Content-Type": "application/json",
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
};

interface GenerateLyricsParams {
  childName: string;
  ageGroup: string;
  theme: string;
  specialMessage: string;
}

export async function generateLyrics(params: GenerateLyricsParams): Promise<string> {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-lyrics`, {
    method: "POST",
    headers,
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Erro ao gerar letra" }));
    throw new Error(error.error || `Erro ${response.status}`);
  }

  const data = await response.json();
  return data.lyrics;
}

export async function generateTTS(text: string): Promise<string> {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-tts`, {
    method: "POST",
    headers,
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Erro ao gerar voz" }));
    throw new Error(error.error || `Erro ${response.status}`);
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

export async function generateMusic(theme: string, ageGroup: string): Promise<string | null> {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-music`, {
      method: "POST",
      headers,
      body: JSON.stringify({ theme, ageGroup }),
    });

    if (!response.ok) {
      console.warn("Music generation unavailable:", response.status);
      return null;
    }

    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (e) {
    console.warn("Music generation failed:", e);
    return null;
  }
}
