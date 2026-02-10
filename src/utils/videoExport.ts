export interface VideoExportOptions {
  audioUrl: string;
  images: string[];
  childName: string;
  width?: number;
  height?: number;
  onProgress?: (progress: number) => void;
}

async function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  width: number,
  height: number,
  opacity: number = 1
) {
  ctx.save();
  ctx.globalAlpha = opacity;
  const imgRatio = img.width / img.height;
  const canvasRatio = width / height;
  let sx = 0, sy = 0, sw = img.width, sh = img.height;
  if (imgRatio > canvasRatio) {
    sw = img.height * canvasRatio;
    sx = (img.width - sw) / 2;
  } else {
    sh = img.width / canvasRatio;
    sy = (img.height - sh) / 2;
  }
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, width, height);
  ctx.restore();
}

function drawVignette(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const grad = ctx.createRadialGradient(
    width / 2, height / 2, Math.min(width, height) * 0.3,
    width / 2, height / 2, Math.max(width, height) * 0.7
  );
  grad.addColorStop(0, "rgba(0,0,0,0)");
  grad.addColorStop(1, "rgba(0,0,0,0.3)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);
}

export async function exportVideo(options: VideoExportOptions): Promise<Blob> {
  const {
    audioUrl,
    images,
    width = 1080,
    height = 1920,
    onProgress,
  } = options;

  // Load images
  const loadedImages: HTMLImageElement[] = [];
  for (const url of images) {
    try {
      loadedImages.push(await loadImage(url));
    } catch {
      // skip failed images
    }
  }

  if (loadedImages.length === 0) {
    throw new Error("Nenhuma imagem disponível para gerar o vídeo.");
  }

  // Create canvas
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  // Load audio
  const audio = new Audio();
  audio.crossOrigin = "anonymous";
  audio.src = audioUrl;

  await new Promise<void>((resolve, reject) => {
    audio.oncanplaythrough = () => resolve();
    audio.onerror = () => reject(new Error("Falha ao carregar o áudio."));
    audio.load();
  });

  const duration = audio.duration;
  const imageInterval = duration / loadedImages.length;
  const fadeDuration = 1.0; // 1 second fade between images

  // Set up MediaRecorder
  const canvasStream = canvas.captureStream(30);
  const audioCtx = new AudioContext();
  const source = audioCtx.createMediaElementSource(audio);
  const dest = audioCtx.createMediaStreamDestination();
  source.connect(dest);
  source.connect(audioCtx.destination);

  const combined = new MediaStream([
    ...canvasStream.getVideoTracks(),
    ...dest.stream.getAudioTracks(),
  ]);

  const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")
    ? "video/webm;codecs=vp8,opus"
    : "video/webm";

  const recorder = new MediaRecorder(combined, {
    mimeType,
    videoBitsPerSecond: 4_000_000,
  });

  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  return new Promise<Blob>((resolve, reject) => {
    recorder.onstop = () => {
      audioCtx.close();
      resolve(new Blob(chunks, { type: mimeType }));
    };

    recorder.onerror = () => {
      audioCtx.close();
      reject(new Error("Falha na gravação do vídeo."));
    };

    let animFrameId: number;

    const renderFrame = () => {
      const t = audio.currentTime;
      onProgress?.(Math.min(t / duration, 1));

      const imgIdx = Math.min(Math.floor(t / imageInterval), loadedImages.length - 1);
      const timeInSlide = t - imgIdx * imageInterval;
      const fadeStart = imageInterval - fadeDuration;

      // Draw current image
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, width, height);
      drawImageCover(ctx, loadedImages[imgIdx], width, height, 1);

      // Crossfade to next image
      if (timeInSlide > fadeStart && imgIdx < loadedImages.length - 1) {
        const fadeProgress = (timeInSlide - fadeStart) / fadeDuration;
        drawImageCover(ctx, loadedImages[imgIdx + 1], width, height, fadeProgress);
      }

      // Subtle vignette
      drawVignette(ctx, width, height);

      if (!audio.ended && !audio.paused) {
        animFrameId = requestAnimationFrame(renderFrame);
      }
    };

    audio.onended = () => {
      cancelAnimationFrame(animFrameId);
      onProgress?.(1);
      recorder.stop();
    };

    audio.volume = 0;
    recorder.start(1000);
    audio.play().then(() => renderFrame()).catch(reject);
  });
}
