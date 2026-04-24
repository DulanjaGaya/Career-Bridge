import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { api, type ResumeRecord } from "../api";
import ResumePhotoModal from "../components/ResumePhotoModal";
import ResumePreview from "../components/ResumePreview";
import { downloadResumeDocx } from "../export/resumeDocx";
import { downloadResumePdf } from "../export/resumePdf";
import {
  defaultResumeContent,
  FULL_NAME_STRIP,
  HEADLINE_STRIP,
  mergeResumeContent,
  resumeContentSchema,
  type ResumeContent,
} from "../resumeSchema";
import { RESUME_LAYOUTS, type ResumeLayoutId } from "../resumeLayouts";
import {
  PHOTO_FRAME_IDS,
  PHOTO_FRAME_LABELS,
  PHOTO_SHAPE_IDS,
  type PhotoFrameId,
  type PhotoShapeId,
} from "../resumePhotoStyle";
import { RESUME_THEMES, type ResumeThemeId } from "../resumeThemes";

const TITLE_LETTERS_NUMBERS_SPACES = /^[a-zA-Z0-9 ]+$/;

function photoThumbClass(shape: PhotoShapeId | undefined, frame: PhotoFrameId | undefined): string {
  const s = shape ?? "square";
  const f = frame ?? "none";
  const parts = ["photo-thumb"];
  if (s === "round") parts.push("photo-thumb--round");
  parts.push(`photo-thumb--frame-${f}`);
  return parts.join(" ");
}

function validateResumeTitle(value: string): string | null {
  const t = value.trim();
  if (!t) return "Résumé title is required.";
  if (!TITLE_LETTERS_NUMBERS_SPACES.test(t)) return "Use only letters, numbers, and spaces (no other symbols).";
  return null;
}

type Props = { userId: string | null; bootstrapping?: boolean };

