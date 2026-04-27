import { createTheme } from "./theme.js";
import { kv, numbered, panel, renderAppHeader, renderSurface } from "./ui.js";

export function buildBrief(scan) {
  const { domain, http, analysis } = scan;
  const connectedServices = analysis.connectedServices || [];
  const marketing = analysis.marketing?.found || [];
  const subdomains = scan.dns.subdomains || [];

  return {
    subject: domain.apex,
    generatedAt: scan.finishedAt,
    snapshot: [
      ["Website", http.reachable ? "Reachable" : "Not reachable during scan"],
      ["Title", http.title || "Unknown"],
      ["CMS", `${analysis.cms.platform} (${analysis.cms.confidence})`],
      ["Hosting", `${analysis.hosting.provider} (${analysis.hosting.confidence})`],
      ["Email", analysis.email.provider],
      ["Marketing tags", marketing.length ? marketing.join(", ") : "None detected"],
      ["Connected services", connectedServices.length ? connectedServices.join(", ") : "None detected"],
      ["Subdomains found", String(subdomains.length)],
    ],
    confirmations: buildConfirmations(scan),
    researchQueue: buildResearchQueue(scan),
    opportunityQueue: buildOpportunityQueue(scan),
    callQuestions: buildCallQuestions(scan),
  };
}

export function renderBriefText(scan, options = {}) {
  const theme = createTheme(options.color !== false);
  const brief = buildBrief(scan);

  const lines = [
    renderAppHeader(theme, {
      mode: "first-call brief",
      scope: "public website signals + onboarding questions",
      motto: "Kickstarting onboarding.",
    }),
    "",
    panel(theme, "Brief Snapshot", [
      kv(theme, "Target", brief.subject),
      kv(theme, "Generated", brief.generatedAt),
      ...brief.snapshot.map(([label, value]) => kv(theme, label, value)),
    ]),
    "",
    panel(theme, "Confirm On The Call", brief.confirmations.flatMap((item, index) => numbered(theme, index + 1, item.label, item.detail))),
    "",
    panel(theme, "Research Queue", brief.researchQueue.map((item) => `${theme.bullet("›")} ${theme.label(item.area)} ${theme.dim(item.task)}`)),
    "",
    panel(theme, "Opportunities To Inspect", brief.opportunityQueue.map((item) => `${theme.bullet("›")} ${theme.label(item.area)} ${theme.dim(item.task)}`)),
    "",
    panel(theme, "First-Call Questions", brief.callQuestions.map((question) => `${theme.bullet("›")} ${question}`)),
  ];

  return renderSurface(theme, lines.join("\n"));
}

