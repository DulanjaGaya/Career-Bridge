import type { Area } from "react-easy-crop";

const OUTPUT_SIZE = 400;

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", (e) => reject(e));
    img.src = url;
  });
}

/** Crop image to square pixels from react-easy-crop, then resize to OUTPUT_SIZE. */
export async function getCroppedSquareJpeg(imageSrc: string, pixelCrop: Area, quality = 0.9): Promise<string> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const w = pixelCrop.width;
  const h = pixelCrop.height;
  canvas.width = OUTPUT_SIZE;
  canvas.height = OUTPUT_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unsupported");

  ctx.drawImage(image, pixelCrop.x, pixelCrop.y, w, h, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
  return canvas.toDataURL("image/jpeg", quality);
}
