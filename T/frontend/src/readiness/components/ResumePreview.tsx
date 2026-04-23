import type { CSSProperties } from "react";
import type { ResumeContent } from "../resumeSchema";
import { getResumeLayout } from "../resumeLayouts";
import { getResumeTheme } from "../resumeThemes";

type Props = { content: ResumeContent };

function SummaryBlock({ content }: { content: ResumeContent }) {
  if (!content.summary?.trim()) return null;
  return (
    <section className="resume-preview-block">
      <h4>Summary</h4>
      <p className="resume-preview-body">{content.summary}</p>
    </section>
  );
}

function EducationBlock({ content }: { content: ResumeContent }) {
  if (!content.education?.length) return null;
  return (
    <section className="resume-preview-block">
      <h4>Education</h4>
      <ul className="resume-preview-list">
        {content.education.map((e, i) => (
          <li key={i}>
            <strong>
              {e.degree}
              {e.field ? `, ${e.field}` : ""} — {e.school}
            </strong>
            {[e.start, e.end].filter(Boolean).length > 0 ? (
              <span className="resume-preview-meta">
                {" "}
                {[e.start, e.end].filter(Boolean).join(" – ")}
              </span>
            ) : null}
            {e.details?.trim() ? <p className="resume-preview-body small">{e.details}</p> : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

function SkillsBlock({ content }: { content: ResumeContent }) {
  if (!content.skills?.length) return null;
  return (
    <section className="resume-preview-block">
      <h4>Skills</h4>
      <p className="resume-preview-body">{content.skills.filter(Boolean).join(", ")}</p>
    </section>
  );
}

function ExperienceBlock({ content }: { content: ResumeContent }) {
  if (!content.experience?.length) return null;
  return (
    <section className="resume-preview-block">
      <h4>Experience</h4>
      <ul className="resume-preview-list">
        {content.experience.map((x, i) => (
          <li key={i}>
            <strong>
              {x.role} — {x.company}
            </strong>
            {[x.start, x.end].filter(Boolean).length > 0 ? (
              <span className="resume-preview-meta">
                {" "}
                {[x.start, x.end].filter(Boolean).join(" – ")}
              </span>
            ) : null}
            {(x.bullets ?? [])
              .filter((b) => b.trim())
              .map((b, j) => (
                <p key={j} className="resume-preview-bullet">
                  • {b}
                </p>
              ))}
          </li>
        ))}
      </ul>
    </section>
  );
}

function ProjectsBlock({ content }: { content: ResumeContent }) {
  if (!content.projects?.length) return null;
  return (
    <section className="resume-preview-block">
      <h4>Projects</h4>
      <ul className="resume-preview-list">
        {content.projects.map((p, i) => (
          <li key={i}>
            <strong>{p.name}</strong>
            {p.description?.trim() ? <p className="resume-preview-body small">{p.description}</p> : null}
            {p.tech?.trim() ? <p className="resume-preview-body small">Tech: {p.tech}</p> : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

function ContactLines({ content }: { content: ResumeContent }) {
  if (!content.contact) return null;
  const bits = [content.contact.email, content.contact.phone, content.contact.location, content.contact.linkedin].filter(
    Boolean
  );
  if (!bits.length) return null;
  return <p className="resume-preview-contact">{bits.join(" · ")}</p>;
}

function photoClassName(content: ResumeContent, extra?: string): string {
  const shape = content.photoShape ?? "square";
  const frame = content.photoFrame ?? "none";
  const parts = ["resume-preview-photo"];
  if (shape === "round") parts.push("resume-preview-photo--round");
  parts.push(`resume-preview-photo--frame-${frame}`);
  if (extra) parts.push(extra);
  return parts.join(" ");
}

export default function ResumePreview({ content }: Props) {
  const theme = getResumeTheme(content.themeId);
  const layout = getResumeLayout(content.layoutId);
  const photo = content.photoDataUrl?.trim();
  const hasPhoto = Boolean(photo && /^data:image\//i.test(photo));

  const vars = {
    "--rp-page-bg": theme.pageBg,
    "--rp-surface": theme.surface,
    "--rp-accent": theme.accent,
    "--rp-accent-muted": theme.accentMuted,
    "--rp-text": theme.text,
    "--rp-muted": theme.muted,
  } as CSSProperties;

  const headerPhoto = hasPhoto ? (
    <img className={photoClassName(content)} src={photo!} alt="" width={88} height={88} />
  ) : null;

  const nameHeadline = (
    <>
      <h3 className="resume-preview-name">{content.fullName || "Your name"}</h3>
      {content.headline?.trim() ? <p className="resume-preview-headline">{content.headline}</p> : null}
    </>
  );

  const sidebarInner = (
    <div className="resume-preview-sidebar-inner">
      {headerPhoto}
      <div className="resume-preview-sidebar-contact">
        <ContactLines content={content} />
      </div>
      <SkillsBlock content={content} />
      <EducationBlock content={content} />
    </div>
  );

  const mainInner = (
    <div className="resume-preview-main-inner">
      {nameHeadline}
      <SummaryBlock content={content} />
      <ExperienceBlock content={content} />
      <ProjectsBlock content={content} />
    </div>
  );

  if (layout.id === "sidebarLeft" || layout.id === "sidebarRight") {
    const grid = (
      <div
        className={`resume-preview-grid${layout.id === "sidebarRight" ? " resume-preview-grid--reverse" : ""}`}
      >
        {layout.id === "sidebarLeft" ? (
          <>
            <aside className="resume-preview-sidebar-col">{sidebarInner}</aside>
            <div className="resume-preview-main-col">{mainInner}</div>
          </>
        ) : (
          <>
            <div className="resume-preview-main-col">{mainInner}</div>
            <aside className="resume-preview-sidebar-col">{sidebarInner}</aside>
          </>
        )}
      </div>
    );

    return (
      <section className="resume-preview-wrap" aria-label="Résumé preview" style={vars}>
        <h2 className="resume-preview-title">Live preview</h2>
        <p className="muted small resume-preview-hint">Theme, layout, and photo match exports where supported.</p>
        <div className="resume-preview-sheet resume-preview-sheet--sidebar">{grid}</div>
      </section>
    );
  }

  if (layout.id === "centered") {
    return (
      <section className="resume-preview-wrap" aria-label="Résumé preview" style={vars}>
        <h2 className="resume-preview-title">Live preview</h2>
        <p className="muted small resume-preview-hint">Theme, layout, and photo match exports where supported.</p>
        <div className="resume-preview-sheet resume-preview-sheet--centered">
          <header className="resume-preview-header resume-preview-header--centered">
            {hasPhoto ? (
              <img className={photoClassName(content, "resume-preview-photo--center")} src={photo!} alt="" width={96} height={96} />
            ) : null}
            <div className="resume-preview-header-text resume-preview-header-text--center">{nameHeadline}</div>
            <div className="resume-preview-centered-contact">
              <ContactLines content={content} />
            </div>
          </header>
          <SummaryBlock content={content} />
          <EducationBlock content={content} />
          <SkillsBlock content={content} />
          <ExperienceBlock content={content} />
          <ProjectsBlock content={content} />
        </div>
      </section>
    );
  }

  const compactClass = layout.id === "compact" ? " resume-preview-sheet--compact" : "";

  return (
    <section className="resume-preview-wrap" aria-label="Résumé preview" style={vars}>
      <h2 className="resume-preview-title">Live preview</h2>
      <p className="muted small resume-preview-hint">Theme, layout, and photo match exports where supported.</p>
      <div className={`resume-preview-sheet${compactClass}`}>
        <header className="resume-preview-header">
          {hasPhoto && (
            <img className={photoClassName(content)} src={photo!} alt="" width={88} height={88} />
          )}
          <div className="resume-preview-header-text">
            {nameHeadline}
            <ContactLines content={content} />
          </div>
        </header>
        <SummaryBlock content={content} />
        <EducationBlock content={content} />
        <SkillsBlock content={content} />
        <ExperienceBlock content={content} />
        <ProjectsBlock content={content} />
      </div>
    </section>
  );
}
