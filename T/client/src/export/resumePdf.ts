import { jsPDF } from "jspdf";
import type { ResumeContent } from "../resumeSchema";
import { getResumeLayout } from "../resumeLayouts";
import { getResumeTheme } from "../resumeThemes";
import { getResumePhotoExportUrl } from "../utils/composeResumePhoto";

function addPdfImage(doc: jsPDF, dataUrl: string, x: number, y: number, w: number, h: number) {
  const isPng = /data:image\/png/i.test(dataUrl);
  const fmt = isPng ? "PNG" : "JPEG";
  try {
    doc.addImage(dataUrl, fmt, x, y, w, h);
  } catch {
    try {
      doc.addImage(dataUrl, isPng ? "JPEG" : "PNG", x, y, w, h);
    } catch {
      /* skip */
    }
  }
}

const PAGE_MARGIN = 48;
const PAGE_MARGIN_COMPACT = 40;

function pageHeight(doc: jsPDF) {
  return doc.internal.pageSize.getHeight();
}

function pageWidth(doc: jsPDF) {
  return doc.internal.pageSize.getWidth();
}

function addPageIfNeeded(doc: jsPDF, y: number, needed: number): number {
  const bottom = pageHeight(doc) - PAGE_MARGIN;
  if (y + needed > bottom) {
    doc.addPage();
    return PAGE_MARGIN;
  }
  return y;
}

export async function downloadResumePdf(content: ResumeContent, fileName = "resume.pdf") {
  const theme = getResumeTheme(content.themeId);
  const photoUrl = await getResumePhotoExportUrl(
    content.photoDataUrl,
    content.photoShape,
    content.photoFrame,
    theme.accent
  );
  const layout = getResumeLayout(content.layoutId).id;
  if (layout === "sidebarLeft" || layout === "sidebarRight") {
    downloadResumePdfSidebar(content, fileName, layout === "sidebarLeft" ? "left" : "right", photoUrl);
    return;
  }
  if (layout === "centered") {
    downloadResumePdfCentered(content, fileName, photoUrl);
    return;
  }
  downloadResumePdfClassic(content, fileName, layout === "compact", photoUrl);
}