export function renderBriefMarkdown(scan, options = {}) {
  const brief = buildBrief(scan);
  const reportType = options.obsidian ? "obsidian-brief" : "brief";

  return `${[
    "---",
    `title: "FITFO Brief - ${yamlString(brief.subject)}"`,
    `domain: "${yamlString(brief.subject)}"`,
    `generated_at: "${yamlString(brief.generatedAt)}"`,
    `report_type: "${reportType}"`,
    "tags:",
    "  - fitfo",
    "  - client-brief",
    "  - first-call-prep",
    "---",
    "",
    `# FITFO Brief - ${brief.subject}`,
    "",
    "**Kickstarting onboarding.**",
    "",
    "## Snapshot",
    "",
    markdownTable(brief.snapshot),
    "",
    "## Confirm On The Call",
    "",
    ...brief.confirmations.flatMap((item) => [
      `- [ ] **${item.label}**`,
      `  ${item.detail}`,
    ]),
    "",
    "## Research Queue",
    "",
    ...brief.researchQueue.map((item) => `- **${item.area}:** ${item.task}`),
    "",
    "## Opportunities To Inspect",
    "",
    ...brief.opportunityQueue.map((item) => `- **${item.area}:** ${item.task}`),
    "",
    "## First-Call Questions",
    "",
    ...brief.callQuestions.map((question) => `- ${question}`),
    "",
  ].join("\n")}\n`;
}

function buildConfirmations(scan) {
  const { analysis } = scan;
  const confirmations = [
    {
      label: "Access ownership",
      detail: "Confirm who owns domain, DNS, hosting, CMS, email, analytics, and marketing accounts.",
    },
    {
      label: "Business goals",
      detail: "Ask what a successful website engagement should change: leads, calls, bookings, recruiting, trust, speed, search visibility, or operations.",
    },
    {
      label: "Current pain",
      detail: "Ask what is broken, slow, confusing, hard to update, or generating bad leads today.",
    },
  ];

  if (analysis.hosting.provider === "Unknown" || analysis.hosting.provider === "Hidden behind Cloudflare") {
    confirmations.push({
      label: "Origin hosting",
      detail: "Public records did not clearly identify the host. Confirm where files, backups, and deployments live.",
    });
  }

  if (analysis.cms.platform === "WordPress") {
    confirmations.push({
      label: "WordPress operations",
      detail: "Confirm admin access, update ownership, plugin risks, backups, forms, and who can approve theme or plugin changes.",
    });
  }

  return confirmations;
}

function buildResearchQueue(scan) {
  return [
    {
      area: "SEO",
      task: "Review title, meta description, H1s, sitemap, robots.txt, schema, service pages, and local landing pages.",
    },
    {
      area: "Positioning",
      task: "Identify the primary audience, service area, strongest differentiators, proof points, and reasons clients choose them.",
    },
    {
      area: "Conversion",
      task: "Inspect calls to action, forms, phone tracking, booking paths, mobile friction, and lead-routing handoff.",
    },
    {
      area: "Content",
      task: `Use the current page title (${scan.http.title || "unknown"}) as a starting clue, then validate messaging with the client.`,
    },
    {
      area: "Measurement",
      task: "Confirm GA4, Search Console, Tag Manager, ads, call tracking, forms, CRM, and campaign attribution ownership.",
    },
  ];
}

function buildOpportunityQueue(scan) {
  const opportunities = [
    {
      area: "Trust",
      task: "Look for reviews, testimonials, project photos, credentials, guarantees, case studies, and visible proof.",
    },
    {
      area: "Technical",
      task: "Check redirects, SSL, speed, indexing, mobile usability, broken tracking, and stale WordPress/plugin risks.",
    },
    {
      area: "Information architecture",
      task: "Map whether services, locations, FAQs, pricing/process, and contact paths are easy to find.",
    },
  ];

  if ((scan.dns.subdomains || []).length > 0) {
    opportunities.push({
      area: "Subdomains",
      task: "Review discovered subdomains for staging sites, portals, shops, booking flows, CRMs, or legacy tools.",
    });
  }

  return opportunities;
}

function buildCallQuestions(scan) {
  const questions = [
    "What are the top three things the current website needs to do better?",
    "Which services, locations, or customer types matter most right now?",
    "What leads are valuable, and what leads are a waste of time?",
    "What tools receive website leads today: email, CRM, forms, booking, call tracking, or something else?",
    "Who approves content, technical access, DNS changes, and launch decisions?",
    "Are there campaigns, seasonal pushes, or offline sales processes the website needs to support?",
  ];

  if (scan.analysis.marketing?.found?.length) {
    questions.push(`FITFO detected ${scan.analysis.marketing.found.join(", ")}. Who owns those accounts, and should they stay active?`);
  }

  return questions;
}

function markdownTable(rows) {
  return [
    "| Field | Value |",
    "| --- | --- |",
    ...rows.map(([key, value]) => `| ${escapeTable(key)} | ${escapeTable(value)} |`),
  ].join("\n");
}

function yamlString(value) {
  return String(value ?? "").replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function escapeTable(value) {
  return String(value ?? "").replace(/\|/g, "\\|").replace(/\n/g, "<br>");
}
