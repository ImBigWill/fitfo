import { createTheme } from "./theme.js";
import { kv, numbered, panel, renderAppHeader, renderSurface } from "./ui.js";

export function buildBrief(scan) {
  const { domain, http, analysis } = scan;
  const connectedServices = analysis.connectedServices || [];
  const marketing = analysis.marketing?.found || [];
  const subdomains = scan.dns.subdomains || [];
  const site = scan.site || {};
  const siteSummary = site.summary || {};

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
      ["Deep crawl", site.enabled ? `${siteSummary.pagesScanned || 0} page(s)` : "Not enabled"],
      ["Forms found", site.enabled ? String(siteSummary.formsDetected || 0) : "Not checked"],
      ["Schema", site.enabled && siteSummary.schemaTypes?.length ? siteSummary.schemaTypes.join(", ") : "Not detected"],
    ],
    siteIntelligence: buildSiteIntelligence(scan),
    suggestedStructure: buildSuggestedStructure(scan),
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
    panel(theme, "Site Intelligence", brief.siteIntelligence.map((item) => `${theme.bullet("›")} ${theme.label(item.label)} ${theme.dim(item.detail)}`)),
    "",
    panel(theme, "Suggested Site Structure", brief.suggestedStructure.map((item) => `${theme.bullet("›")} ${theme.label(item.path)} ${theme.dim(item.reason)}`)),
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
    "## Site Intelligence",
    "",
    ...brief.siteIntelligence.map((item) => `- **${item.label}:** ${item.detail}`),
    "",
    "## Suggested Site Structure",
    "",
    ...brief.suggestedStructure.map((item) => `- **${item.path}:** ${item.reason}`),
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

function buildSiteIntelligence(scan) {
  const site = scan.site || {};
  if (!site.enabled) {
    return [{
      label: "Deep crawl",
      detail: "Not enabled. Run with --deep to inspect sitemap pages, headings, CTAs, forms, schema, and content gaps.",
    }];
  }

  const summary = site.summary || {};
  const items = [
    {
      label: "Pages crawled",
      detail: `${summary.pagesScanned || 0} page(s) from sitemap and priority URLs.`,
    },
    {
      label: "Metadata",
      detail: `${summary.pagesWithMetaDescription || 0}/${summary.pagesScanned || 0} crawled page(s) have meta descriptions.`,
    },
    {
      label: "Headings",
      detail: `${summary.pagesMissingH1 || 0} missing H1; ${summary.pagesWithMultipleH1 || 0} with multiple H1s.`,
    },
    {
      label: "Lead paths",
      detail: `${summary.formsDetected || 0} form(s), ${summary.phonesDetected?.length || 0} phone number(s), ${summary.ctas?.length || 0} CTA label(s) detected.`,
    },
    {
      label: "Schema",
      detail: summary.schemaTypes?.length ? summary.schemaTypes.join(", ") : "No JSON-LD schema types detected in crawled pages.",
    },
  ];

  for (const recommendation of site.recommendations || []) {
    items.push({
      label: "Recommendation",
      detail: recommendation,
    });
  }

  return items;
}

function buildSuggestedStructure(scan) {
  const pages = scan.site?.pages || [];
  const hasContact = hasPath(pages, "contact");
  const hasReviews = hasPath(pages, "review") || hasPath(pages, "testimonial");
  const hasServices = hasPath(pages, "service");
  const hasLocations = hasPath(pages, "location") || hasPath(pages, "area");
  const structure = [
    { path: "/", reason: "Clarify primary offer, service area, proof, and conversion path." },
    { path: "/services/", reason: hasServices ? "Consolidate and organize existing service content." : "Create a clear hub for all major revenue-driving services." },
    { path: "/services/{service}/", reason: "Build one focused page per important service for SEO, clarity, and sales conversations." },
    { path: "/contact/", reason: hasContact ? "Audit forms, phone routing, and tracking." : "Add a dedicated conversion page with phone, form, and service-area expectations." },
  ];

  if (!hasLocations) {
    structure.push({ path: "/locations/{city}/", reason: "Add local landing pages only where the business actually serves and can support them." });
  }
  if (!hasReviews) {
    structure.push({ path: "/reviews/", reason: "Centralize trust proof from reviews, testimonials, and project outcomes." });
  }

  structure.push(
    { path: "/about/", reason: "Explain credibility, team, process, and why clients should trust the business." },
    { path: "/faq/", reason: "Answer sales objections and support long-tail search demand." },
  );

  return structure;
}

function buildResearchQueue(scan) {
  return [
    {
      area: "SEO",
      task: scan.site?.enabled
        ? "Use crawled metadata/headings/schema to prioritize service, location, and FAQ page improvements."
        : "Run --deep to review title, meta description, H1s, sitemap, robots.txt, schema, service pages, and local landing pages.",
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

function hasPath(pages, needle) {
  return pages.some((page) => page.path?.toLowerCase().includes(needle));
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
