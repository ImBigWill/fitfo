import { buildAgentReadiness } from "./agent-readiness.js";
import { buildBrief } from "./brief.js";
import { buildCallOneWorkflow, buildClientAccessRequests, buildConfidenceExplanations, buildDoNotTouchWarnings, buildPreviousDeveloperRequestItems, buildUnknownBlockers } from "./handoff.js";
import { createTheme } from "./theme.js";
import { kv, panel, renderAppHeader, renderSurface } from "./ui.js";

export function buildClientPlan(scan, options = {}) {
  const brief = buildBrief(scan);
  return {
    subject: scan.domain.apex,
    generatedAt: scan.finishedAt,
    infrastructureSnapshot: brief.infrastructureSnapshot,
    loginChecklist: brief.loginChecklist,
    unknownBlockers: buildUnknownBlockers(scan),
    callOneWorkflow: buildCallOneWorkflow(scan),
    confidenceExplanations: buildConfidenceExplanations(scan),
    clientAccessRequests: buildClientAccessRequests(scan),
    doNotTouchWarnings: buildDoNotTouchWarnings(scan),
    previousDeveloperRequestItems: buildPreviousDeveloperRequestItems(scan),
    citationBaseline: brief.citationBaseline,
    priorities: buildPriorities(scan),
    structure: brief.suggestedStructure,
    competitorStructure: brief.competitorStructure,
    reputationSummary: brief.reputationSummary,
    serviceLocationRecommendations: brief.serviceLocationRecommendations,
    topLocalCompetitors: brief.actionReport.competitorResearch?.topLocalCompetitors || [],
    siteEvidence: brief.actionReport.siteEvidence,
    waybackEvidence: brief.waybackEvidence,
    keywordEvidence: brief.actionReport.keywordEvidence,
    architecturalStateMap: buildArchitecturalStateMap(scan, brief),
    agentReadiness: options.agentReady ? buildAgentReadiness(scan) : null,
    workstreams: buildWorkstreams(scan),
    launchChecklist: buildPlanLaunchChecklist(scan),
    kickoffResearch: brief.kickoffResearch,
    actionReport: brief.actionReport,
    clientCallIntelligence: brief.clientCallIntelligence,
    confirmationScript: brief.confirmationScript,
    vertical: scan.vertical || {},
    questions: brief.callQuestions,
  };
}

