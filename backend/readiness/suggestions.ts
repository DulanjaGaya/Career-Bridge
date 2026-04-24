/**
 * Lightweight "AI-style" phrasing helper for demo / offline use.
 * Replace with OpenAI or another NLP API by swapping this function.
 */
export function suggestAchievementPhrasing(raw: string): string {
  const text = raw.trim();
  if (!text) return "";

  let s = text.replace(/\s+/g, " ");
  const lower = s.toLowerCase();

  const starters = [
    "Delivered",
    "Led",
    "Improved",
    "Designed",
    "Implemented",
    "Collaborated to deliver",
  ];
  const starter =
    starters[Math.abs(hashString(lower)) % starters.length] ?? "Delivered";

  if (!/^(led|built|created|made|did|worked|helped)/i.test(s)) {
    s = `${starter} ${decapitalizeFirst(s)}`;
  }

  s = s.replace(/\bi\b/g, "I");
  s = s.replace(/\b(java|python|react|node\.?js|sql)\b/gi, (m) => m.toUpperCase());

  if (!/[.!?]$/.test(s)) s += ".";

  return s;
}

function decapitalizeFirst(str: string): string {
  if (!str) return str;
  return str.charAt(0).toLowerCase() + str.slice(1);
}

function hashString(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h << 5) - h + str.charCodeAt(i);
  return h | 0;
}

function isLikelyGibberish(text: string): boolean {
  const letters = text.replace(/[^a-zA-Z]/g, "");
  if (letters.length < 4) return false;
  const vowels = (letters.match(/[aeiou]/gi) || []).length;
  if (vowels === 0 && letters.length > 4) return true;
  if (letters.length > 6 && vowels / letters.length < 0.08) return true;
  return false;
}

function defaultProfessionalSummary(): string {
  const variants = [
    "Results-oriented professional who translates ambiguous requirements into clear roadmaps and shipped product. " +
      "Brings a disciplined approach to software delivery—testing, documentation, and stakeholder alignment are built in, not bolted on. " +
      "Thrives in collaborative environments where ownership, constructive feedback, and measurable outcomes matter. " +
      "Seeking a role where technical depth and communication equally drive impact.",
    "Strategic problem-solver with a bias for execution and continuous improvement. " +
      "Comfortable owning features end-to-end: discovery, design trade-offs, implementation, and production support. " +
      "Partners effectively with product, design, and operations to reduce rework and accelerate time-to-value. " +
      "Looking to contribute to a team that values craft, clarity, and customer-centric delivery.",
    "Analytical builder focused on reliable systems, clean interfaces between teams, and data-informed decisions. " +
      "Experienced in breaking down complex work into milestones, managing risk, and communicating progress to technical and non-technical audiences. " +
      "Committed to mentoring, code quality, and sustainable pace over heroics. " +
      "Open to roles that reward initiative, cross-functional collaboration, and long-term growth.",
  ];
  return variants[Math.abs(hashString("default-pro-summary")) % variants.length] ?? variants[0];
}

