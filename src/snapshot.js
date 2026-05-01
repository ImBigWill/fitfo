import { buildBrief } from "./brief.js";
import { createTheme } from "./theme.js";
import { kv, numbered, panel, renderAppHeader, renderSurface } from "./ui.js";

export function buildSnapshot(scan) {
  const brief = buildBrief(scan);
  const site = scan.site || {};
  const siteSummary = site.summary || {};
  const pages = site.pages || [];
  const home = pages.find((page) => page.path === "/") || pages[0] || {};
  const actionReport = brief.actionReport || {};
  const priorityActions = actionReport.priorityActions || [];
  const pageMap = actionReport.pageMap || [];
  const contentInventory = actionReport.contentInventory || [];
  const competitorResearch = actionReport.competitorResearch || {};
  const competitors = competitorResearch.topLocalCompetitors || competitorResearch.competitors || [];
  const marketingTags = scan.analysis?.marketing?.found || [];
  const ctas = siteSummary.ctas || [];
  const phones = siteSummary.phonesDetected || [];
  const schemaTypes = siteSummary.schemaTypes || [];

  return {
    subject: scan.domain.apex,
    generatedAt: scan.finishedAt,
    positioningRead: buildPositioningRead(scan, home),
    overview: [
      ["Website", scan.http?.reachable ? "Reachable" : "Not reachable during scan"],
      ["Title", scan.http?.title || "Unknown"],
      ["CMS", scan.analysis?.cms?.platform || "Unknown"],
      ["Pages reviewed", site.enabled ? String(siteSummary.pagesScanned || pages.length || 0) : "Not checked"],
      ["Lead paths", summarizeLeadPaths(siteSummary)],
      ["Tracking", marketingTags.length ? marketingTags.join(", ") : "No obvious marketing tags detected"],
      ["Schema", schemaTypes.length ? schemaTypes.join(", ") : "Not detected"],
    ],
    whatIsWorking: limitItems([
      scan.http?.reachable ? makeItem("The site is live and accessible", "That gives the call a practical starting point instead of a rescue conversation.") : null,
      scan.analysis?.cms?.platform && scan.analysis.cms.platform !== "Unknown" ? makeItem(`${scan.analysis.cms.platform} is detectable`, "There is likely an existing publishing system the client can build from.") : null,
      phones.length ? makeItem("Phone numbers are visible", `Detected ${phones.length} phone signal(s), which means direct-response intent is already present.`) : null,
      ctas.length ? makeItem("Calls to action are present", `Detected CTA language such as ${formatShortList(ctas)}.`) : null,
      schemaTypes.length ? makeItem("Structured data is present", `Detected ${formatShortList(schemaTypes)}, which can support clearer search understanding.`) : null,
      marketingTags.length ? makeItem("Marketing tools are installed", `Detected ${formatShortList(marketingTags)}, which may support measurement or retargeting.`) : null,
      contentInventory.length ? makeItem("There are pages to work with", `Detected ${contentInventory.length} content item(s) that can be improved instead of starting from zero.`) : null,
    ], 5, [
      makeItem("There is enough public signal to start a useful conversation", "Use the walkthrough to validate what is current, what is intentional, and what the client wants next."),
    ]),
    frictionPoints: limitItems([
      site.enabled && siteSummary.pagesMissingH1 ? makeItem("Some pages may lack a clear main headline", `${siteSummary.pagesMissingH1} page(s) were missing an H1 in the crawl.`) : null,
      site.enabled && siteSummary.pagesWithMultipleH1 ? makeItem("Some pages may have competing headline structure", `${siteSummary.pagesWithMultipleH1} page(s) had multiple H1s.`) : null,
      site.enabled && siteSummary.pagesWithMetaDescription !== undefined && siteSummary.pagesScanned && siteSummary.pagesWithMetaDescription < siteSummary.pagesScanned ? makeItem("Search snippets may be underdeveloped", `${siteSummary.pagesScanned - siteSummary.pagesWithMetaDescription} reviewed page(s) did not show a meta description.`) : null,
      site.enabled && !siteSummary.formsDetected ? makeItem("Lead capture may be too thin", "No forms were detected in the crawl, so the walkthrough should confirm how visitors become leads.") : null,
      !marketingTags.length ? makeItem("Measurement may be incomplete", "No obvious marketing tags were detected, so performance visibility may be limited.") : null,
      !schemaTypes.length ? makeItem("Search context may be thin", "No structured data types were detected in the crawl summary.") : null,
      priorityActions[0] ? makeItem(priorityActions[0].label, priorityActions[0].detail) : null,
    ], 5, [
      makeItem("The biggest unknown is what happens after a visitor gets interested", "Confirm calls, forms, booking, CRM, and follow-up during the walkthrough."),
    ]),
    opportunities: limitItems([
      pageMap.find((item) => item.status === "Create new") ? makeItem("Create missing high-intent pages", "There are keyword or service themes that may deserve dedicated pages.") : null,
      pageMap.find((item) => item.status === "Improve existing") ? makeItem("Improve pages that already exist", "Some current pages can likely be sharpened around clearer search intent and stronger conversion paths.") : null,
      competitors.length ? makeItem("Use competitor patterns without copying them", `${competitors.length} competitor signal(s) can help identify expected pages, proof, and offers.`) : null,
      brief.reputationSummary?.length ? makeItem("Turn reputation into proof", "Reviews, testimonials, case studies, and trust signals can make the site easier to believe.") : null,
      brief.serviceLocationRecommendations?.length ? makeItem("Clarify services and locations", "The site may benefit from cleaner service and market coverage.") : null,
      makeItem("Tighten the message above the fold", "Use the first screen to make the offer, audience, location, and next action obvious."),
    ], 5),
    howWeCanHelp: [
      makeItem("Clarify positioning", "Turn the current homepage into a sharper answer to who this is for, what they do, and why it matters."),
      makeItem("Improve conversion paths", "Make calls, forms, booking, or consultation requests easier to find and easier to trust."),
      makeItem("Build the right page map", "Prioritize service, location, comparison, proof, and FAQ pages based on the client goals."),
      makeItem("Set up measurement", "Confirm analytics, conversion events, search visibility, and lead-source tracking."),
      makeItem("Package the next step", "Move from a light walkthrough into a focused audit, strategy plan, or implementation proposal."),
    ],
    walkthroughFlow: [
      makeItem("Start with what is working", "Open with positives so the walkthrough feels useful instead of adversarial."),
      makeItem("Move into visitor confusion", "Show where the site makes prospects work too hard to understand, trust, or act."),
      makeItem("Connect issues to business outcomes", "Translate page, message, and tracking gaps into missed leads or unclear follow-up."),
      makeItem("Close with a concrete next step", "Recommend the smallest serious next engagement that can turn the findings into action."),
    ],
    talkTrack: buildTalkTrack(scan),
    clientQuestions: limitItems([
      makeItem("What should a visitor do first?", "Confirm the primary conversion action: call, form, booking, demo, quote, or consultation."),
      makeItem("Which work is most valuable?", "Ask which services, products, or offers matter most commercially."),
      makeItem("What makes the business different?", "Listen for proof, specialization, guarantees, process, speed, service model, or customer fit."),
      ...brief.clientCallIntelligence.map((item) => makeItem(item.prompt, item.nextStep)),
    ], 6),
  };
}