export function renderPlanText(scan, options = {}) {
  const theme = createTheme(options.color !== false);
  const plan = buildClientPlan(scan, { agentReady: options.agentReady });

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
    panel(theme, "Unknowns Blocking Work", formatUnknownBlockers(theme, plan.unknownBlockers)),
    "",
    panel(theme, "Call One Workflow", formatCallOneWorkflow(theme, plan.callOneWorkflow)),
    "",
    panel(theme, "Why FITFO Thinks This", formatConfidenceRows(theme, plan.confidenceExplanations)),
    "",
    panel(theme, "Login / Access Checklist", formatLoginChecklist(theme, plan.loginChecklist)),
    "",
    panel(theme, "Go Get These Logins", formatAccessRequestRows(theme, plan.clientAccessRequests)),
    "",
    panel(theme, "Do Not Touch Until Confirmed", formatWarningRows(theme, plan.doNotTouchWarnings)),
    "",
    panel(theme, "Previous Developer Request List", formatPreviousDeveloperRequestItems(theme, plan.previousDeveloperRequestItems)),
    "",
    panel(theme, "Citation / NAP Baseline", formatCitationBaseline(theme, plan.citationBaseline)),
    "",
    panel(theme, "URL / Redirect Inventory", formatEvidenceRows(theme, plan.siteEvidence?.urlInventory)),
    "",
    panel(theme, "Wayback Recent Versions", formatWaybackRows(theme, plan.waybackEvidence)),
    "",
    panel(theme, "Lead Capture Inventory", formatLeadRows(theme, plan.siteEvidence?.leadCaptureInventory)),
    "",
    panel(theme, "Tracking / Tool Footprint", formatToolRows(theme, plan.siteEvidence?.toolFootprint)),
    "",
    panel(theme, "Evidence Labels", [
      `${theme.bullet("›")} ${theme.label("Observed")} ${theme.dim("Found in DNS, HTTP, sitemap/page crawl, or visible site signals.")}`,
      `${theme.bullet("›")} ${theme.label("Research")} ${theme.dim("Found through Firecrawl-backed web/search results.")}`,
      `${theme.bullet("›")} ${theme.label("Inferred")} ${theme.dim("Reasonable planning hypothesis that needs validation.")}`,
      `${theme.bullet("›")} ${theme.label("Ask Client")} ${theme.dim("Do not assume; confirm with client or previous developer.")}`,
    ]),
    "",
    panel(theme, "Architectural State Map", formatArchitecturalStateMap(theme, plan.architecturalStateMap)),
    "",
    ...(plan.agentReadiness ? [
      panel(theme, "Agent Readiness Snapshot", formatAgentReadiness(theme, plan.agentReadiness)),
      "",
    ] : []),
    panel(theme, "Focus First", plan.priorities.map((item) => `${theme.bullet("›")} ${theme.label(item.label)} ${theme.dim(item.reason)}`)),
    "",
    panel(theme, "Recommended Structure", plan.structure.map((item) => `${theme.bullet("›")} ${theme.label(item.path)} ${theme.dim(item.reason)}`)),
    "",
    panel(theme, "Competitor-Informed Structure", plan.competitorStructure.map((item) => `${theme.bullet("›")} ${theme.label(item.path)} ${theme.chip(`[${item.priority}]`)} ${theme.dim(`${item.trigger}: ${item.rationale}`)}`)),
    "",
    panel(theme, "Top Local Competitors To Review", formatTopLocalCompetitors(theme, plan.topLocalCompetitors)),
    "",
    ...formatVerticalTextSections(theme, plan.vertical),
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
    panel(theme, "Keyword Evidence", formatKeywordEvidence(theme, plan.keywordEvidence)),
    "",
    panel(theme, "Client Call Next Steps", plan.clientCallIntelligence.map((item) => `${theme.bullet("›")} ${theme.label(item.prompt)} ${theme.dim(item.nextStep)}`)),
    "",
    panel(theme, "Kickoff Confirmation Script", plan.confirmationScript.map((item) => `${theme.bullet("›")} ${theme.label(item.topic)} ${theme.dim(`${item.ask} ${item.why}`)}`)),
    "",
    panel(theme, "Confirm Before Build", plan.questions.map((question) => `${theme.bullet("›")} ${question}`)),
  ].join("\n"));
}