/** Longer matches first. */
const TECH_TERMS: [RegExp, string][] = [
  [/\bnode\.?js\b/gi, "Node.js"],
  [/\bmachine learning\b/gi, "machine learning"],
  [/\btypescript\b/gi, "TypeScript"],
  [/\bjavascript\b/gi, "JavaScript"],
  [/\bpostgresql\b/gi, "PostgreSQL"],
  [/\bmongodb\b/gi, "MongoDB"],
  [/\bgraphql\b/gi, "GraphQL"],
  [/\bkubernetes\b/gi, "Kubernetes"],
  [/\bterraform\b/gi, "Terraform"],
  [/\bansible\b/gi, "Ansible"],
  [/\bjenkins\b/gi, "Jenkins"],
  [/\bangular\b/gi, "Angular"],
  [/\bvue\.?js\b/gi, "Vue.js"],
  [/\bnext\.?js\b/gi, "Next.js"],
  [/\bexpress\b/gi, "Express"],
  [/\bfastapi\b/gi, "FastAPI"],
  [/\bspring\s*boot\b/gi, "Spring Boot"],
  [/\bspring\b/gi, "Spring"],
  [/\bdjango\b/gi, "Django"],
  [/\bflask\b/gi, "Flask"],
  [/\bredis\b/gi, "Redis"],
  [/\belasticsearch\b/gi, "Elasticsearch"],
  [/\bmicroservices?\b/gi, "microservices"],
  [/\bci\s*\/\s*cd\b/gi, "CI/CD"],
  [/\breact\b/gi, "React"],
  [/\bpython\b/gi, "Python"],
  [/\bjava\b/gi, "Java"],
  [/\bc\+\+\b/gi, "C++"],
  [/\bc#\b/gi, "C#"],
  [/\b\.net\b/gi, ".NET"],
  [/\bgo\b/gi, "Go"],
  [/\brust\b/gi, "Rust"],
  [/\bsql\b/gi, "SQL"],
  [/\baws\b/gi, "AWS"],
  [/\bazure\b/gi, "Azure"],
  [/\bgcp\b/gi, "GCP"],
  [/\bdocker\b/gi, "Docker"],
  [/\bkafka\b/gi, "Kafka"],
  [/\brest\s*api\b/gi, "REST APIs"],
  [/\bapi\b/gi, "APIs"],
];

function normalizeTechCasing(s: string): string {
  let out = s;
  for (const [re, rep] of TECH_TERMS) {
    out = out.replace(re, rep);
  }
  return out;
}

function extractTechFromText(text: string): string[] {
  const found = new Set<string>();
  const lower = text.toLowerCase();
  for (const [re, label] of TECH_TERMS) {
    const m = lower.match(re);
    if (m) found.add(label);
  }
  return [...found];
}

function extractExperienceYears(text: string): string | null {
  const m = text.match(/\b(\d+)\+?\s*(years?|yrs?|yr\.)\b/i);
  if (m) return `${m[1]}+ years`;
  const m2 = text.match(/\b(\d+)\s*years?\s+(of\s+)?experience\b/i);
  if (m2) return `${m2[1]} years`;
  return null;
}

function casualToProfessional(sentence: string): string {
  let t = sentence.trim();
  const subs: [RegExp, string][] = [
    [/\bworked on\b/gi, "delivered work on"],
    [/\bmade a\b/gi, "built a"],
    [/\bmade\b/gi, "developed"],
    [/\bwas doing\b/gi, "focused on"],
    [/\bdid\b/gi, "executed"],
    [/\bhelped with\b/gi, "contributed to"],
    [/\bknow how to\b/gi, "skilled at"],
    [/\blike to\b/gi, "aim to"],
    [/\bwant to\b/gi, "seek to"],
    [/\btrying to\b/gi, "working to"],
  ];
  for (const [re, rep] of subs) t = t.replace(re, rep);
  return t;
}

function inferRoleDescriptor(lower: string): string {
  if (/\bdata\s*(scientist|analyst|engineer)\b/.test(lower)) return "data-focused professional";
  if (/\bdevops|sre\b/.test(lower)) return "DevOps-minded engineer";
  if (/\b(full[\s-]?stack|fullstack)\b/.test(lower)) return "full-stack engineer";
  if (/\bfront[\s-]?end|frontend\b/.test(lower)) return "frontend engineer";
  if (/\bback[\s-]?end|backend\b/.test(lower)) return "backend engineer";
  if (/\bsoftware\s*(engineer|developer)\b/.test(lower)) return "software engineer";
  if (/\bweb\s*(dev|developer)\b/.test(lower)) return "web developer";
  if (/\bstudent|undergraduate|graduate\b/.test(lower)) return "driven emerging professional";
  if (/\bintern(ship)?\b/.test(lower)) return "motivated early-career professional";
  return "results-driven professional";
}

function buildStackSentence(techs: string[], h: number): string | null {
  if (techs.length === 0) return null;
  const t = techs.slice(0, 6);
  const list =
    t.length === 1
      ? t[0]
      : t.length === 2
        ? `${t[0]} and ${t[1]}`
        : `${t.slice(0, -1).join(", ")}, and ${t[t.length - 1]}`;
  const frames = [
    `Technical toolkit centers on ${list}, with emphasis on writing maintainable code and reducing operational risk.`,
    `Hands-on experience across ${list}, applying pragmatic architecture, automated testing, and observable deployments where it matters.`,
    `Regularly ships features using ${list}, balancing performance, security, and clarity for both users and teammates.`,
  ];
  return frames[h % frames.length] ?? frames[0];
}

function buildDomainSentence(lower: string, h: number): string | null {
  const hits: string[] = [];
  const map: [RegExp, string][] = [
    [/\b(fintech|finance|banking)\b/i, "regulated and security-conscious delivery"],
    [/\b(health|healthcare|medical)\b/i, "mission-critical systems with compliance in mind"],
    [/\b(e-?commerce|retail)\b/i, "high-traffic customer-facing experiences"],
    [/\b(saas|b2b|enterprise)\b/i, "enterprise SaaS and stakeholder-heavy environments"],
    [/\b(startup|scale-?up)\b/i, "fast-moving product teams with tight feedback loops"],
    [/\b(agile|scrum|kanban)\b/i, "iterative delivery with Agile practices"],
  ];
  for (const [re, phrase] of map) {
    if (re.test(lower)) hits.push(phrase);
  }
  if (hits.length === 0) return null;
  const pick = hits[h % hits.length] ?? hits[0];
  return `Comfortable operating in contexts that demand ${pick}.`;
}

function polishExistingParagraph(s: string): string {
  let t = s.replace(/\bi\b/g, "I");
  t = normalizeTechCasing(t);
  const parts = t
    .split(/(?<=[.!?])\s+/)
    .map((x) => casualToProfessional(x.trim()))
    .filter(Boolean);
  if (parts.length === 0) return t;
  return parts.map((p) => (p.endsWith(".") || p.endsWith("!") || p.endsWith("?") ? p : `${p}.`)).join(" ");
}

/**
 * Richer rule-based professional summary (demo). Swap for a real LLM when you need nuance.
 */
export function suggestProfessionalSummary(raw: string): string {
  const text = raw.trim().replace(/\s+/g, " ");
  if (!text) {
    return defaultProfessionalSummary();
  }
  if (isLikelyGibberish(text)) {
    return defaultProfessionalSummary();
  }

  const lower = text.toLowerCase();
  const h = Math.abs(hashString(lower));
  const techs = extractTechFromText(text);
  const years = extractExperienceYears(text);
  const role = inferRoleDescriptor(lower);

  let s = text.replace(/\bi\b/g, "I");
  s = normalizeTechCasing(s);

  const sentences = s
    .split(/(?<=[.!?])\s+/)
    .map((x) => x.trim())
    .filter(Boolean);

  /** User already wrote a full block — polish instead of discarding. */
  if (sentences.length >= 3 && sentences.every((x) => x.length > 35)) {
    const polished = polishExistingParagraph(s);
    const segments: string[] = [polished];
    const stack = buildStackSentence(techs, h);
    if (stack && techs.length > 0 && !techs.some((t) => polished.toLowerCase().includes(t.toLowerCase()))) {
      segments.push(stack);
    }
    const domain = buildDomainSentence(lower, h);
    if (domain && !polished.toLowerCase().includes(domain.slice(0, 28).toLowerCase())) {
      segments.push(domain);
    }
    return segments.join(" ").replace(/\s+/g, " ").trim().slice(0, 2000);
  }

  /** Two sentences: expand with stack + closing */
  if (sentences.length === 2) {
    const polished = polishExistingParagraph(s);
    const stack = buildStackSentence(techs, h);
    const closings = [
      "Known for clear written communication, constructive code review, and owning outcomes through production.",
      "Partners with stakeholders to clarify success metrics, de-risk scope, and ship incrementally without sacrificing quality.",
      "Brings structure to ambiguity: measurable goals, traceable decisions, and pragmatic trade-offs under time pressure.",
    ];
    const close = closings[h % closings.length] ?? closings[0];
    const parts = [polished];
    if (stack) parts.push(stack);
    parts.push(close);
    return parts.join(" ").replace(/\s+/g, " ").trim().slice(0, 2000);
  }

  /** Short notes / fragments → full executive-style summary */
  const userCore = casualToProfessional(s);
  const coreSentence = (() => {
    let c = userCore.trim();
    if (!c) return "";
    if (!/[.!?]$/.test(c)) c += ".";
    if (!/^[A-Z]/.test(c)) c = c.charAt(0).toUpperCase() + c.slice(1);
    return c;
  })();

  const introFrames = years
    ? [
        `${role.charAt(0).toUpperCase() + role.slice(1)} with ${years} of experience shipping reliable software and aligning engineering work to business outcomes.`,
        `Accomplished ${role} combining ${years} of hands-on delivery with strong judgment on scope, quality, and timelines.`,
        `${role.charAt(0).toUpperCase() + role.slice(1)} (${years}) focused on measurable impact—clean interfaces, stable releases, and transparent communication.`,
      ]
    : [
        `${role.charAt(0).toUpperCase() + role.slice(1)} who bridges product intent and technical execution, from discovery through deployment.`,
        `Sharp, accountable ${role} with a track record of turning rough ideas into tested, maintainable solutions.`,
        `${role.charAt(0).toUpperCase() + role.slice(1)} valued for systems thinking, attention to detail, and calm execution under pressure.`,
      ];

  const intro = introFrames[h % introFrames.length] ?? introFrames[0];

  const stackLine = buildStackSentence(techs, h + 1);
  const domainLine = buildDomainSentence(lower, h + 2);

  const valueProps = [
    "Routinely collaborates across engineering, product, and design to reduce rework and shorten feedback cycles.",
    "Prioritizes observability, automated checks, and incremental rollout so teams can move quickly without gambling on production stability.",
    "Translates technical constraints into options stakeholders can act on—trade-offs stated plainly, risks surfaced early.",
  ];
  const value = valueProps[h % valueProps.length] ?? valueProps[0];

  const closings = [
    "Open to opportunities where technical excellence and stakeholder trust go hand in hand.",
    "Ready to contribute on day one: clear ownership, proactive communication, and a mindset geared toward sustainable delivery.",
    "Interested in roles that reward initiative, mentorship, and continuous learning alongside shipping great product.",
  ];
  const closing = closings[h % closings.length] ?? closings[0];

  const segments: string[] = [intro];
  if (coreSentence && coreSentence.length > 8) {
    segments.push(`Background and focus: ${coreSentence}`);
  }
  if (stackLine) segments.push(stackLine);
  if (domainLine) segments.push(domainLine);
  segments.push(value);
  segments.push(closing);

  return segments.join(" ").replace(/\s+/g, " ").trim().slice(0, 2000);
}
