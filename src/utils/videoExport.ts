export interface VideoExportOptions {
  audioUrl: string;
  images: string[];
  lyrics: string;
  childName: string;
  width: number;
  height: number;
  onProgress?: (progress: number) => void;
}

export interface VideoSize {
  label: string;
  width: number;
  height: number;
  icon: string;
}

export const VIDEO_SIZES: VideoSize[] = [
  { label: "Stories / Reels (9:16)", width: 1080, height: 1920, icon: "📱" },
  { label: "Feed Instagram (1:1)", width: 1080, height: 1080, icon: "📷" },
  { label: "YouTube (16:9)", width: 1920, height: 1080, icon: "🎬" },
];

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = words[0] || "";

  for (let i = 1; i < words.length; i++) {
    const testLine = currentLine + " " + words[i];
    if (ctx.measureText(testLine).width > maxWidth) {
      lines.push(currentLine);
      currentLine = words[i];
    } else {
      currentLine = testLine;
    }
  }
  lines.push(currentLine);
  return lines;
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

function drawFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  bgImage: HTMLImageElement | null,
  currentLine: string,
  prevLine: string | null,
  nextLine: string | null,
  childName: string
) {
  // Draw background image (cover fit)
  if (bgImage) {
    const imgRatio = bgImage.width / bgImage.height;
    const canvasRatio = width / height;
    let sx = 0, sy = 0, sw = bgImage.width, sh = bgImage.height;
    if (imgRatio > canvasRatio) {
      sw = bgImage.height * canvasRatio;
      sx = (bgImage.width - sw) / 2;
    } else {
      sh = bgImage.width / canvasRatio;
      sy = (bgImage.height - sh) / 2;
    }
    ctx.drawImage(bgImage, sx, sy, sw, sh, 0, 0, width, height);
  } else {
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(0, 0, width, height);
  }

  // Dark gradient overlay
  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, "rgba(0,0,0,0.1)");
  grad.addColorStop(0.5, "rgba(0,0,0,0.3)");
  grad.addColorStop(1, "rgba(0,0,0,0.8)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Child name badge
  const badgeFontSize = Math.round(width * 0.025);
  ctx.font = `bold ${badgeFontSize}px sans-serif`;
  const badgeText = `🎵 ${childName}`;
  const badgeWidth = ctx.measureText(badgeText).width + badgeFontSize * 2;
  const badgeX = width * 0.04;
  const badgeY = height * 0.04;
  ctx.fillStyle = "rgba(255,255,255,0.2)";
  ctx.beginPath();
  const bh = badgeFontSize * 2;
  ctx.roundRect(badgeX, badgeY, badgeWidth, bh, bh / 2);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(badgeText, badgeX + badgeFontSize, badgeY + bh / 2);

  // Lyrics area
  const lyricsY = height * 0.78;
  const mainFontSize = Math.round(width * 0.04);
  const subFontSize = Math.round(width * 0.028);
  const maxTextWidth = width * 0.85;

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Previous line (dimmed)
  if (prevLine) {
    ctx.font = `bold ${subFontSize}px sans-serif`;
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.shadowColor = "rgba(0,0,0,0.5)";
    ctx.shadowBlur = 4;
    const wrappedPrev = wrapText(ctx, prevLine, maxTextWidth);
    wrappedPrev.forEach((line, i) => {
      ctx.fillText(line, width / 2, lyricsY - mainFontSize * 1.8 + i * subFontSize * 1.3);
    });
  }

  // Current line (bright)
  ctx.font = `bold ${mainFontSize}px sans-serif`;
  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = "rgba(0,0,0,0.7)";
  ctx.shadowBlur = 8;
  const wrappedMain = wrapText(ctx, currentLine, maxTextWidth);
  wrappedMain.forEach((line, i) => {
    ctx.fillText(line, width / 2, lyricsY + i * mainFontSize * 1.3);
  });

  // Next line (dimmed)
  if (nextLine) {
    ctx.font = `bold ${subFontSize}px sans-serif`;
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.shadowColor = "rgba(0,0,0,0.5)";
    ctx.shadowBlur = 4;
    const wrappedNext = wrapText(ctx, nextLine, maxTextWidth);
    const nextY = lyricsY + wrappedMain.length * mainFontSize * 1.3 + mainFontSize * 0.5;
    wrappedNext.forEach((line, i) => {
      ctx.fillText(line, width / 2, nextY + i * subFontSize * 1.3);
    });
  }

  ctx.shadowBlur = 0;
}