export function renderSnapshotText(scan, options = {}) {
  const theme = createTheme(options.color !== false);
  const snapshot = buildSnapshot(scan);

  const lines = [
    renderAppHeader(theme, {
      mode: "snapshot",
      scope: "initial site walkthrough + sales conversation",
      motto: "Light enough for the first call.",
    }),
    "",
    panel(theme, "FitFo Snapshot", [
      kv(theme, "Target", snapshot.subject),
      kv(theme, "Generated", snapshot.generatedAt),
      ...snapshot.overview.map(([label, value]) => kv(theme, label, value)),
    ]),
    "",
    panel(theme, "Positioning Read", snapshot.positioningRead.map((item) => `${theme.bullet("›")} ${theme.label(item.label)} ${theme.dim(item.detail)}`)),
    "",
    panel(theme, "What The Site Is Doing Right", formatItems(theme, snapshot.whatIsWorking)),
    "",
    panel(theme, "What May Be Holding It Back", formatItems(theme, snapshot.frictionPoints)),
    "",
    panel(theme, "Opportunity Angles", formatItems(theme, snapshot.opportunities)),
    "",
    panel(theme, "How An Agency Can Help", formatItems(theme, snapshot.howWeCanHelp)),
    "",
    panel(theme, "Walkthrough Flow", snapshot.walkthroughFlow.flatMap((item, index) => numbered(theme, index + 1, item.label, item.detail))),
    "",
    panel(theme, "Talk Track", snapshot.talkTrack.flatMap((item, index) => numbered(theme, index + 1, item.label, item.detail))),
    "",
    panel(theme, "Questions To Ask", formatItems(theme, snapshot.clientQuestions)),
  ];

  return renderSurface(theme, lines.join("\n"));
}

