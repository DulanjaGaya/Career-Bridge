export const RESUME_LAYOUT_IDS = ["classic", "compact", "centered", "sidebarLeft", "sidebarRight"] as const;
export type ResumeLayoutId = (typeof RESUME_LAYOUT_IDS)[number];

export type ResumeLayoutMeta = {
  id: ResumeLayoutId;
  label: string;
  description: string;
};

export const RESUME_LAYOUTS: Record<ResumeLayoutId, ResumeLayoutMeta> = {
  classic: {
    id: "classic",
    label: "Classic single column",
    description: "Photo top-right, sections in one column — standard ATS-friendly flow.",
  },
  compact: {
    id: "compact",
    label: "Compact",
    description: "Tighter spacing and slightly smaller type — fits more on one page.",
  },
  centered: {
    id: "centered",
    label: "Centered header",
    description: "Name and contact centered; body sections left-aligned below.",
  },
  sidebarLeft: {
    id: "sidebarLeft",
    label: "Sidebar left",
    description: "Narrow column: photo, contact, skills, education. Main: summary, experience, projects.",
  },
  sidebarRight: {
    id: "sidebarRight",
    label: "Sidebar right",
    description: "Main content on the left; sidebar on the right (mirrored).",
  },
};

export function getResumeLayout(id: ResumeLayoutId | undefined | null): ResumeLayoutMeta {
  if (id && id in RESUME_LAYOUTS) return RESUME_LAYOUTS[id];
  return RESUME_LAYOUTS.classic;
}
