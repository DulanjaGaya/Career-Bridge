import {
  Document,
  HeadingLevel,
  ImageRun,
  Packer,
  Paragraph,
  TextRun,
  BorderStyle,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  TableBorders,
  VerticalAlignTable,
} from "docx";
import { saveAs } from "file-saver";
import type { ResumeContent } from "../resumeSchema";
import { getResumeLayout } from "../resumeLayouts";
import { getResumeTheme, type ResumeTheme } from "../resumeThemes";
import { getResumePhotoExportUrl } from "../utils/composeResumePhoto";
import { dataUrlToBytes } from "../utils/resumeImage";

function sectionPara(theme: ResumeTheme, title: string, compact?: boolean) {
  return new Paragraph({
    text: title,
    heading: HeadingLevel.HEADING_2,
    border: {
      bottom: { color: theme.docxBorder, space: 1, style: BorderStyle.SINGLE, size: 6 },
    },
    spacing: { before: compact ? 140 : 200, after: compact ? 80 : 120 },
  });
}

export async function downloadResumeDocx(content: ResumeContent, fileName = "resume.docx") {
  const layout = getResumeLayout(content.layoutId).id;
  const theme = getResumeTheme(content.themeId);
  const compact = layout === "compact";
  const photoUrl = await getResumePhotoExportUrl(
    content.photoDataUrl,
    content.photoShape,
    content.photoFrame,
    theme.accent
  );

  if (layout === "sidebarLeft" || layout === "sidebarRight") {
    const doc = await buildSidebarDocx(content, theme, layout === "sidebarLeft", compact, photoUrl);
    const blob = await Packer.toBlob(doc);
    saveAs(blob, fileName);
    return;
  }

  if (layout === "centered") {
    const doc = await buildCenteredDocx(content, theme, compact, photoUrl);
    const blob = await Packer.toBlob(doc);
    saveAs(blob, fileName);
    return;
  }

  const doc = await buildClassicDocx(content, theme, compact, photoUrl);
  const blob = await Packer.toBlob(doc);
  saveAs(blob, fileName);
}

async function buildClassicDocx(content: ResumeContent, theme: ResumeTheme, compact: boolean, photoUrl: string | undefined) {
  const children: Paragraph[] = [];
  const photoPart = photoUrl?.trim() ? dataUrlToBytes(photoUrl) : null;
  if (photoPart) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [
          new ImageRun({
            type: photoPart.type,
            data: photoPart.data,
            transformation: { width: 112, height: 112 },
          }),
        ],
        spacing: { after: compact ? 120 : 160 },
      })
    );
  }

  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: content.fullName,
          bold: true,
          size: compact ? 48 : 56,
          color: theme.docxNameColor,
        }),
      ],
      spacing: { after: compact ? 80 : 120 },
    })
  );

  if (content.headline) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: content.headline,
            italics: true,
            color: theme.docxBorder,
          }),
        ],
        spacing: { after: compact ? 120 : 160 },
      })
    );
  }

  const c = content.contact;
  if (c) {
    const bits = [c.email, c.phone, c.location, c.linkedin].filter(Boolean);
    if (bits.length) {
      children.push(new Paragraph({ text: bits.join(" · "), spacing: { after: compact ? 160 : 200 } }));
    }
  }

  pushBodySections(children, content, theme, compact);

  return new Document({ sections: [{ properties: {}, children }] });
}

function pushBodySections(children: Paragraph[], content: ResumeContent, theme: ResumeTheme, compact: boolean) {
  if (content.summary) {
    children.push(sectionPara(theme, "Summary", compact));
    children.push(new Paragraph({ text: content.summary, spacing: { after: compact ? 120 : 160 } }));
  }

  children.push(sectionPara(theme, "Education", compact));
  for (const e of content.education ?? []) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: `${e.degree}${e.field ? `, ${e.field}` : ""}`, bold: true }),
          new TextRun({ text: ` — ${e.school}` }),
        ],
      })
    );
    const meta = [e.start, e.end].filter(Boolean).join(" – ");
    if (meta) children.push(new Paragraph({ text: meta, spacing: { after: 80 } }));
    if (e.details) children.push(new Paragraph({ text: e.details, spacing: { after: compact ? 80 : 120 } }));
  }

  children.push(sectionPara(theme, "Skills", compact));
  if (content.skills?.length) {
    children.push(new Paragraph({ text: content.skills.join(", "), spacing: { after: compact ? 120 : 160 } }));
  }

  children.push(sectionPara(theme, "Experience", compact));
  for (const x of content.experience ?? []) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: x.role, bold: true }),
          new TextRun({ text: ` — ${x.company}` }),
        ],
      })
    );
    const meta = [x.start, x.end].filter(Boolean).join(" – ");
    if (meta) children.push(new Paragraph({ text: meta }));
    for (const b of (x.bullets ?? []).filter((b) => b.trim())) {
      children.push(new Paragraph({ text: `• ${b}` }));
    }
    children.push(new Paragraph({ text: "", spacing: { after: compact ? 80 : 120 } }));
  }

  children.push(sectionPara(theme, "Projects", compact));
  for (const p of content.projects ?? []) {
    children.push(new Paragraph({ children: [new TextRun({ text: p.name, bold: true })] }));
    if (p.description) children.push(new Paragraph({ text: p.description }));
    if (p.tech) children.push(new Paragraph({ text: `Technologies: ${p.tech}`, spacing: { after: compact ? 80 : 120 } }));
  }
}