export function renderSnapshotMarkdown(scan, options = {}) {
  const snapshot = buildSnapshot(scan);
  const reportType = options.obsidian ? "obsidian-snapshot" : "snapshot";

  return `${[
    "---",
    `title: "FitFo Snapshot - ${yamlString(snapshot.subject)}"`,
    `domain: "${yamlString(snapshot.subject)}"`,
    `generated_at: "${yamlString(snapshot.generatedAt)}"`,
    `report_type: "${reportType}"`,
    "tags:",
    "  - fitfo",
    "  - snapshot",
    "  - first-call",
    "---",
    "",
    `# FitFo Snapshot - ${snapshot.subject}`,
    "",
    "**A light first-call walkthrough for a website, positioning, and next-step marketing conversation.**",
    "",
    "## Snapshot",
    "",
    markdownTable(snapshot.overview),
    "",
    "## Positioning Read",
    "",
    ...markdownItems(snapshot.positioningRead),
    "",
    "## What The Site Is Doing Right",
    "",
    ...markdownItems(snapshot.whatIsWorking),
    "",
    "## What May Be Holding It Back",
    "",
    ...markdownItems(snapshot.frictionPoints),
    "",
    "## Opportunity Angles",
    "",
    ...markdownItems(snapshot.opportunities),
    "",
    "## How An Agency Can Help",
    "",
    ...markdownItems(snapshot.howWeCanHelp),
    "",
    "## Walkthrough Flow",
    "",
    ...markdownNumbered(snapshot.walkthroughFlow),
    "",
    "## Talk Track",
    "",
    ...markdownNumbered(snapshot.talkTrack),
    "",
    "## Questions To Ask",
    "",
    ...markdownItems(snapshot.clientQuestions),
    "",
  ].join("\n")}\n`;
}

function buildPositioningRead(scan, home = {}) {
  const h1 = home.headings?.h1?.[0];
  const metaDescription = home.metaDescription;
  const title = scan.http?.title;

  return [
    makeItem("What visitors likely see first", h1 || title || "No clear homepage headline was captured."),
    makeItem("Current search-facing message", metaDescription || "No homepage meta description was captured."),
    makeItem("Positioning check", "Confirm whether the first screen clearly communicates the audience, offer, market, proof, and next action."),
  ];
}

function buildTalkTrack(scan) {
  const domain = scan.domain.apex;
  return [
    makeItem("Frame the walkthrough", `I took a first look at ${domain}. This is not a full audit; it is a quick read on what a prospect might notice and where there may be upside.`),
    makeItem("Lead with positives", "There are pieces here we can build from, so the goal is not to tear the site apart. The goal is to make the best parts clearer and easier to act on."),
    makeItem("Introduce friction", "A few parts of the site may be making visitors work harder than they need to. Those are usually the fastest places to improve lead flow."),
    makeItem("Bridge to help", "The next step would be turning this quick read into a focused plan: message, page priorities, conversion path, and measurement."),
  ];
}

function formatItems(theme, rows = []) {
  return rows.map((item) => `${theme.bullet("›")} ${theme.label(item.label)} ${theme.dim(item.detail)}`);
}

function markdownItems(rows = []) {
  return rows.map((item) => `- **${escapeMarkdown(item.label)}:** ${escapeMarkdown(item.detail)}`);
}

function markdownNumbered(rows = []) {
  return rows.map((item, index) => `${index + 1}. **${escapeMarkdown(item.label)}:** ${escapeMarkdown(item.detail)}`);
}

function makeItem(label, detail) {
  return { label, detail };
}

function limitItems(items, limit, fallback = []) {
  const filtered = items.filter(Boolean);
  return (filtered.length ? filtered : fallback).slice(0, limit);
}

function summarizeLeadPaths(summary = {}) {
  const parts = [];
  if (summary.formsDetected) parts.push(`${summary.formsDetected} form(s)`);
  if (summary.phonesDetected?.length) parts.push(`${summary.phonesDetected.length} phone signal(s)`);
  if (summary.ctas?.length) parts.push(`${summary.ctas.length} CTA(s)`);
  return parts.length ? parts.join(", ") : "No obvious lead paths detected";
}

function formatShortList(values = [], limit = 3) {
  const unique = [...new Set(values.filter(Boolean).map(String))];
  const shown = unique.slice(0, limit);
  const suffix = unique.length > limit ? `, +${unique.length - limit} more` : "";
  return `${shown.join(", ")}${suffix}`;
}

function markdownTable(rows) {
  return [
    "| Signal | Finding |",
    "| --- | --- |",
    ...rows.map(([label, value]) => `| ${escapeTable(label)} | ${escapeTable(value)} |`),
  ].join("\n");
}

function yamlString(value) {
  return String(value || "").replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function escapeTable(value) {
  return escapeMarkdown(value).replace(/\|/g, "\\|");
}

function escapeMarkdown(value) {
  return String(value || "").replace(/\n/g, " ");
}
