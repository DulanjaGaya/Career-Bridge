import type { PhotoFrameId, PhotoShapeId } from "../resumePhotoStyle";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Image load failed"));
    img.src = src;
  });
}

/** Parse #rrggbb — used for theme accent in frame. */
export function hexToRgb(hex: string): [number, number, number] | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

const SIZE = 400;

const FRAME_WIDTH: Record<PhotoFrameId, number> = {
  none: 0,
  thin: 3,
  thick: 6,
  accent: 4,
};

export type ComposePhotoOptions = {
  shape: PhotoShapeId;
  frame: PhotoFrameId;
  accentRgb?: [number, number, number];
};

function strokeColor(frame: PhotoFrameId, accentRgb: [number, number, number]): string {
  if (frame === "accent") return `rgb(${accentRgb[0]}, ${accentRgb[1]}, ${accentRgb[2]})`;
  return "rgba(15, 23, 42, 0.88)";
}

/**
 * PNG data URL for PDF/Word when shape is round or a frame is applied.
 * Square + no frame: caller uses original JPEG.
 */
export async function composeResumePhoto(
  squareJpegDataUrl: string,
  { shape, frame, accentRgb = [30, 41, 59] }: ComposePhotoOptions
): Promise<string> {
  if (shape === "square" && frame === "none") return squareJpegDataUrl;

  const img = await loadImage(squareJpegDataUrl);
  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unsupported");

  const cx = SIZE / 2;
  const cy = SIZE / 2;
  const fw = FRAME_WIDTH[frame];

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, SIZE, SIZE);

  if (shape === "round") {
    const clipR = fw > 0 ? SIZE / 2 - fw : SIZE / 2;
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, clipR, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(img, 0, 0, SIZE, SIZE);
    ctx.restore();

    if (fw > 0) {
      ctx.beginPath();
      const strokeR = SIZE / 2 - fw / 2;
      ctx.strokeStyle = strokeColor(frame, accentRgb);
      ctx.lineWidth = fw;
      ctx.arc(cx, cy, strokeR, 0, Math.PI * 2);
      ctx.stroke();
    }
  } else {
    ctx.drawImage(img, 0, 0, SIZE, SIZE);
    if (fw > 0) {
      const inset = fw / 2;
      ctx.strokeStyle = strokeColor(frame, accentRgb);
      ctx.lineWidth = fw;
      ctx.strokeRect(inset, inset, SIZE - fw, SIZE - fw);
    }
  }

  return canvas.toDataURL("image/png");
}

export async function getResumePhotoExportUrl(
  squareJpegDataUrl: string | undefined,
  shape: PhotoShapeId | undefined,
  frame: PhotoFrameId | undefined,
  accentHex: string
): Promise<string | undefined> {
  const raw = squareJpegDataUrl?.trim();
  if (!raw || !/^data:image\//i.test(raw)) return undefined;
  const s = shape ?? "square";
  const f = frame ?? "none";
  if (s === "square" && f === "none") return raw;
  const rgb = hexToRgb(accentHex) ?? [30, 41, 59];
  return composeResumePhoto(raw, { shape: s, frame: f, accentRgb: rgb });
}