export function renderPlanMarkdown(scan, options = {}) {
  const plan = buildClientPlan(scan, { agentReady: options.agentReady });
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
    "## Unknowns Blocking Work",
    "",
    markdownUnknownBlockers(plan.unknownBlockers),
    "",
    "## Call One Workflow",
    "",
    markdownCallOneWorkflow(plan.callOneWorkflow),
    "",
    "## Why FITFO Thinks This",
    "",
    markdownConfidenceRows(plan.confidenceExplanations),
    "",
    "## Login / Access Checklist",
    "",
    markdownLoginChecklist(plan.loginChecklist),
    "",
    "## Go Get These Logins",
    "",
    markdownAccessRequestRows(plan.clientAccessRequests),
    "",
    "## Do Not Touch Until Confirmed",
    "",
    markdownWarningRows(plan.doNotTouchWarnings),
    "",
    "## Previous Developer Request List",
    "",
    ...plan.previousDeveloperRequestItems.map((item) => `- [ ] ${item}`),
    "",
    "## Citation / NAP Baseline",
    "",
    markdownCitationBaseline(plan.citationBaseline),
    "",
    "## URL / Redirect Inventory",
    "",
    markdownEvidenceRows(["Area / URL", "Extracted Evidence", "Client / Launch Question"], plan.siteEvidence?.urlInventory, ["area", "evidence", "ask"]),
    "",
    "## Wayback Recent Versions",
    "",
    ...markdownWaybackRows(plan.waybackEvidence),
    "",
    "## Lead Capture Inventory",
    "",
    markdownEvidenceRows(["Page", "Signal", "Extracted Details", "Client / Tracking Question"], plan.siteEvidence?.leadCaptureInventory, ["page", "signal", "details", "ask"]),
    "",
    "## Tracking / Tool Footprint",
    "",
    markdownEvidenceRows(["Tool Area", "Evidence", "Source", "Client Question"], plan.siteEvidence?.toolFootprint, ["tool", "evidence", "source", "ask"]),
    "",
    "## Evidence Labels",
    "",
    "- **Observed:** Found in DNS, HTTP, sitemap/page crawl, or visible site signals.",
    "- **Research:** Found through Firecrawl-backed web/search results.",
    "- **Inferred:** Reasonable planning hypothesis that needs validation.",
    "- **Ask Client:** Do not assume; confirm with client or previous developer.",
    "",
    "## Architectural State Map",
    "",
    markdownArchitecturalStateMap(plan.architecturalStateMap),
    "",
    ...(plan.agentReadiness ? [
      "## Agent Readiness Snapshot",
      "",
      markdownAgentReadiness(plan.agentReadiness),
      "",
    ] : []),
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
    ...markdownVerticalSections(plan.vertical),
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
    "## Keyword Evidence",
    "",
    markdownEvidenceRows(["Cluster", "Keyword", "Evidence Source", "Mapped Page", "Next Step"], plan.keywordEvidence, ["cluster", "keyword", "evidence", "page", "nextStep"]),
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

function formatVerticalTextSections(theme, vertical = {}) {
  if (!vertical.slug) return [];

  return [
    panel(theme, "Vertical Lens", [
      `${theme.bullet("›")} ${theme.label(vertical.label)} ${theme.chip(`[${vertical.source}]`)} ${theme.dim("Use this as a market-specific review layer, not a substitute for client confirmation.")}`,
      `${theme.bullet("›")} ${theme.label("Priority services")} ${theme.dim((vertical.services || []).slice(0, 6).join(", ") || "Confirm with client.")}`,
    ]),
    "",
    panel(theme, "Homeowner Emergency UX", formatHomeownerUx(theme, vertical.homeownerUx)),
    "",
    panel(theme, "Plumbing Proof Assets Needed", formatVerticalProofAssets(theme, vertical.proofAssets)),
    "",
    panel(theme, "Plumbing Call Questions", formatVerticalAudienceQuestions(theme, vertical.audienceQuestions)),
  ];
}

function formatHomeownerUx(theme, rows = []) {
  if (!rows.length) {
    return [`${theme.bullet("›")} ${theme.label("UX")} ${theme.dim("No vertical UX checks generated.")}`];
  }

  return rows.map((item) => `${theme.bullet("›")} ${theme.label(item.area)} ${theme.chip(`[${item.status}]`)} ${theme.dim(`${item.evidence} Next: ${item.recommendation}`)}`);
}

function formatVerticalProofAssets(theme, assets = []) {
  if (!assets.length) return [`${theme.bullet("›")} ${theme.label("Proof")} ${theme.dim("Confirm reviews, photos, credentials, guarantees, and usage rights.")}`];
  return assets.map((asset) => `${theme.bullet("›")} ${theme.dim(asset)}`);
}

function formatVerticalAudienceQuestions(theme, questions = []) {
  if (!questions.length) return [`${theme.bullet("›")} ${theme.label("Questions")} ${theme.dim("No vertical questions generated.")}`];
  return questions.map((item) => `${theme.bullet("›")} ${theme.label(item.audience)} ${theme.dim(item.question)}`);
}

function formatCitationBaseline(theme, baseline = {}) {
  const canonical = baseline.canonical || {};
  const rows = baseline.rows || [];
  const lines = [
    `${theme.bullet("›")} ${theme.label("Canonical candidate")} ${theme.chip(`[${canonical.confidence || "Low"}]`)} ${theme.dim(`${canonical.name || "Unknown"} | ${canonical.address || "Unknown"} | ${canonical.phone || "Unknown"}`)}`,
    `${theme.bullet("›")} ${theme.label("Summary")} ${theme.dim(baseline.summary?.label || "No citation sources reviewed yet.")}`,
    `${theme.bullet("›")} ${theme.label("Ask")} ${theme.dim(baseline.confirmationQuestion || "Confirm official NAP before citation cleanup.")}`,
  ];

  for (const row of rows.slice(0, 8)) {
    lines.push(`${theme.bullet("›")} ${theme.label(row.source)} ${theme.chip(`[${row.matchStatus}]`)} ${theme.dim(`${row.foundName} | ${row.foundAddress} | ${row.foundPhone}. ${row.action}`)}`);
  }

  return lines;
}

function markdownVerticalSections(vertical = {}) {
  if (!vertical.slug) return [];

  return [
    "## Vertical Lens",
    "",
    markdownTableWithHeaders(["Vertical", "Source", "Priority Services"], [[
      vertical.label,
      vertical.source,
      (vertical.services || []).slice(0, 8).join(", ") || "Confirm with client",
    ]]),
    "",
    "## Homeowner Emergency UX",
    "",
    markdownTableWithHeaders(["Area", "Status", "Evidence", "Recommendation"], (vertical.homeownerUx || []).map((item) => [
      item.area,
      item.status,
      item.evidence,
      item.recommendation,
    ])),
    "",
    "## Plumbing Proof Assets Needed",
    "",
    ...((vertical.proofAssets || []).map((asset) => `- [ ] ${asset}`)),
    "",
    "## Plumbing Call Questions",
    "",
    markdownTableWithHeaders(["Audience", "Question"], (vertical.audienceQuestions || []).map((item) => [
      item.audience,
      item.question,
    ])),
    "",
  ];
}

function markdownCitationBaseline(baseline = {}) {
  const canonical = baseline.canonical || {};
  return [
    markdownTableWithHeaders(["Candidate", "Value", "Source"], [
      ["Name", canonical.name || "Unknown", canonical.nameSource || "Ask Client"],
      ["Address / Service Area", canonical.address || "Unknown", canonical.addressSource || "Ask Client"],
      ["Phone", canonical.phone || "Unknown", canonical.phoneSource || "Ask Client"],
      ["Confidence", canonical.confidence || "Low", canonical.note || "Client must confirm official NAP."],
    ]),
    "",
    `- **Summary:** ${baseline.summary?.label || "No citation sources reviewed yet."}`,
    `- **Confirm:** ${baseline.confirmationQuestion || "Confirm official NAP before citation cleanup."}`,
    "",
    markdownTableWithHeaders(["Source", "Type", "Found Name", "Found Address", "Found Phone", "Match Status", "Risk", "Action", "URL"], (baseline.rows || []).map((row) => [
      row.source,
      row.type,
      row.foundName,
      row.foundAddress,
      row.foundPhone,
      row.matchStatus,
      row.risk,
      row.action,
      row.url,
    ])),
  ].join("\n");
}

function formatInfrastructureSnapshot(theme, rows = []) {
  if (!rows.length) return [`${theme.bullet("›")} ${theme.label("Snapshot")} ${theme.dim("Run a scan to identify registrar, DNS, Cloudflare, hosting, CMS, and email ownership.")}`];
  return rows.map((item) => `${theme.bullet("›")} ${theme.label(item.area)} ${theme.chip(`[${item.confidence}]`)} ${theme.dim(`${item.finding} | ${item.clientNeed}`)}`);
}

function formatUnknownBlockers(theme, rows = []) {
  if (!rows.length) return [`${theme.bullet("›")} ${theme.ok("No major onboarding blockers generated from the public scan.")}`];
  return rows.map((item) => `${theme.bullet("›")} ${theme.label(item.area)} ${theme.chip(`[${item.severity}]`)} ${theme.dim(`${item.owner}: ${item.evidence} Ask: ${item.ask}`)}`);
}

function formatCallOneWorkflow(theme, rows = []) {
  return rows.map((item) => `${theme.bullet("›")} ${theme.label(item.area)} ${theme.chip(`[${item.owner}]`)} ${theme.dim(`${item.audience}: found ${item.found}; need ${item.need}; risk ${item.risk}; ask ${item.ask}`)}`);
}

function formatConfidenceRows(theme, rows = []) {
  if (!rows.length) return [`${theme.bullet("›")} ${theme.label("Evidence")} ${theme.dim("Run a scan to generate finding explanations.")}`];
  return rows.map((item) => `${theme.bullet("›")} ${theme.label(item.area)} ${theme.chip(`[${item.confidence}]`)} ${theme.dim(`${item.finding}. ${item.evidence} Next: ${item.clientFollowUp}`)}`);
}

function formatLoginChecklist(theme, rows = []) {
  if (!rows.length) return [`${theme.bullet("›")} ${theme.label("Access")} ${theme.dim("Run a scan to generate the day-one login checklist.")}`];
  return rows.map((item) => `${theme.bullet("›")} ${theme.label(item.access)} ${theme.dim(`${item.status}: ${item.needed}`)}`);
}

function formatAccessRequestRows(theme, rows = []) {
  if (!rows.length) return [`${theme.bullet("›")} ${theme.label("Logins")} ${theme.dim("Run a scan to generate login requests.")}`];
  return rows.map((item) => `${theme.bullet("›")} ${theme.label(item.access)} ${theme.dim(`${item.status}: ${item.request}`)}`);
}

function formatWarningRows(theme, rows = []) {
  if (!rows.length) return [`${theme.bullet("›")} ${theme.label("Warnings")} ${theme.dim("No launch safety warnings generated.")}`];
  return rows.map((item) => `${theme.bullet("›")} ${theme.label(item.area)} ${theme.warn(item.warning)} ${theme.dim(item.reason)}`);
}

function formatPreviousDeveloperRequestItems(theme, rows = []) {
  return rows.map((item) => `${theme.bullet("›")} ${theme.dim(item)}`);
}

function formatTopLocalCompetitors(theme, competitors = []) {
  if (!competitors.length) {
    return [`${theme.bullet("›")} ${theme.label("No local set yet")} ${theme.dim("Run with --search --location or confirm the real competitors on the client call.")}`];
  }

  return competitors.map((item) => `${theme.bullet("›")} ${theme.label(item.name)} ${theme.chip(`[${item.source}]`)} ${theme.dim(`${item.reason} ${item.url}`)}`);
}

function formatEvidenceRows(theme, rows = []) {
  if (!rows.length) return [`${theme.bullet("›")} ${theme.label("No evidence yet")} ${theme.dim("Run --deep to extract this section.")}`];
  return rows.slice(0, 8).map((item) => `${theme.bullet("›")} ${theme.label(item.area || item.tool || item.keyword)} ${theme.dim(`${item.evidence || item.details || ""} | ${item.ask || item.nextStep || ""}`)}`);
}

function formatWaybackRows(theme, evidence = {}) {
  if (!evidence.enabled) {
    return [`${theme.bullet("›")} ${theme.label("Not enabled")} ${theme.dim("Run with --wayback to compare recent archived homepage versions.")}`];
  }

  if (!evidence.versions?.length) {
    return [`${theme.bullet("›")} ${theme.label("No readable snapshots")} ${theme.dim(`${evidence.snapshotsFound || 0} snapshot(s) found; confirm manually in the Wayback Machine if needed.`)}`];
  }

  const lines = evidence.versions.slice(0, 3).map((version) => (
    `${theme.bullet("›")} ${theme.label(version.capturedAt)} ${theme.dim(`${version.title || "Untitled"} | forms ${version.formCount} | phones ${version.phones.length} | tools ${version.toolSignals.length}`)}`
  ));

  for (const warning of (evidence.warnings || []).slice(0, 3)) {
    lines.push(`${theme.bullet("›")} ${theme.label("Flag")} ${theme.dim(warning)}`);
  }

  for (const change of (evidence.changes || []).slice(0, 4)) {
    lines.push(`${theme.bullet("›")} ${theme.label(change.signal)} ${theme.dim(`${change.previous} -> ${change.latest}`)}`);
  }

  return lines;
}

function formatLeadRows(theme, rows = []) {
  if (!rows.length) return [`${theme.bullet("›")} ${theme.label("No lead evidence yet")} ${theme.dim("Run --deep or confirm forms, calls, booking, chat, and CRM manually.")}`];
  return rows.slice(0, 8).map((item) => `${theme.bullet("›")} ${theme.label(`${item.page} ${item.signal}`)} ${theme.dim(`${item.details} | ${item.ask}`)}`);
}

function formatToolRows(theme, rows = []) {
  if (!rows.length) return [`${theme.bullet("›")} ${theme.label("No tool evidence yet")} ${theme.dim("Run --deep or confirm analytics, CRM, and widgets manually.")}`];
  return rows.map((item) => `${theme.bullet("›")} ${theme.label(item.tool)} ${theme.chip(`[${item.source}]`)} ${theme.dim(`${item.evidence} | ${item.ask}`)}`);
}

function formatKeywordEvidence(theme, rows = []) {
  if (!rows.length) return [`${theme.bullet("›")} ${theme.label("No keyword evidence yet")} ${theme.dim("Run --deep --search or confirm service/location priorities manually.")}`];
  return rows.slice(0, 8).map((item) => `${theme.bullet("›")} ${theme.label(item.keyword)} ${theme.chip(`[${item.cluster}]`)} ${theme.dim(`${item.evidence} -> ${item.page} (${item.nextStep})`)}`);
}

function formatArchitecturalStateMap(theme, map = {}) {
  const rows = map.rows || [];
  if (!rows.length) {
    return [`${theme.bullet("›")} ${theme.label("State map")} ${theme.dim("Run --deep to map current pages, redirects, subdomains, and future-state handling decisions.")}`];
  }

  return [
    `${theme.bullet("›")} ${theme.label("Current state")} ${theme.dim(map.summary || "Current domain structure reviewed from public signals.")}`,
    ...rows.slice(0, 10).map((item) => `${theme.bullet("›")} ${theme.label(item.target)} ${theme.chip(`[${item.decision}]`)} ${theme.chip(`[${item.phase}]`)} ${theme.dim(`${item.currentState} Redesign: ${item.redesignAction} Launch: ${item.launchHandling}`)}`),
  ];
}

function formatAgentReadiness(theme, readiness = {}) {
  const rows = readiness.rows || [];
  if (!rows.length) {
    return [`${theme.bullet("›")} ${theme.label("Agent readiness")} ${theme.dim("Run `fitfo plan domain.com --deep --agent-ready` to generate this add-on.")}`];
  }

  return [
    `${theme.bullet("›")} ${theme.label("Summary")} ${theme.dim(readiness.summary || "Agent readiness signals generated.")}`,
    ...rows.map((item) => `${theme.bullet("›")} ${theme.label(item.signal)} ${theme.chip(`[${item.status}]`)} ${theme.dim(`${item.evidence} Next: ${item.action}`)}`),
  ];
}

function markdownAgentReadiness(readiness = {}) {
  const rows = readiness.rows || [];
  if (!rows.length) return "- Run `fitfo plan domain.com --deep --agent-ready` to generate this add-on.";

  return [
    `- **Summary:** ${readiness.summary || "Agent readiness signals generated."}`,
    "",
    markdownTableWithHeaders(["Area", "Signal", "Status", "Evidence", "Recommended Action"], rows.map((item) => [
      item.area,
      item.signal,
      item.status,
      item.evidence,
      item.action,
    ])),
  ].join("\n");
}

function markdownArchitecturalStateMap(map = {}) {
  const rows = map.rows || [];
  if (!rows.length) return "- Run `fitfo plan domain.com --deep` to map current pages, redirects, subdomains, and future-state handling decisions.";

  return [
    `- **Summary:** ${map.summary || "Current domain structure reviewed from public signals."}`,
    "",
    markdownTableWithHeaders(["Area", "Target", "Current State", "Decision", "Redesign Phase", "Launch / Post-Launch Handling", "Evidence"], rows.map((item) => [
      item.area,
      item.target,
      item.currentState,
      item.decision,
      item.redesignAction,
      item.launchHandling,
      item.evidence,
    ])),
  ].join("\n");
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

function markdownUnknownBlockers(rows = []) {
  if (!rows.length) return "- No major onboarding blockers generated from the public scan.";
  return markdownTableWithHeaders(["Blocker", "Severity", "Owner", "Evidence", "Ask"], rows.map((item) => [
    item.area,
    item.severity,
    item.owner,
    item.evidence,
    item.ask,
  ]));
}

function markdownCallOneWorkflow(rows = []) {
  return markdownTableWithHeaders(["Area", "Found", "Need", "Risk", "Ask", "Owner", "Audience"], rows.map((item) => [
    item.area,
    item.found,
    item.need,
    item.risk,
    item.ask,
    item.owner,
    item.audience,
  ]));
}

function markdownConfidenceRows(rows = []) {
  if (!rows.length) return "- Run a scan to generate finding explanations.";
  return markdownTableWithHeaders(["Area", "Finding", "Confidence", "Why FITFO Thinks This", "Client Follow-Up"], rows.map((item) => [
    item.area,
    item.finding,
    item.confidence,
    item.evidence,
    item.clientFollowUp,
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

function markdownAccessRequestRows(rows = []) {
  if (!rows.length) return "- Run a scan to generate login requests.";
  return markdownTableWithHeaders(["Login / Access", "Current Public Status", "Owner", "What Client Needs To Get"], rows.map((item) => [
    item.access,
    item.status,
    item.owner,
    item.request,
  ]));
}

function markdownWarningRows(rows = []) {
  if (!rows.length) return "- No launch safety warnings generated.";
  return markdownTableWithHeaders(["Area", "Do Not Touch", "Why It Matters"], rows.map((item) => [
    item.area,
    item.warning,
    item.reason,
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

function markdownEvidenceRows(headers, rows = [], keys = []) {
  if (!rows.length) return "- No extracted evidence yet. Run `--deep --search` where appropriate or confirm manually on the client call.";
  return markdownTableWithHeaders(headers, rows.map((item) => keys.map((key) => item[key] || "")));
}

function markdownWaybackRows(evidence = {}) {
  if (!evidence.enabled) {
    return ["- Not enabled. Run with `--wayback` to compare recent archived homepage versions."];
  }

  if (!evidence.versions?.length) {
    return [
      `- Snapshots found: ${evidence.snapshotsFound || 0}. No readable archived HTML versions were extracted.`,
      ...((evidence.errors || []).slice(0, 5).map((error) => `- Error: ${error}`)),
    ];
  }

  const sections = [
    markdownTableWithHeaders(["Captured", "URL", "Title", "H1", "Words", "Forms", "Phones", "Tools"], evidence.versions.map((version) => [
      version.capturedAt,
      version.original,
      version.title || "Not detected",
      version.h1 || "Not detected",
      version.wordCount,
      version.formCount,
      version.phones?.length ? version.phones.join(", ") : "None detected",
      version.toolSignals?.length ? version.toolSignals.join(", ") : "None detected",
    ])),
  ];

  if (evidence.changes?.length) {
    sections.push(
      "",
      "### Wayback Change Flags",
      "",
      markdownTableWithHeaders(["Signal", "Previous Capture", "Latest Capture", "Note"], evidence.changes.map((change) => [
        change.signal,
        change.previous,
        change.latest,
        change.note,
      ])),
    );
  }

  if (evidence.warnings?.length) {
    sections.push(
      "",
      "### Wayback Risk Notes",
      "",
      ...evidence.warnings.map((warning) => `- ${warning}`),
    );
  }

  return sections;
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

function buildArchitecturalStateMap(scan, brief = {}) {
  const rows = [];
  const urlStructure = scan.analysis?.urlStructure || {};
  const sitePages = scan.site?.pages || [];
  const pageMap = brief.actionReport?.pageMap || [];
  const subdomains = scan.dns?.subdomains || [];
  const preferredHost = urlStructure.preferredHost && urlStructure.preferredHost !== "Unknown" ? urlStructure.preferredHost : null;
  const preferredProtocol = urlStructure.preferredProtocol || "Unknown";
  const launchIssues = urlStructure.issues || [];

  rows.push({
    area: "Domain architecture",
    target: preferredHost || scan.domain?.apex || "Canonical host",
    currentState: preferredHost ? `${preferredProtocol} ${preferredHost} (${urlStructure.canonicalStyle || "Unknown"})` : "Canonical host not confirmed from public checks.",
    decision: launchIssues.length ? "Confirm" : "Keep",
    phase: "Pre-launch",
    redesignAction: launchIssues.length ? "Resolve apex/www and HTTPS behavior before final sitemap, Search Console, and analytics assumptions." : "Preserve canonical host unless client intentionally changes it.",
    launchHandling: urlStructure.recommendation || "Confirm canonical host manually before launch.",
    evidence: launchIssues.length ? launchIssues.map((issue) => issue.summary).join(" ") : "No first-pass redirect issues found in apex/www checks.",
  });

  for (const issue of launchIssues.slice(0, 4)) {
    rows.push({
      area: "Redirect strategy",
      target: issue.code,
      currentState: issue.summary,
      decision: issue.severity === "High" ? "Redirect" : "Confirm",
      phase: issue.severity === "High" ? "Pre-launch" : "Launch",
      redesignAction: "Decide the future canonical target before rebuild URLs are finalized.",
      launchHandling: issue.detail,
      evidence: issue.summary,
    });
  }

  for (const page of sitePages.slice(0, 8)) {
    const path = page.path || "/";
    const pageType = classifyPlanPage(path);
    rows.push({
      area: "Current URL",
      target: path,
      currentState: `${pageType} page found in crawl.`,
      decision: pageType === "Homepage" || pageType === "Service" || pageType === "Contact" ? "Rework" : "Confirm",
      phase: "Redesign",
      redesignAction: redesignActionForPageType(pageType),
      launchHandling: path === "/" ? "Preserve as homepage; verify canonical, tracking, forms, and primary CTA at launch." : "Keep URL if useful, or map to the closest future-state URL before launch.",
      evidence: [
        page.title ? `title: ${page.title}` : null,
        page.canonicalUrl ? `canonical: ${page.canonicalUrl}` : null,
        page.ctas?.length ? `CTA: ${page.ctas.slice(0, 3).join(", ")}` : null,
      ].filter(Boolean).join("; ") || "Crawled URL inventory.",
    });
  }

  for (const item of pageMap.filter((entry) => entry.status === "Create new" || entry.status === "Improve existing").slice(0, 5)) {
    rows.push({
      area: "Future URL",
      target: item.page,
      currentState: item.status === "Create new" ? "No matching current page was mapped from keyword evidence." : "Existing page mapped from keyword evidence.",
      decision: item.status === "Create new" ? "Create" : "Rework",
      phase: "Redesign",
      redesignAction: `${item.intent || "Intent"} page for ${item.keyword}.`,
      launchHandling: item.status === "Create new" ? "Add to sitemap and internal links; no redirect unless replacing an old URL." : "Preserve or redirect old URL based on final slug choice.",
      evidence: item.evidence || item.status,
    });
  }

  for (const subdomain of subdomains.slice(0, 6)) {
    rows.push({
      area: "Subdomain",
      target: subdomain.name,
      currentState: formatSubdomainState(subdomain),
      decision: "Confirm",
      phase: "Pre-launch",
      redesignAction: "Identify whether this is staging, portal, booking, CRM, shop, mail, legacy, or safe to ignore.",
      launchHandling: "Do not remove DNS or redirect until owner, purpose, and replacement path are confirmed.",
      evidence: formatSubdomainState(subdomain),
    });
  }

  return {
    summary: buildArchitecturalStateSummary(rows),
    rows,
  };
}

function classifyPlanPage(path = "") {
  if (path === "/" || path === "") return "Homepage";
  if (/\bcontact|quote|estimate|schedule|book/i.test(path)) return "Contact";
  if (/\bservices?|repair|install|emergency|drain|plumb|hvac|roof|electric/i.test(path)) return "Service";
  if (/\blocation|areas?-served|city|near-me/i.test(path)) return "Location";
  if (/\breviews?|testimonials?|case-studies?|gallery|projects?/i.test(path)) return "Proof";
  if (/\bfaq|questions|pricing|process/i.test(path)) return "Support";
  return "Content";
}

function redesignActionForPageType(pageType) {
  if (pageType === "Homepage") return "Clarify offer, service area, proof, and primary conversion path.";
  if (pageType === "Service") return "Improve service intent, proof, FAQs, CTA, internal links, and metadata.";
  if (pageType === "Contact") return "Verify forms, phone routing, tracking, booking expectations, and response owner.";
  if (pageType === "Location") return "Confirm real service area and add local proof before keeping or expanding.";
  if (pageType === "Proof") return "Refresh reviews, project proof, credentials, usage rights, and schema opportunities.";
  return "Confirm whether this page supports the future sitemap, should be consolidated, or should redirect.";
}

function formatSubdomainState(subdomain = {}) {
  const parts = [
    subdomain.cnames?.length ? `CNAME ${subdomain.cnames.join(", ")}` : null,
    subdomain.addresses?.length ? `A ${subdomain.addresses.join(", ")}` : null,
  ].filter(Boolean);

  return parts.length ? parts.join("; ") : "Resolved in common subdomain checks.";
}

function buildArchitecturalStateSummary(rows = []) {
  const counts = rows.reduce((totals, row) => {
    totals[row.decision] = (totals[row.decision] || 0) + 1;
    return totals;
  }, {});
  const parts = ["Keep", "Rework", "Create", "Redirect", "Confirm"]
    .map((key) => counts[key] ? `${counts[key]} ${key.toLowerCase()}` : null)
    .filter(Boolean);

  return parts.length ? `Current state map generated with ${parts.join(", ")} decision(s).` : "Current state map needs a deep crawl and redirect checks.";
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
