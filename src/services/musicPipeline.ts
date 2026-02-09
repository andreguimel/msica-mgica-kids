const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const headers = {
  "Content-Type": "application/json",
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
};

interface GenerateSongParams {
  childName: string;
  ageGroup: string;
  theme: string;
  specialMessage: string;
}

interface StartSongResult {
  taskId: string;
  lyrics: string;
}

interface TaskStatus {
  status: "processing" | "completed" | "failed";
  audio_url: string | null;
  lyrics: string | null;
  error_message: string | null;
}

export async function startSongGeneration(params: GenerateSongParams): Promise<StartSongResult> {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-song`, {
    method: "POST",
    headers,
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Erro ao gerar música" }));
    throw new Error(error.error || `Erro ${response.status}`);
  }

  const data = await response.json();
  return { taskId: data.taskId, lyrics: data.lyrics };
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
  timeoutMs = 180000
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

      if (status.status === "processing") {
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