async function buildCenteredDocx(content: ResumeContent, theme: ResumeTheme, compact: boolean, photoUrl: string | undefined) {
  const children: Paragraph[] = [];
  const photoPart = photoUrl?.trim() ? dataUrlToBytes(photoUrl) : null;
  if (photoPart) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new ImageRun({
            type: photoPart.type,
            data: photoPart.data,
            transformation: { width: 120, height: 120 },
          }),
        ],
        spacing: { after: compact ? 120 : 160 },
      })
    );
  }

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: content.fullName,
          bold: true,
          size: compact ? 52 : 60,
          color: theme.docxNameColor,
        }),
      ],
      spacing: { after: compact ? 80 : 120 },
    })
  );

  if (content.headline) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: content.headline,
            italics: true,
            color: theme.docxBorder,
          }),
        ],
        spacing: { after: compact ? 120 : 160 },
      })
    );
  }

  const c = content.contact;
  if (c) {
    const bits = [c.email, c.phone, c.location, c.linkedin].filter(Boolean);
    if (bits.length) {
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          text: bits.join(" · "),
          spacing: { after: compact ? 160 : 200 },
        })
      );
    }
  }

  pushBodySections(children, content, theme, compact);
  return new Document({ sections: [{ properties: {}, children }] });
}

async function buildSidebarDocx(content: ResumeContent, theme: ResumeTheme, sidebarLeft: boolean, compact: boolean, photoUrl: string | undefined) {
  const leftParas: Paragraph[] = [];
  const photoPart = photoUrl?.trim() ? dataUrlToBytes(photoUrl) : null;
  if (photoPart) {
    leftParas.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new ImageRun({
            type: photoPart.type,
            data: photoPart.data,
            transformation: { width: 100, height: 100 },
          }),
        ],
        spacing: { after: 120 },
      })
    );
  }

  const c = content.contact;
  if (c) {
    const bits = [c.email, c.phone, c.location, c.linkedin].filter(Boolean);
    for (const b of bits) {
      leftParas.push(new Paragraph({ text: String(b), spacing: { after: 60 } }));
    }
  }

  if (content.skills?.length) {
    leftParas.push(sectionPara(theme, "Skills", compact));
    leftParas.push(new Paragraph({ text: content.skills.join(", "), spacing: { after: compact ? 120 : 160 } }));
  }

  if ((content.education ?? []).length > 0) {
    leftParas.push(sectionPara(theme, "Education", compact));
    for (const e of content.education ?? []) {
      leftParas.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${e.degree}${e.field ? `, ${e.field}` : ""}`, bold: true }),
            new TextRun({ text: ` — ${e.school}` }),
          ],
        })
      );
      const meta = [e.start, e.end].filter(Boolean).join(" – ");
      if (meta) leftParas.push(new Paragraph({ text: meta, spacing: { after: 60 } }));
      if (e.details) leftParas.push(new Paragraph({ text: e.details, spacing: { after: 80 } }));
    }
  }

  const rightParas: Paragraph[] = [];
  rightParas.push(
    new Paragraph({
      children: [
        new TextRun({
          text: content.fullName,
          bold: true,
          size: compact ? 48 : 56,
          color: theme.docxNameColor,
        }),
      ],
      spacing: { after: compact ? 80 : 120 },
    })
  );

  if (content.headline) {
    rightParas.push(
      new Paragraph({
        children: [
          new TextRun({
            text: content.headline,
            italics: true,
            color: theme.docxBorder,
          }),
        ],
        spacing: { after: compact ? 120 : 160 },
      })
    );
  }

  if (content.summary) {
    rightParas.push(sectionPara(theme, "Summary", compact));
    rightParas.push(new Paragraph({ text: content.summary, spacing: { after: compact ? 120 : 160 } }));
  }

  rightParas.push(sectionPara(theme, "Experience", compact));
  for (const x of content.experience ?? []) {
    rightParas.push(
      new Paragraph({
        children: [
          new TextRun({ text: x.role, bold: true }),
          new TextRun({ text: ` — ${x.company}` }),
        ],
      })
    );
    const meta = [x.start, x.end].filter(Boolean).join(" – ");
    if (meta) rightParas.push(new Paragraph({ text: meta }));
    for (const b of (x.bullets ?? []).filter((b) => b.trim())) {
      rightParas.push(new Paragraph({ text: `• ${b}` }));
    }
    rightParas.push(new Paragraph({ text: "", spacing: { after: compact ? 80 : 120 } }));
  }

  rightParas.push(sectionPara(theme, "Projects", compact));
  for (const p of content.projects ?? []) {
    rightParas.push(new Paragraph({ children: [new TextRun({ text: p.name, bold: true })] }));
    if (p.description) rightParas.push(new Paragraph({ text: p.description }));
    if (p.tech) rightParas.push(new Paragraph({ text: `Technologies: ${p.tech}`, spacing: { after: compact ? 80 : 120 } }));
  }

  const cellOpts = {
    verticalAlign: VerticalAlignTable.TOP,
    margins: { top: 80, bottom: 80, left: 80, right: 80 },
  };

  const sidebarCell = new TableCell({
    ...cellOpts,
    width: { size: 32, type: WidthType.PERCENTAGE },
    children: leftParas,
  });

  const mainCell = new TableCell({
    ...cellOpts,
    width: { size: 68, type: WidthType.PERCENTAGE },
    children: rightParas,
  });

  const row = new TableRow({
    children: sidebarLeft ? [sidebarCell, mainCell] : [mainCell, sidebarCell],
  });

  const table = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: TableBorders.NONE,
    rows: [row],
  });

  return new Document({ sections: [{ properties: {}, children: [table] }] });
}