export async function exportVideo(options: VideoExportOptions): Promise<Blob> {
  const { audioUrl, images, lyrics, childName, width, height, onProgress } = options;

  // Parse lyrics
  const lines = lyrics.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);

  // Load images
  const loadedImages: (HTMLImageElement | null)[] = [];
  for (const url of images) {
    try {
      loadedImages.push(await loadImage(url));
    } catch {
      loadedImages.push(null);
    }
  }

  // Create canvas
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  // Create audio element
  const audio = new Audio();
  audio.crossOrigin = "anonymous";
  audio.src = audioUrl;
  audio.muted = false;

  await new Promise<void>((resolve, reject) => {
    audio.oncanplaythrough = () => resolve();
    audio.onerror = () => reject(new Error("Failed to load audio"));
    audio.load();
  });

  const duration = audio.duration;
  const introRatio = 0.05;
  const outroRatio = 0.05;
  const lyricsStart = duration * introRatio;
  const lyricsEnd = duration * (1 - outroRatio);
  const lyricsDuration = lyricsEnd - lyricsStart;
  const imageInterval = images.length > 0 ? duration / images.length : duration;

  // Set up MediaRecorder with canvas + audio streams
  const canvasStream = canvas.captureStream(30);

  // Create audio context to capture audio stream
  const audioCtx = new AudioContext();
  const source = audioCtx.createMediaElementSource(audio);
  const dest = audioCtx.createMediaStreamDestination();
  source.connect(dest);
  source.connect(audioCtx.destination); // Also play through speakers (will be muted later)

  const combined = new MediaStream([
    ...canvasStream.getVideoTracks(),
    ...dest.stream.getAudioTracks(),
  ]);

  // Try webm with vp8+opus, fallback to webm
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
      const blob = new Blob(chunks, { type: mimeType });
      resolve(blob);
    };

    recorder.onerror = (e) => {
      audioCtx.close();
      reject(new Error("Recording failed"));
    };

    // Render loop
    let animFrameId: number;
    const renderFrame = () => {
      const t = audio.currentTime;
      onProgress?.(Math.min(t / duration, 1));

      // Current image
      const imgIdx = Math.min(
        Math.floor(t / imageInterval),
        loadedImages.length - 1
      );
      const bgImage = loadedImages[Math.max(0, imgIdx)] || loadedImages[0];

      // Current lyric line
      const elapsed = t - lyricsStart;
      let lineIdx = -1;
      if (elapsed >= 0 && lyricsDuration > 0) {
        lineIdx = Math.min(
          Math.floor(elapsed / (lyricsDuration / lines.length)),
          lines.length - 1
        );
      }

      const currentLine = lineIdx >= 0 ? lines[lineIdx] : "";
      const prevLine = lineIdx > 0 ? lines[lineIdx - 1] : null;
      const nextLine = lineIdx >= 0 && lineIdx < lines.length - 1 ? lines[lineIdx + 1] : null;

      drawFrame(ctx, width, height, bgImage, currentLine, prevLine, nextLine, childName);

      if (!audio.ended && !audio.paused) {
        animFrameId = requestAnimationFrame(renderFrame);
      }
    };

    audio.onended = () => {
      cancelAnimationFrame(animFrameId);
      onProgress?.(1);
      recorder.stop();
    };

    // Mute speakers but keep recording audio
    audio.volume = 0;

    recorder.start(1000);
    audio.play().then(() => {
      renderFrame();
    }).catch(reject);
  });
}
