import { buildBrief } from "./brief.js";
import { createTheme } from "./theme.js";
import { kv, panel, renderAppHeader, renderSurface } from "./ui.js";

export function buildClientPlan(scan) {
  const brief = buildBrief(scan);
  return {
    subject: scan.domain.apex,
    generatedAt: scan.finishedAt,
    infrastructureSnapshot: brief.infrastructureSnapshot,
    loginChecklist: brief.loginChecklist,
    priorities: buildPriorities(scan),
    structure: brief.suggestedStructure,
    competitorStructure: brief.competitorStructure,
    reputationSummary: brief.reputationSummary,
    serviceLocationRecommendations: brief.serviceLocationRecommendations,
    topLocalCompetitors: brief.actionReport.competitorResearch?.topLocalCompetitors || [],
    workstreams: buildWorkstreams(scan),
    launchChecklist: buildPlanLaunchChecklist(scan),
    kickoffResearch: brief.kickoffResearch,
    actionReport: brief.actionReport,
    clientCallIntelligence: brief.clientCallIntelligence,
    confirmationScript: brief.confirmationScript,
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
    panel(theme, "Infrastructure Snapshot", formatInfrastructureSnapshot(theme, plan.infrastructureSnapshot)),
    "",
    panel(theme, "Login / Access Checklist", formatLoginChecklist(theme, plan.loginChecklist)),
    "",
    panel(theme, "Evidence Labels", [
      `${theme.bullet("›")} ${theme.label("Observed")} ${theme.dim("Found in DNS, HTTP, sitemap/page crawl, or visible site signals.")}`,
      `${theme.bullet("›")} ${theme.label("Research")} ${theme.dim("Found through Firecrawl-backed web/search results.")}`,
      `${theme.bullet("›")} ${theme.label("Inferred")} ${theme.dim("Reasonable planning hypothesis that needs validation.")}`,
      `${theme.bullet("›")} ${theme.label("Ask Client")} ${theme.dim("Do not assume; confirm with client or previous developer.")}`,
    ]),
    "",
    panel(theme, "Focus First", plan.priorities.map((item) => `${theme.bullet("›")} ${theme.label(item.label)} ${theme.dim(item.reason)}`)),
    "",
    panel(theme, "Recommended Structure", plan.structure.map((item) => `${theme.bullet("›")} ${theme.label(item.path)} ${theme.dim(item.reason)}`)),
    "",
    panel(theme, "Competitor-Informed Structure", plan.competitorStructure.map((item) => `${theme.bullet("›")} ${theme.label(item.path)} ${theme.chip(`[${item.priority}]`)} ${theme.dim(`${item.trigger}: ${item.rationale}`)}`)),
    "",
    panel(theme, "Top Local Competitors To Review", formatTopLocalCompetitors(theme, plan.topLocalCompetitors)),
    "",
    panel(theme, "Review + Reputation Summary", plan.reputationSummary.map((item) => `${theme.bullet("›")} ${theme.label(item.channel)} ${theme.dim(`${item.signal} | ${item.action}`)}`)),
    "",
    panel(theme, "Service + Location Recommendations", plan.serviceLocationRecommendations.map((item) => `${theme.bullet("›")} ${theme.label(item.page)} ${theme.chip(`[${item.priority}]`)} ${theme.dim(`${item.type}: ${item.focus}. ${item.recommendation}`)}`)),
    "",
    panel(theme, "Build Workstreams", plan.workstreams.map((item) => `${theme.bullet("›")} ${theme.label(item.name)} ${theme.dim(item.scope)}`)),
    "",
    panel(theme, "Launch Checklist", plan.launchChecklist.map((item) => `${theme.bullet("›")} ${theme.label(item.item)} ${theme.chip(`[${item.phase}]`)} ${theme.dim(item.detail)}`)),
    "",
    panel(theme, "Kickoff Research Game Plan", formatPlanResearch(theme, plan.kickoffResearch)),
    "",
    panel(theme, "Prioritized Action Report", formatPlanActions(theme, plan.actionReport)),
    "",
    panel(theme, "Keyword Page Map", formatPlanPageMap(theme, plan.actionReport)),
    "",
    panel(theme, "Client Call Next Steps", plan.clientCallIntelligence.map((item) => `${theme.bullet("›")} ${theme.label(item.prompt)} ${theme.dim(item.nextStep)}`)),
    "",
    panel(theme, "Kickoff Confirmation Script", plan.confirmationScript.map((item) => `${theme.bullet("›")} ${theme.label(item.topic)} ${theme.dim(`${item.ask} ${item.why}`)}`)),
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
    "## Infrastructure Snapshot",
    "",
    markdownInfrastructureSnapshot(plan.infrastructureSnapshot),
    "",
    "## Login / Access Checklist",
    "",
    markdownLoginChecklist(plan.loginChecklist),
    "",
    "## Evidence Labels",
    "",
    "- **Observed:** Found in DNS, HTTP, sitemap/page crawl, or visible site signals.",
    "- **Research:** Found through Firecrawl-backed web/search results.",
    "- **Inferred:** Reasonable planning hypothesis that needs validation.",
    "- **Ask Client:** Do not assume; confirm with client or previous developer.",
    "",
    "## Focus First",
    "",
    ...plan.priorities.map((item) => `- **${item.label}:** ${item.reason}`),
    "",
    "## Recommended Structure",
    "",
    ...plan.structure.map((item) => `- **${item.path}:** ${item.reason}`),
    "",
    "## Competitor-Informed Structure",
    "",
    markdownTableWithHeaders(["Priority", "Path", "Trigger", "Rationale"], plan.competitorStructure.map((item) => [
      item.priority,
      item.path,
      item.trigger,
      item.rationale,
    ])),
    "",
    "## Top Local Competitors To Review",
    "",
    markdownTopLocalCompetitors(plan.topLocalCompetitors),
    "",
    "## Review + Reputation Summary",
    "",
    markdownTableWithHeaders(["Channel", "Signal", "Action"], plan.reputationSummary.map((item) => [
      item.channel,
      item.signal,
      item.action,
    ])),
    "",
    "## Service + Location Recommendations",
    "",
    markdownTableWithHeaders(["Priority", "Type", "Page", "Focus", "Recommendation"], plan.serviceLocationRecommendations.map((item) => [
      item.priority,
      item.type,
      item.page,
      item.focus,
      item.recommendation,
    ])),
    "",
    "## Build Workstreams",
    "",
    ...plan.workstreams.map((item) => `- **${item.name}:** ${item.scope}`),
    "",
    "## Launch Checklist",
    "",
    markdownTableWithHeaders(["Phase", "Item", "Detail"], plan.launchChecklist.map((item) => [
      item.phase,
      item.item,
      item.detail,
    ])),
    "",
    "## Kickoff Research Game Plan",
    "",
    ...markdownPlanResearch(plan.kickoffResearch),
    "",
    "## Prioritized Action Report",
    "",
    ...markdownPlanActions(plan.actionReport),
    "",
    "## Keyword Page Map",
    "",
    ...markdownPlanPageMap(plan.actionReport),
    "",
    "## Client Call Next Steps",
    "",
    ...plan.clientCallIntelligence.map((item) => `- **${item.prompt}:** ${item.nextStep}`),
    "",
    "## Kickoff Confirmation Script",
    "",
    markdownTableWithHeaders(["Topic", "Ask", "Why"], plan.confirmationScript.map((item) => [
      item.topic,
      item.ask,
      item.why,
    ])),
    "",
    "## Confirm Before Build",
    "",
    ...plan.questions.map((question) => `- ${question}`),
    "",
  ].join("\n")}\n`;
}

function formatPlanActions(theme, actionReport) {
  const actions = actionReport?.priorityActions || [];
  if (!actions.length) {
    return [`${theme.bullet("›")} ${theme.label("Actions")} ${theme.dim("Run deep/search mode or confirm client priorities to generate action items.")}`];
  }

  return actions.slice(0, 8).map((item) => `${theme.bullet("›")} ${theme.label(item.label)} ${theme.chip(`[${item.priority}]`)} ${theme.chip(`[${item.source || "Inferred"}]`)} ${theme.dim(`${item.owner}: ${item.detail}`)}`);
}

function formatPlanPageMap(theme, actionReport) {
  const pageMap = actionReport?.pageMap || [];
  if (!pageMap.length) {
    return [`${theme.bullet("›")} ${theme.label("Page map")} ${theme.dim("No keyword-to-page map generated yet.")}`];
  }

  return pageMap.slice(0, 8).map((item) => `${theme.bullet("›")} ${theme.label(item.keyword)} ${theme.dim(`${item.status}: ${item.page}`)}`);
}

function markdownPlanActions(actionReport) {
  const actions = actionReport?.priorityActions || [];
  if (!actions.length) return ["- Run deep/search mode or confirm client priorities to generate action items."];
  return [
    markdownTableWithHeaders(["Priority", "Source", "Owner", "Action", "Detail"], actions.slice(0, 10).map((item) => [
      item.priority,
      item.source || "Inferred",
      item.owner,
      item.label,
      item.detail,
    ])),
  ];
}

function markdownPlanPageMap(actionReport) {
  const pageMap = actionReport?.pageMap || [];
  if (!pageMap.length) return ["- No keyword-to-page map generated yet."];
  return [
    markdownTableWithHeaders(["Priority", "Intent", "Keyword", "Page", "Status"], pageMap.slice(0, 10).map((item) => [
      item.priority,
      item.intent,
      item.keyword,
      item.page,
      item.status,
    ])),
  ];
}

function formatInfrastructureSnapshot(theme, rows = []) {
  if (!rows.length) return [`${theme.bullet("›")} ${theme.label("Snapshot")} ${theme.dim("Run a scan to identify registrar, DNS, Cloudflare, hosting, CMS, and email ownership.")}`];
  return rows.map((item) => `${theme.bullet("›")} ${theme.label(item.area)} ${theme.chip(`[${item.confidence}]`)} ${theme.dim(`${item.finding} | ${item.clientNeed}`)}`);
}

function formatLoginChecklist(theme, rows = []) {
  if (!rows.length) return [`${theme.bullet("›")} ${theme.label("Access")} ${theme.dim("Run a scan to generate the day-one login checklist.")}`];
  return rows.map((item) => `${theme.bullet("›")} ${theme.label(item.access)} ${theme.dim(`${item.status}: ${item.needed}`)}`);
}

function formatTopLocalCompetitors(theme, competitors = []) {
  if (!competitors.length) {
    return [`${theme.bullet("›")} ${theme.label("No local set yet")} ${theme.dim("Run with --search --location or confirm the real competitors on the client call.")}`];
  }

  return competitors.map((item) => `${theme.bullet("›")} ${theme.label(item.name)} ${theme.chip(`[${item.source}]`)} ${theme.dim(`${item.reason} ${item.url}`)}`);
}

function markdownInfrastructureSnapshot(rows = []) {
  if (!rows.length) return "- Run a scan to identify registrar, DNS, Cloudflare, hosting, CMS, and email ownership.";
  return markdownTableWithHeaders(["Area", "Public Finding", "Confidence", "Client Needs"], rows.map((item) => [
    item.area,
    item.finding,
    item.confidence,
    item.clientNeed,
  ]));
}

function markdownLoginChecklist(rows = []) {
  if (!rows.length) return "- Run a scan to generate the day-one login checklist.";
  return markdownTableWithHeaders(["Access", "Public Status", "Needed From Client"], rows.map((item) => [
    item.access,
    item.status,
    item.needed,
  ]));
}

function markdownTopLocalCompetitors(competitors = []) {
  if (!competitors.length) return "- No top local competitor set yet. Run with `--search --location` or confirm the real competitors on the client call.";
  return markdownTableWithHeaders(["Competitor", "Why It Surfaced", "Source Query", "URL"], competitors.map((item) => [
    item.name,
    item.reason,
    item.source,
    item.url,
  ]));
}

function formatPlanResearch(theme, kickoffResearch) {
  const items = [
    ...(kickoffResearch?.marketSnapshot || []).slice(0, 2),
    ...(kickoffResearch?.keywordPageOpportunities || []).slice(0, 2),
    ...(kickoffResearch?.positioningHypotheses || []).slice(0, 2),
  ];

  if (!items.length) {
    return [`${theme.bullet("›")} ${theme.label("Research")} ${theme.dim("Run fitfo plan domain.com --deep --search --location \"City, ST\" for stronger kickoff prep.")}`];
  }

  return items.map((item) => `${theme.bullet("›")} ${theme.label(item.label)} ${theme.chip(`[${item.source}]`)} ${theme.dim(item.detail)}`);
}

function markdownPlanResearch(kickoffResearch) {
  const groups = [
    ["Market Snapshot", kickoffResearch?.marketSnapshot || []],
    ["Keyword + Page Opportunities", kickoffResearch?.keywordPageOpportunities || []],
    ["Positioning Hypotheses", kickoffResearch?.positioningHypotheses || []],
  ];

  return groups.flatMap(([label, items]) => [
    `### ${label}`,
    "",
    ...(items.length ? items.slice(0, 4).map((item) => `- **${item.label}** _${item.source}_: ${item.detail}`) : ["- Run deep/search mode to generate this section."]),
    "",
  ]);
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