export default function ResumePage({ userId, bootstrapping }: Props) {
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [photoModalSrc, setPhotoModalSrc] = useState<string | null>(null);
  const photoModalBlobRef = useRef<string | null>(null);

  const [resumes, setResumes] = useState<ResumeRecord[]>([]);
  const [title, setTitle] = useState("My resume");
  const [titleError, setTitleError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [summaryAiBusy, setSummaryAiBusy] = useState(false);

  const form = useForm<ResumeContent>({
    resolver: zodResolver(resumeContentSchema),
    defaultValues: defaultResumeContent(),
    mode: "onBlur",
  });

  const photoShapeWatch = form.watch("photoShape");
  const photoFrameWatch = form.watch("photoFrame");

  const closePhotoModal = () => {
    if (photoModalBlobRef.current) {
      URL.revokeObjectURL(photoModalBlobRef.current);
      photoModalBlobRef.current = null;
    }
    setPhotoModalOpen(false);
    setPhotoModalSrc(null);
  };

  const openCropFromFile = (file: File) => {
    if (photoModalBlobRef.current) {
      URL.revokeObjectURL(photoModalBlobRef.current);
      photoModalBlobRef.current = null;
    }
    const url = URL.createObjectURL(file);
    photoModalBlobRef.current = url;
    setPhotoModalSrc(url);
    setPhotoModalOpen(true);
  };

  const openCropEdit = (dataUrl: string) => {
    if (photoModalBlobRef.current) {
      URL.revokeObjectURL(photoModalBlobRef.current);
      photoModalBlobRef.current = null;
    }
    setPhotoModalSrc(dataUrl);
    setPhotoModalOpen(true);
  };

  useEffect(() => {
    return () => {
      if (photoModalBlobRef.current) URL.revokeObjectURL(photoModalBlobRef.current);
    };
  }, []);

  const edu = useFieldArray({ control: form.control, name: "education" });
  const projects = useFieldArray({ control: form.control, name: "projects" });
  const experience = useFieldArray({ control: form.control, name: "experience" });

  useEffect(() => {
    if (!userId) return;
    void (async () => {
      const list = await api.listResumes(userId);
      setResumes(list);
      if (list[0]) {
        setActiveId(list[0].id);
        setTitle(list[0].title);
        setTitleError(null);
        form.reset(mergeResumeContent(JSON.parse(list[0].contentJson)));
      }
    })().catch(() => setStatus("Could not load résumés."));
  }, [userId, form]);

  const loadResume = async (id: string) => {
    const r = await api.getResume(id);
    setActiveId(r.id);
    setTitle(r.title);
    setTitleError(null);
    form.reset(mergeResumeContent(JSON.parse(r.contentJson)));
  };

  const save = form.handleSubmit(async (data) => {
    if (!userId) return;
    const titleErr = validateResumeTitle(title);
    if (titleErr) {
      setTitleError(titleErr);
      setStatus(null);
      return;
    }
    const trimmedTitle = title.trim();
    setTitleError(null);
    setStatus(null);
    try {
      if (activeId) {
        const updated = await api.updateResume(activeId, { title: trimmedTitle, content: data });
        setTitle(trimmedTitle);
        setResumes((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
        setStatus("Saved.");
      } else {
        const created = await api.saveResume({ userId, title: trimmedTitle, content: data });
        setActiveId(created.id);
        setTitle(trimmedTitle);
        setResumes((prev) => [created, ...prev]);
        setStatus("Created new version.");
      }
    } catch {
      setStatus("Save failed — check the API is running.");
    }
  });

  const suggestSummary = async () => {
    const raw = form.getValues("summary") ?? "";
    setSummaryAiBusy(true);
    setStatus(null);
    try {
      const { suggestion } = await api.suggestProfessionalSummary(raw);
      form.setValue("summary", suggestion, { shouldValidate: true, shouldDirty: true });
      setStatus("Summary updated — review and edit as needed.");
    } catch {
      setStatus("Suggestion service unavailable.");
    } finally {
      setSummaryAiBusy(false);
    }
  };

  if (bootstrapping) {
    return (
      <div className="page-shell">
        <div className="card narrow">
          <h1>Résumé builder</h1>
          <p className="muted">Loading your workspace…</p>
        </div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="page-shell">
        <div className="card narrow">
          <h1>Résumé builder</h1>
          <p className="muted">Could not start a session — check that the API is running.</p>
        </div>
      </div>
    );
  }

  const values = form.watch();

  return (
    <div className="page-shell">
      <div className="resume-layout">
      <aside className="card aside">
        <h2>Saved résumés</h2>
        <p className="muted small">Multiple versions per user (SQL‑backed).</p>
        <ul className="resume-list">
          {resumes.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                className={r.id === activeId ? "link active" : "link"}
                onClick={() => void loadResume(r.id)}
              >
                {r.title}
              </button>
              <span className="muted tiny">v{r.version}</span>
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="btn secondary full"
          onClick={() => {
            setActiveId(null);
            form.reset(defaultResumeContent());
            setTitle("New resume");
            setTitleError(null);
            setStatus("Draft — fill and save.");
          }}
        >
          Start new draft
        </button>
      </aside>

      <div className="card resume-main">
        <div className="toolbar">
          <div>
            <h1>Résumé builder</h1>
            <p className="muted small">Structured sections · validation · export</p>
          </div>
          <div className="toolbar-actions">
            <button type="button" className="btn primary" onClick={() => void save()}>
              Save to server
            </button>
            <button
              type="button"
              className="btn ghost"
              onClick={() => {
                const err = validateResumeTitle(title);
                if (err) {
                  setTitleError(err);
                  return;
                }
                void downloadResumePdf(values, `${title.trim()}.pdf`);
              }}
            >
              Download PDF
            </button>
            <button
              type="button"
              className="btn ghost"
              onClick={() => {
                const err = validateResumeTitle(title);
                if (err) {
                  setTitleError(err);
                  return;
                }
                void downloadResumeDocx(values, `${title.trim()}.docx`);
              }}
            >
              Download Word
            </button>
          </div>
        </div>

        <label className="title-field">
          Résumé title
          <input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setTitleError(null);
            }}
            onBlur={(e) => setTitleError(validateResumeTitle(e.target.value))}
            required
            minLength={1}
            pattern="[a-zA-Z0-9 ]+"
            title="Letters, numbers, and spaces only"
            aria-invalid={titleError ? true : undefined}
            autoComplete="off"
          />
          {titleError && <span className="field-error">{titleError}</span>}
        </label>

        {status && <div className="banner ok">{status}</div>}

        <ResumePreview content={values} />

        <form className="stack-lg" onSubmit={(e) => e.preventDefault()}>
          <section className="form-section">
            <h2>Appearance</h2>
            <p className="muted small">Optional photo, color themes, and layout for preview, PDF, and Word.</p>
            <div className="appearance-layouts">
              <span className="appearance-label">Layout format</span>
              <div className="layout-options" role="radiogroup" aria-label="Résumé layout">
                <Controller
                  name="layoutId"
                  control={form.control}
                  render={({ field }) => (
                    <>
                      {(Object.keys(RESUME_LAYOUTS) as ResumeLayoutId[]).map((id) => {
                        const L = RESUME_LAYOUTS[id];
                        const active = (field.value ?? "classic") === id;
                        return (
                          <button
                            key={id}
                            type="button"
                            role="radio"
                            aria-checked={active}
                            className={`layout-option${active ? " active" : ""}`}
                            onClick={() => field.onChange(id)}
                          >
                            <span className="layout-option-name">{L.label}</span>
                            <span className="layout-option-desc">{L.description}</span>
                          </button>
                        );
                      })}
                    </>
                  )}
                />
              </div>
            </div>
            <div className="appearance-grid">
              <div className="appearance-themes">
                <span className="appearance-label">Color theme</span>
                <div className="theme-swatches" role="radiogroup" aria-label="Résumé color theme">
                  <Controller
                    name="themeId"
                    control={form.control}
                    render={({ field }) => (
                      <>
                        {(Object.keys(RESUME_THEMES) as ResumeThemeId[]).map((id) => {
                          const t = RESUME_THEMES[id];
                          const active = (field.value ?? "slate") === id;
                          return (
                            <button
                              key={id}
                              type="button"
                              role="radio"
                              aria-checked={active}
                              className={`theme-swatch${active ? " active" : ""}`}
                              title={t.label}
                              onClick={() => field.onChange(id)}
                            >
                              <span className="theme-swatch-surface" style={{ background: t.surface }} />
                              <span className="theme-swatch-accent" style={{ background: t.accent }} />
                            </button>
                          );
                        })}
                      </>
                    )}
                  />
                </div>
              </div>
              <div className="appearance-photo">
                <span className="appearance-label">Photo (optional)</span>
                <Controller
                  name="photoDataUrl"
                  control={form.control}
                  render={({ field }) => (
                    <div className="photo-field">
                      {field.value ? (
                        <div className="photo-field-preview">
                          <img
                            src={field.value}
                            alt=""
                            className={photoThumbClass(photoShapeWatch, photoFrameWatch)}
                          />
                          <div className="photo-field-actions">
                            <button type="button" className="btn tiny secondary" onClick={() => openCropEdit(field.value!)}>
                              Crop / adjust
                            </button>
                            <button
                              type="button"
                              className="btn tiny danger"
                              onClick={() => {
                                field.onChange(undefined);
                                form.setValue("photoShape", "square");
                                form.setValue("photoFrame", "none");
                                form.clearErrors("photoDataUrl");
                              }}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ) : null}
                      <label className="btn tiny secondary photo-upload-btn">
                        {field.value ? "New photo" : "Upload photo"}
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/jpg"
                          className="sr-only"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            e.target.value = "";
                            if (!f) return;
                            openCropFromFile(f);
                          }}
                        />
                      </label>
                      {field.value ? (
                        <div className="photo-style-toggles">
                          <div className="photo-style-row">
                            <span className="muted tiny">Shape</span>
                            <div className="segmented" role="group" aria-label="Photo shape">
                              <Controller
                                name="photoShape"
                                control={form.control}
                                render={({ field: sf }) => (
                                  <>
                                    {(PHOTO_SHAPE_IDS as readonly PhotoShapeId[]).map((id) => (
                                      <button
                                        key={id}
                                        type="button"
                                        className={`segmented-btn${(sf.value ?? "square") === id ? " active" : ""}`}
                                        onClick={() => sf.onChange(id)}
                                      >
                                        {id === "square" ? "Square" : "Round"}
                                      </button>
                                    ))}
                                  </>
                                )}
                              />
                            </div>
                          </div>
                          <div className="photo-style-row">
                            <span className="muted tiny">Frame</span>
                            <div className="segmented segmented-wrap" role="group" aria-label="Photo frame">
                              <Controller
                                name="photoFrame"
                                control={form.control}
                                render={({ field: ff }) => (
                                  <>
                                    {(PHOTO_FRAME_IDS as readonly PhotoFrameId[]).map((id) => (
                                      <button
                                        key={id}
                                        type="button"
                                        className={`segmented-btn${(ff.value ?? "none") === id ? " active" : ""}`}
                                        onClick={() => ff.onChange(id)}
                                      >
                                        {PHOTO_FRAME_LABELS[id]}
                                      </button>
                                    ))}
                                  </>
                                )}
                              />
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  )}
                />
                {form.formState.errors.photoDataUrl && (
                  <span className="field-error">{form.formState.errors.photoDataUrl.message}</span>
                )}
              </div>
            </div>
          </section>

          <section className="form-section">
            <h2>Profile</h2>
            <div className="grid-2 tight">
              <label>
                Full name
                <Controller
                  name="fullName"
                  control={form.control}
                  render={({ field }) => (
                    <input
                      autoComplete="name"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const cleaned = e.target.value.replace(FULL_NAME_STRIP, "");
                        field.onChange(cleaned);
                      }}
                    />
                  )}
                />
                {form.formState.errors.fullName && (
                  <span className="field-error">{form.formState.errors.fullName.message}</span>
                )}
              </label>
              <label>
                Headline
                <Controller
                  name="headline"
                  control={form.control}
                  render={({ field }) => (
                    <input
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const cleaned = e.target.value.replace(HEADLINE_STRIP, "");
                        field.onChange(cleaned);
                      }}
                      placeholder="e.g. Final year IT undergraduate, software engineering"
                    />
                  )}
                />
                {form.formState.errors.headline && (
                  <span className="field-error">{form.formState.errors.headline.message}</span>
                )}
              </label>
            </div>
            <div className="summary-field">
              <div className="section-head">
                <label htmlFor="resume-summary" className="summary-field-title">
                  Professional summary
                </label>
                <button
                  type="button"
                  className="btn tiny secondary"
                  disabled={summaryAiBusy}
                  onClick={() => void suggestSummary()}
                >
                  {summaryAiBusy ? "Working…" : "Improve with AI (demo)"}
                </button>
              </div>
              <textarea id="resume-summary" {...form.register("summary")} rows={12} />
            </div>
          </section>

          <section className="form-section">
            <h2>Contact</h2>
            <div className="grid-2 tight">
              <label>
                Email
                <input {...form.register("contact.email")} type="email" />
                {form.formState.errors.contact?.email && (
                  <span className="field-error">{form.formState.errors.contact.email.message}</span>
                )}
              </label>
              <label>
                Phone
                <input
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  placeholder="Digits only, e.g. 94770000000"
                  pattern="[0-9]*"
                  {...form.register("contact.phone", {
                    onChange: (e) => {
                      const el = e.target as HTMLInputElement;
                      const digits = el.value.replace(/\D/g, "");
                      if (el.value !== digits) el.value = digits;
                    },
                  })}
                />
                {form.formState.errors.contact?.phone && (
                  <span className="field-error">{form.formState.errors.contact.phone.message}</span>
                )}
              </label>
              <label>
                Location
                <input {...form.register("contact.location")} />
              </label>
              <label>
                LinkedIn URL
                <input {...form.register("contact.linkedin")} placeholder="https://…" />
                {form.formState.errors.contact?.linkedin && (
                  <span className="field-error">{form.formState.errors.contact.linkedin.message}</span>
                )}
              </label>
            </div>
          </section>

          <section className="form-section">
            <div className="section-head">
              <h2>Education</h2>
              <button type="button" className="btn tiny secondary" onClick={() => edu.append({ school: "", degree: "", field: "", start: "", end: "", details: "" })}>
                Add education
              </button>
            </div>
            {edu.fields.map((field, index) => (
              <div key={field.id} className="subcard">
                <div className="grid-2 tight">
                  <label>
                    School
                    <input {...form.register(`education.${index}.school`)} />
                  </label>
                  <label>
                    Degree
                    <input {...form.register(`education.${index}.degree`)} />
                  </label>
                  <label>
                    Field of study
                    <input {...form.register(`education.${index}.field`)} />
                  </label>
                  <div className="grid-2 tight">
                    <label>
                      Start
                      <input {...form.register(`education.${index}.start`)} />
                    </label>
                    <label>
                      End
                      <input {...form.register(`education.${index}.end`)} />
                    </label>
                  </div>
                </div>
                <label>
                  Details
                  <textarea {...form.register(`education.${index}.details`)} rows={2} />
                </label>
                <button type="button" className="btn tiny danger" onClick={() => edu.remove(index)}>
                  Remove
                </button>
              </div>
            ))}
          </section>

          <section className="form-section">
            <div className="section-head">
              <h2>Skills</h2>
              <button
                type="button"
                className="btn tiny secondary"
                onClick={() => {
                  const cur = form.getValues("skills") ?? [];
                  form.setValue("skills", [...cur, ""], { shouldValidate: true });
                }}
              >
                Add skill
              </button>
            </div>
            <div className="skills-grid">
              {(form.watch("skills") ?? []).map((_, index) => (
                <div key={`skill-${index}`} className="skill-row">
                  <input {...form.register(`skills.${index}`)} placeholder="Skill" />
                  <button
                    type="button"
                    className="btn tiny danger"
                    onClick={() => {
                      const cur = [...(form.getValues("skills") ?? [])];
                      cur.splice(index, 1);
                      form.setValue("skills", cur, { shouldValidate: true });
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="form-section">
            <div className="section-head">
              <h2>Projects</h2>
              <button
                type="button"
                className="btn tiny secondary"
                onClick={() => projects.append({ name: "", description: "", tech: "", link: "" })}
              >
                Add project
              </button>
            </div>
            {projects.fields.map((field, index) => (
              <div key={field.id} className="subcard">
                <label>
                  Project name
                  <input {...form.register(`projects.${index}.name`)} />
                </label>
                <label>
                  Description
                  <textarea {...form.register(`projects.${index}.description`)} rows={2} />
                </label>
                <div className="grid-2 tight">
                  <label>
                    Technologies
                    <input {...form.register(`projects.${index}.tech`)} />
                  </label>
                  <label>
                    Link
                    <input
                      type="url"
                      inputMode="url"
                      autoComplete="url"
                      placeholder="https://github.com/your/project"
                      {...form.register(`projects.${index}.link`)}
                    />
                    {form.formState.errors.projects?.[index]?.link && (
                      <span className="field-error">
                        {form.formState.errors.projects[index]?.link?.message}
                      </span>
                    )}
                  </label>
                </div>
                <button type="button" className="btn tiny danger" onClick={() => projects.remove(index)}>
                  Remove project
                </button>
              </div>
            ))}
          </section>

          <section className="form-section">
            <div className="section-head">
              <h2>Experience</h2>
              <button
                type="button"
                className="btn tiny secondary"
                onClick={() =>
                  experience.append({ role: "", company: "", start: "", end: "", bullets: [""] })
                }
              >
                Add role
              </button>
            </div>
            {experience.fields.map((field, index) => (
              <div key={field.id} className="subcard">
                <div className="grid-2 tight">
                  <label>
                    Role
                    <input {...form.register(`experience.${index}.role`)} />
                  </label>
                  <label>
                    Organization
                    <input {...form.register(`experience.${index}.company`)} />
                  </label>
                  <label>
                    Start
                    <input {...form.register(`experience.${index}.start`)} />
                  </label>
                  <label>
                    End
                    <input {...form.register(`experience.${index}.end`)} />
                  </label>
                </div>
                <label className="experience-bullets-field">
                  Achievement bullets (one per line)
                  <textarea
                    value={
                      (form.watch(`experience.${index}.bullets`) as string[] | undefined)?.join("\n") ?? ""
                    }
                    onChange={(e) => {
                      // Keep empty lines so Enter creates a new row (don't filter(Boolean)).
                      const lines = e.target.value.split("\n").map((l) => l.trim());
                      form.setValue(`experience.${index}.bullets`, lines, {
                        shouldValidate: true,
                        shouldDirty: true,
                      });
                    }}
                    onBlur={(e) => {
                      const cleaned = e.target.value
                        .split("\n")
                        .map((l) => l.trim())
                        .filter((l) => l.length > 0);
                      form.setValue(`experience.${index}.bullets`, cleaned, {
                        shouldValidate: true,
                        shouldDirty: true,
                      });
                    }}
                    rows={4}
                  />
                </label>
              </div>
            ))}
          </section>
        </form>
      </div>
    </div>
      <ResumePhotoModal
        isOpen={photoModalOpen}
        imageSrc={photoModalSrc}
        onClose={closePhotoModal}
        onApply={(jpeg) => {
          form.setValue("photoDataUrl", jpeg);
          void form.trigger("photoDataUrl");
          closePhotoModal();
        }}
      />
    </div>
  );
}
