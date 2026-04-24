/** Resize and encode as JPEG to keep JSON payload small and docx-compatible. */
export async function fileToResumePhotoDataUrl(file: File, maxDim = 400, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        const r = Math.min(maxDim / width, maxDim / height);
        width = Math.round(width * r);
        height = Math.round(height * r);
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas unsupported"));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read image"));
    };
    img.src = url;
  });
}

export function dataUrlToBytes(dataUrl: string): { type: "jpg" | "png"; data: Uint8Array } | null {
  const m = /^data:image\/(png|jpeg|jpg);base64,(.+)$/i.exec(dataUrl.trim());
  if (!m) return null;
  const fmt = m[1].toLowerCase();
  const type: "jpg" | "png" = fmt === "png" ? "png" : "jpg";
  const binary = atob(m[2]);
  const len = binary.length;
  const data = new Uint8Array(len);
  for (let i = 0; i < len; i++) data[i] = binary.charCodeAt(i);
  return { type, data };
}
