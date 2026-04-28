import { buildBrief } from "./brief.js";
import { createTheme } from "./theme.js";
import { kv, panel, renderAppHeader, renderSurface } from "./ui.js";

export function buildClientPlan(scan) {
  const brief = buildBrief(scan);
  return {
    subject: scan.domain.apex,
    generatedAt: scan.finishedAt,
    priorities: buildPriorities(scan),
    structure: brief.suggestedStructure,
    workstreams: buildWorkstreams(scan),
    questions: brief.callQuestions,
  };
}

export function renderPlanText(scan, options = {}) {
  const theme = createTheme(options.color !== false);
  const plan = buildClientPlan(scan);

  return renderSurface(theme, [
    renderAppHeader(theme, {
      mode: "client build plan",
      scope: "site structure + onboarding priorities",
      motto: "Kickstarting onboarding.",
    }),
    "",
    panel(theme, "Plan Snapshot", [
      kv(theme, "Target", plan.subject),
      kv(theme, "Generated", plan.generatedAt),
      kv(theme, "Basis", scan.site?.enabled ? "Technical scan + deep crawl" : "Technical scan; run --deep for stronger site planning"),
      kv(theme, "Research", scan.research?.enabled ? "Search enabled" : "Search not enabled"),
    ]),
    "",
    panel(theme, "Focus First", plan.priorities.map((item) => `${theme.bullet("›")} ${theme.label(item.label)} ${theme.dim(item.reason)}`)),
    "",
    panel(theme, "Recommended Structure", plan.structure.map((item) => `${theme.bullet("›")} ${theme.label(item.path)} ${theme.dim(item.reason)}`)),
    "",
    panel(theme, "Build Workstreams", plan.workstreams.map((item) => `${theme.bullet("›")} ${theme.label(item.name)} ${theme.dim(item.scope)}`)),
    "",
    panel(theme, "Confirm Before Build", plan.questions.map((question) => `${theme.bullet("›")} ${question}`)),
  ].join("\n"));
}

export function renderPlanMarkdown(scan, options = {}) {
  const plan = buildClientPlan(scan);
  const reportType = options.obsidian ? "obsidian-plan" : "plan";

  return `${[
    "---",
    `title: "FITFO Plan - ${yamlString(plan.subject)}"`,
    `domain: "${yamlString(plan.subject)}"`,
    `generated_at: "${yamlString(plan.generatedAt)}"`,
    `report_type: "${reportType}"`,
    "tags:",
    "  - fitfo",
    "  - client-plan",
    "  - site-structure",
    "---",
    "",
    `# FITFO Plan - ${plan.subject}`,
    "",
    "**Kickstarting onboarding.**",
    "",
    "## Focus First",
    "",
    ...plan.priorities.map((item) => `- **${item.label}:** ${item.reason}`),
    "",
    "## Recommended Structure",
    "",
    ...plan.structure.map((item) => `- **${item.path}:** ${item.reason}`),
    "",
    "## Build Workstreams",
    "",
    ...plan.workstreams.map((item) => `- **${item.name}:** ${item.scope}`),
    "",
    "## Confirm Before Build",
    "",
    ...plan.questions.map((question) => `- ${question}`),
    "",
  ].join("\n")}\n`;
}

function buildPriorities(scan) {
  const priorities = [
    {
      label: "Access and ownership",
      reason: "Secure domain, DNS, hosting, CMS, email, analytics, forms, and previous-developer handoff before changing anything.",
    },
    {
      label: "Measurement",
      reason: "Confirm GA4, Search Console, Tag Manager, call tracking, form routing, CRM, and campaign ownership early.",
    },
  ];

  if (scan.site?.enabled) {
    priorities.push({
      label: "Structure",
      reason: "Use crawled pages to decide which service, location, proof, FAQ, and contact pages need to exist or be rebuilt.",
    });
  } else {
    priorities.push({
      label: "Deep crawl",
      reason: "Run `fitfo plan domain.com --deep` before finalizing the sitemap or content scope.",
    });
  }

  if (scan.research?.enabled) {
    priorities.push({
      label: "Market proof",
      reason: "Use search results to validate competitor language, review signals, service demand, and positioning gaps.",
    });
  } else {
    priorities.push({
      label: "Market research",
      reason: "Run with `--search --location` to add Firecrawl-backed market, review, and service SERP signals.",
    });
  }

  return priorities;
}

function buildWorkstreams(scan) {
  return [
    {
      name: "Access handoff",
      scope: "Collect logins/invites, billing ownership, backups, DNS records, analytics, and emergency contacts.",
    },
    {
      name: "Technical foundation",
      scope: "Resolve hosting/DNS uncertainty, SSL, redirects, WordPress/plugin risks, performance, and launch QA.",
    },
    {
      name: "Site architecture",
      scope: "Define homepage, service pages, location pages, proof pages, FAQ, and contact/conversion flows.",
    },
    {
      name: "Content and proof",
      scope: "Gather differentiators, photos, reviews, project examples, FAQs, offer details, and service-area language.",
    },
    {
      name: "Tracking and conversion",
      scope: "Wire GA4/GTM/Search Console, forms, calls, CRM, ads, and reporting before launch.",
    },
  ];
}

function yamlString(value) {
  return String(value ?? "").replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}