function downloadResumePdfClassic(content: ResumeContent, fileName: string, compact: boolean, photoUrl: string | undefined) {
  const margin = compact ? PAGE_MARGIN_COMPACT : PAGE_MARGIN;
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = pageWidth(doc);
  const contentW = pageW - margin * 2;
  const theme = getResumeTheme(content.themeId);
  const [rA, gA, bA] = theme.pdfAccent;
  const [rM, gM, bM] = theme.pdfMuted;

  const fs = (n: number) => (compact ? n - 1 : n);
  const lh = (n: number) => (compact ? n * 0.92 : n);

  const photoW = compact ? 56 : 64;
  const photoH = compact ? 56 : 64;
  const hasPhoto = Boolean(photoUrl?.trim() && /^data:image\//i.test(photoUrl));
  const textMaxW = hasPhoto ? contentW - photoW - 16 : contentW;

  let y = margin;

  if (hasPhoto && photoUrl) {
    addPdfImage(doc, photoUrl, pageW - margin - photoW, margin, photoW, photoH);
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(fs(20));
  doc.setTextColor(0, 0, 0);
  const nameLines = doc.splitTextToSize(content.fullName, textMaxW);
  doc.text(nameLines, margin, y + 14);
  y += nameLines.length * lh(24);

  if (content.headline?.trim()) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(fs(12));
    doc.setTextColor(rM, gM, bM);
    const hl = doc.splitTextToSize(content.headline.trim(), textMaxW);
    doc.text(hl, margin, y);
    y += hl.length * lh(16);
    doc.setTextColor(0, 0, 0);
  }

  const c = content.contact;
  if (c) {
    const bits = [c.email, c.phone, c.location, c.linkedin].filter(Boolean);
    if (bits.length) {
      doc.setFontSize(fs(10));
      doc.setFont("helvetica", "normal");
      doc.setTextColor(80, 80, 80);
      const line = bits.join(" · ");
      const cl = doc.splitTextToSize(line, textMaxW);
      doc.text(cl, margin, y);
      y += cl.length * lh(12);
      doc.setTextColor(0, 0, 0);
    }
  }

  const headerBottom = hasPhoto ? margin + photoH : y;
  y = Math.max(y, headerBottom) + (compact ? 8 : 12);

  doc.setDrawColor(rA, gA, bA);
  doc.setLineWidth(compact ? 0.5 : 0.75);
  doc.line(margin, y, pageW - margin, y);
  y += compact ? 14 : 18;

  const section = (title: string) => {
    y = addPageIfNeeded(doc, y, 40);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(fs(13));
    doc.setTextColor(rA, gA, bA);
    doc.text(title, margin, y);
    y += compact ? 14 : 16;
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(fs(10));
  };

  const line = (text: string, size = 10, weight: "normal" | "bold" = "normal") => {
    y = addPageIfNeeded(doc, y, 40);
    doc.setFont("helvetica", weight);
    doc.setFontSize(fs(size));
    const lines = doc.splitTextToSize(text, contentW);
    doc.text(lines, margin, y);
    y += lines.length * lh(size + 4);
  };

  section("Summary");
  if (content.summary) line(content.summary, 10);
  y += compact ? 4 : 6;

  section("Education");
  for (const e of content.education ?? []) {
    line(`${e.degree}${e.field ? `, ${e.field}` : ""} — ${e.school}`, 11, "bold");
    const meta = [e.start, e.end].filter(Boolean).join(" – ");
    if (meta) line(meta, 10);
    if (e.details) line(e.details, 10);
    y += compact ? 2 : 4;
  }

  y += compact ? 4 : 6;
  section("Skills");
  if (content.skills?.length) line(content.skills.join(", "), 10);

  y += compact ? 4 : 6;
  section("Experience");
  for (const x of content.experience ?? []) {
    line(`${x.role} — ${x.company}`, 11, "bold");
    const meta = [x.start, x.end].filter(Boolean).join(" – ");
    if (meta) line(meta, 10);
    for (const b of (x.bullets ?? []).filter((b) => b.trim())) line(`• ${b}`, 10);
    y += compact ? 2 : 4;
  }

  y += compact ? 4 : 6;
  section("Projects");
  for (const p of content.projects ?? []) {
    line(p.name, 11, "bold");
    if (p.description) line(p.description, 10);
    if (p.tech) line(`Tech: ${p.tech}`, 10);
    y += compact ? 2 : 4;
  }

  doc.save(fileName);
}

function downloadResumePdfCentered(content: ResumeContent, fileName: string, photoUrl: string | undefined) {
  const margin = PAGE_MARGIN;
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = pageWidth(doc);
  const cx = pageW / 2;
  const contentW = pageW - margin * 2;
  const theme = getResumeTheme(content.themeId);
  const [rA, gA, bA] = theme.pdfAccent;
  const [rM, gM, bM] = theme.pdfMuted;

  let y = margin;
  const photoW = 72;
  const photoH = 72;
  const hasPhoto = Boolean(photoUrl?.trim() && /^data:image\//i.test(photoUrl));

  if (hasPhoto && photoUrl) {
    addPdfImage(doc, photoUrl, cx - photoW / 2, y, photoW, photoH);
    y += photoH + 12;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(0, 0, 0);
  const nameLines = doc.splitTextToSize(content.fullName, contentW);
  doc.text(nameLines, cx, y + 14, { align: "center" });
  y += nameLines.length * 26;

  if (content.headline?.trim()) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(rM, gM, bM);
    const hl = doc.splitTextToSize(content.headline.trim(), contentW);
    doc.text(hl, cx, y, { align: "center" });
    y += hl.length * 16;
    doc.setTextColor(0, 0, 0);
  }

  const c = content.contact;
  if (c) {
    const bits = [c.email, c.phone, c.location, c.linkedin].filter(Boolean);
    if (bits.length) {
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(80, 80, 80);
      const line = bits.join(" · ");
      const cl = doc.splitTextToSize(line, contentW);
      doc.text(cl, cx, y, { align: "center" });
      y += cl.length * 12;
      doc.setTextColor(0, 0, 0);
    }
  }

  y += 16;
  doc.setDrawColor(rA, gA, bA);
  doc.setLineWidth(0.75);
  doc.line(margin, y, pageW - margin, y);
  y += 18;

  const section = (title: string) => {
    y = addPageIfNeeded(doc, y, 40);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(rA, gA, bA);
    doc.text(title, margin, y);
    y += 16;
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
  };

  const lineL = (text: string, size = 10, weight: "normal" | "bold" = "normal") => {
    y = addPageIfNeeded(doc, y, 40);
    doc.setFont("helvetica", weight);
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(text, contentW);
    doc.text(lines, margin, y);
    y += lines.length * (size + 4);
  };

  section("Summary");
  if (content.summary) lineL(content.summary, 10);
  y += 6;

  section("Education");
  for (const e of content.education ?? []) {
    lineL(`${e.degree}${e.field ? `, ${e.field}` : ""} — ${e.school}`, 11, "bold");
    const meta = [e.start, e.end].filter(Boolean).join(" – ");
    if (meta) lineL(meta, 10);
    if (e.details) lineL(e.details, 10);
    y += 4;
  }

  y += 6;
  section("Skills");
  if (content.skills?.length) lineL(content.skills.join(", "), 10);

  y += 6;
  section("Experience");
  for (const x of content.experience ?? []) {
    lineL(`${x.role} — ${x.company}`, 11, "bold");
    const meta = [x.start, x.end].filter(Boolean).join(" – ");
    if (meta) lineL(meta, 10);
    for (const b of (x.bullets ?? []).filter((b) => b.trim())) lineL(`• ${b}`, 10);
    y += 4;
  }

  y += 6;
  section("Projects");
  for (const p of content.projects ?? []) {
    lineL(p.name, 11, "bold");
    if (p.description) lineL(p.description, 10);
    if (p.tech) lineL(`Tech: ${p.tech}`, 10);
    y += 4;
  }

  doc.save(fileName);
}

function downloadResumePdfSidebar(content: ResumeContent, fileName: string, side: "left" | "right", photoUrl: string | undefined) {
  const margin = PAGE_MARGIN;
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = pageWidth(doc);
  const gap = 14;
  const sideW = 118;
  const mainW = pageW - margin * 2 - gap - sideW;
  const leftX = side === "left" ? margin : margin + mainW + gap;
  const mainX = side === "left" ? margin + sideW + gap : margin;

  const theme = getResumeTheme(content.themeId);
  const [rA, gA, bA] = theme.pdfAccent;
  const [rM, gM, bM] = theme.pdfMuted;

  let yL = margin;
  let yR = margin;
  const photoS = 58;
  const hasPhoto = Boolean(photoUrl?.trim() && /^data:image\//i.test(photoUrl));

  if (hasPhoto && photoUrl) {
    addPdfImage(doc, photoUrl, leftX, yL, photoS, photoS);
    yL += photoS + 8;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  const nameLines = doc.splitTextToSize(content.fullName, mainW);
  doc.text(nameLines, mainX, yR + 14);
  yR += nameLines.length * 22 + 4;

  if (content.headline?.trim()) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(rM, gM, bM);
    const hl = doc.splitTextToSize(content.headline.trim(), mainW);
    doc.text(hl, mainX, yR);
    yR += hl.length * 14;
    doc.setTextColor(0, 0, 0);
  }

  const c = content.contact;
  if (c) {
    const bits = [c.email, c.phone, c.location, c.linkedin].filter(Boolean);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    for (const bit of bits) {
      const lines = doc.splitTextToSize(String(bit), sideW);
      doc.text(lines, leftX, yL);
      yL += lines.length * 10 + 2;
    }
    doc.setTextColor(0, 0, 0);
  }

  yL += 6;
  yR += 8;

  if (content.skills?.length) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(rA, gA, bA);
    doc.text("Skills", leftX, yL);
    yL += 12;
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    const sk = doc.splitTextToSize(content.skills.filter(Boolean).join(", "), sideW);
    doc.text(sk, leftX, yL);
    yL += sk.length * 10 + 4;
    yL += 4;
  }

  if ((content.education ?? []).length > 0) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(rA, gA, bA);
  doc.text("Education", leftX, yL);
  yL += 12;
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  for (const e of content.education ?? []) {
    const t = doc.splitTextToSize(`${e.degree}${e.field ? `, ${e.field}` : ""} — ${e.school}`, sideW);
    doc.text(t, leftX, yL);
    yL += t.length * 10;
    const meta = [e.start, e.end].filter(Boolean).join(" – ");
    if (meta) {
      doc.text(meta, leftX, yL);
      yL += 10;
    }
    yL += 4;
  }
  }

  const sectionMain = (title: string) => {
    yR = addPageIfNeeded(doc, yR, 36);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(rA, gA, bA);
    doc.text(title, mainX, yR);
    yR += 14;
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
  };

  const lineMain = (text: string, size = 10, weight: "normal" | "bold" = "normal") => {
    yR = addPageIfNeeded(doc, yR, 40);
    doc.setFont("helvetica", weight);
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(text, mainW);
    doc.text(lines, mainX, yR);
    yR += lines.length * (size + 4);
  };

  sectionMain("Summary");
  if (content.summary) lineMain(content.summary, 10);
  yR += 6;

  sectionMain("Experience");
  for (const x of content.experience ?? []) {
    lineMain(`${x.role} — ${x.company}`, 11, "bold");
    const meta = [x.start, x.end].filter(Boolean).join(" – ");
    if (meta) lineMain(meta, 10);
    for (const b of (x.bullets ?? []).filter((b) => b.trim())) lineMain(`• ${b}`, 10);
    yR += 4;
  }

  yR += 6;
  sectionMain("Projects");
  for (const p of content.projects ?? []) {
    lineMain(p.name, 11, "bold");
    if (p.description) lineMain(p.description, 10);
    if (p.tech) lineMain(`Tech: ${p.tech}`, 10);
    yR += 4;
  }

  doc.save(fileName);
}
