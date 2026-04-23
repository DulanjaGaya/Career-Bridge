import { z } from "zod";
import { RESUME_LAYOUT_IDS, type ResumeLayoutId } from "./resumeLayouts";
import { PHOTO_FRAME_IDS, PHOTO_SHAPE_IDS, type PhotoFrameId, type PhotoShapeId } from "./resumePhotoStyle";
import { RESUME_THEME_IDS, type ResumeThemeId } from "./resumeThemes";

/** Letters, whitespace (spaces between names), ASCII hyphen/apostrophe, and common Unicode apostrophe (’). */
export const FULL_NAME_ALLOWED = /^[\p{L}\s'\-\u2019]+$/u;

export const FULL_NAME_STRIP = /[^\p{L}\s'\-\u2019]/gu;

/** Letters, spaces, periods, and commas only (no digits or other punctuation). */
export const HEADLINE_ALLOWED = /^[\p{L}\s.,]+$/u;

export const HEADLINE_STRIP = /[^\p{L}\s.,]/gu;

const photoSchema = z
  .string()
  .max(500_000)
  .optional()
  .refine(
    (v) =>
      v === undefined ||
      v === "" ||
      /^data:image\/(png|jpeg|jpg);base64,/i.test(v),
    { message: "Photo must be a PNG or JPEG image" }
  );

export const resumeContentSchema = z.object({
  themeId: z.enum(RESUME_THEME_IDS).optional(),
  layoutId: z.enum(RESUME_LAYOUT_IDS).optional(),
  photoDataUrl: photoSchema,
  photoShape: z.enum(PHOTO_SHAPE_IDS).optional(),
  photoFrame: z.enum(PHOTO_FRAME_IDS).optional(),
  fullName: z
    .string()
    .trim()
    .min(1, "Full name is required")
    .refine((v) => v.length >= 2, { message: "Full name is required" })
    .refine((v) => FULL_NAME_ALLOWED.test(v), {
      message: "Use only letters, spaces, hyphens, and apostrophes (no numbers or other symbols)",
    }),
  headline: z
    .string()
    .optional()
    .refine(
      (v) => v === undefined || v === null || String(v).trim() === "" || HEADLINE_ALLOWED.test(String(v).trim()),
      {
        message: "Use only letters, spaces, commas, and periods (no numbers or other symbols)",
      }
    ),
  summary: z.string().max(2000).optional(),
  contact: z
    .object({
      email: z
        .string()
        .optional()
        .refine((v) => !v || v === "" || z.string().email().safeParse(v).success, {
          message: "Valid email required",
        }),
      phone: z
        .string()
        .optional()
        .refine((v) => v === undefined || v === "" || /^\d+$/.test(v), {
          message: "Phone must contain only numbers (no letters or symbols)",
        }),
      location: z.string().optional(),
      linkedin: z
        .string()
        .optional()
        .refine((v) => !v || v === "" || z.string().url().safeParse(v).success, {
          message: "Valid URL required",
        }),
    })
    .optional(),
  education: z
    .array(
      z.object({
        school: z.string().min(1, "School name required"),
        degree: z.string().min(1, "Degree required"),
        field: z.string().optional(),
        start: z.string().optional(),
        end: z.string().optional(),
        details: z.string().optional(),
      })
    )
    .optional(),
  skills: z.array(z.string()).optional(),
  projects: z
    .array(
      z.object({
        name: z.string().min(1, "Project name required"),
        description: z.string().optional(),
        tech: z.string().optional(),
        link: z
          .string()
          .optional()
          .refine((v) => {
            if (v === undefined || v === null) return true;
            const t = String(v).trim();
            if (t === "") return true;
            return z.string().url().safeParse(t).success;
          }, {
            message: "Enter a valid URL starting with http:// or https://",
          }),
      })
    )
    .optional(),
  experience: z
    .array(
      z.object({
        role: z.string().min(1, "Role required"),
        company: z.string().min(1, "Company required"),
        start: z.string().optional(),
        end: z.string().optional(),
        bullets: z.array(z.string()).optional(),
      })
    )
    .optional(),
});

export type ResumeContent = z.infer<typeof resumeContentSchema>;

export const defaultResumeContent = (): ResumeContent => ({
  themeId: "slate",
  layoutId: "classic",
  photoDataUrl: undefined,
  photoShape: "square",
  photoFrame: "none",
  fullName: "",
  headline: "",
  summary: "",
  contact: { email: "", phone: "", location: "", linkedin: "" },
  education: [],
  skills: [],
  projects: [],
  experience: [],
});

/** Merge server JSON with defaults so new fields (theme, photo) backfill safely. */
export function mergeResumeContent(raw: unknown): ResumeContent {
  const base = defaultResumeContent();
  if (!raw || typeof raw !== "object") return base;
  const o = raw as Record<string, unknown>;
  const themeOk =
    typeof o.themeId === "string" && (RESUME_THEME_IDS as readonly string[]).includes(o.themeId);
  const layoutOk =
    typeof o.layoutId === "string" && (RESUME_LAYOUT_IDS as readonly string[]).includes(o.layoutId);
  const shapeOk =
    typeof o.photoShape === "string" && (PHOTO_SHAPE_IDS as readonly string[]).includes(o.photoShape);
  const frameOk =
    typeof o.photoFrame === "string" && (PHOTO_FRAME_IDS as readonly string[]).includes(o.photoFrame);
  const merged = {
    ...base,
    ...o,
    themeId: themeOk ? (o.themeId as ResumeThemeId) : base.themeId,
    layoutId: layoutOk ? (o.layoutId as ResumeLayoutId) : base.layoutId,
    photoShape: shapeOk ? (o.photoShape as PhotoShapeId) : base.photoShape,
    photoFrame: frameOk ? (o.photoFrame as PhotoFrameId) : base.photoFrame,
    photoDataUrl: typeof o.photoDataUrl === "string" ? o.photoDataUrl : base.photoDataUrl,
    fullName: typeof o.fullName === "string" ? o.fullName : base.fullName,
    headline: o.headline === undefined || o.headline === null ? base.headline : String(o.headline),
    summary: o.summary === undefined || o.summary === null ? base.summary : String(o.summary),
    contact: {
      ...base.contact,
      ...(typeof o.contact === "object" && o.contact ? (o.contact as object) : {}),
    },
    education: Array.isArray(o.education) ? o.education : base.education,
    skills: Array.isArray(o.skills) ? o.skills : base.skills,
    projects: Array.isArray(o.projects) ? o.projects : base.projects,
    experience: Array.isArray(o.experience) ? o.experience : base.experience,
  };
  const parsed = resumeContentSchema.safeParse(merged);
  return parsed.success ? parsed.data : base;
}
