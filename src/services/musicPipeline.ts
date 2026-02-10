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

interface GenerateLyricsResult {
  taskId: string;
  lyrics: string;
}

interface TaskStatus {
  status: "awaiting_payment" | "processing" | "completed" | "failed";
  audio_url: string | null;
  lyrics: string | null;
  error_message: string | null;
}

// Step 1: Generate lyrics only (no Kie.ai cost)
export async function generateLyricsOnly(params: GenerateLyricsParams): Promise<GenerateLyricsResult> {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-lyrics-only`, {
    method: "POST",
    headers,
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Erro ao gerar letra" }));
    throw new Error(error.error || `Erro ${response.status}`);
  }

  const data = await response.json();
  return { taskId: data.taskId, lyrics: data.lyrics };
}

// Step 2: Start music generation after payment
export async function startMusicAfterPayment(taskId: string): Promise<void> {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/start-music-after-payment`, {
    method: "POST",
    headers,
    body: JSON.stringify({ taskId }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Erro ao iniciar geração" }));
    throw new Error(error.error || `Erro ${response.status}`);
  }
}

export async function checkTaskStatus(taskId: string): Promise<TaskStatus> {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/check-task`, {
    method: "POST",
    headers,
    body: JSON.stringify({ taskId }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Erro ao verificar status" }));
    throw new Error(error.error || `Erro ${response.status}`);
  }

  return response.json();
}

export function pollTaskStatus(
  taskId: string,
  onUpdate: (status: TaskStatus) => void,
  onError: (error: Error) => void,
  intervalMs = 5000,
  timeoutMs = 600000
): () => void {
  const startTime = Date.now();
  let stopped = false;

  const poll = async () => {
    if (stopped) return;

    if (Date.now() - startTime > timeoutMs) {
      onError(new Error("Tempo limite excedido. A geração está demorando mais que o esperado."));
      return;
    }

    try {
      const status = await checkTaskStatus(taskId);
      onUpdate(status);

      if (status.status === "processing" || status.status === "awaiting_payment") {
        setTimeout(poll, intervalMs);
      }
    } catch (e) {
      if (!stopped) {
        onError(e instanceof Error ? e : new Error("Erro ao verificar status"));
      }
    }
  };

  poll();

  return () => {
    stopped = true;
  };
}