function buildPlanLaunchChecklist(scan) {
  const phaseMap = new Map([
    ["Canonical host", "Pre-launch"],
    ["Redirects", "Pre-launch"],
    ["DNS cutover", "Launch"],
    ["Hosting and backups", "Pre-launch"],
    ["CMS launch state", "Pre-launch"],
    ["Email safety", "Launch"],
    ["Tracking and CRM", "Launch"],
    ["Post-launch QA", "Post-launch"],
  ]);

  const launchChecklist = scan.analysis?.launchChecklist || [];
  if (!launchChecklist.length) {
    return [{
      phase: "Pre-launch",
      item: "Manual launch plan",
      detail: "Run a full scan and confirm canonical host, redirects, DNS, hosting, CMS, email, tracking, CRM, and QA before launch.",
    }];
  }

  return launchChecklist.map((item) => ({
    phase: phaseMap.get(item.item) || "Pre-launch",
    item: item.item,
    detail: item.detail,
  }));
}

function yamlString(value) {
  return String(value ?? "").replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function markdownTableWithHeaders(headers, rows) {
  return [
    `| ${headers.map(escapeTable).join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map(escapeTable).join(" | ")} |`),
  ].join("\n");
}

function escapeTable(value) {
  return String(value ?? "").replace(/\|/g, "\\|").replace(/\n/g, "<br>");
}
