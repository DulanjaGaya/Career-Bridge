export const PHOTO_SHAPE_IDS = ["square", "round"] as const;
export type PhotoShapeId = (typeof PHOTO_SHAPE_IDS)[number];

export const PHOTO_FRAME_IDS = ["none", "thin", "thick", "accent"] as const;
export type PhotoFrameId = (typeof PHOTO_FRAME_IDS)[number];

export const PHOTO_FRAME_LABELS: Record<PhotoFrameId, string> = {
  none: "No frame",
  thin: "Thin",
  thick: "Thick",
  accent: "Theme color",
};
