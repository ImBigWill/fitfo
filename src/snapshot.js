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
  const analysis = scan.analysis || {};
  const marketingTags = scan.analysis?.marketing?.found || [];
  const operationsTools = scan.analysis?.operations?.found || [];
  const connectedServices = scan.analysis?.connectedServices || [];
  const subdomains = scan.dns?.subdomains || [];
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
    accessSignals: [
      ["Domain registrar", confidenceValue(analysis.registrar || "Unknown", analysis.registrarDetails?.confidence)],
      ["DNS host", analysis.dnsProvider || "Unknown"],
      ["Website host", confidenceValue(analysis.hosting?.provider || "Unknown", analysis.hosting?.confidence)],
      ["Cloudflare", cloudflareSummary(analysis.cloudflare)],
      ["Google Workspace", googleWorkspaceSummary(analysis)],
      ["Connected services", summarizeServiceSignals({ connectedServices, marketingTags, operationsTools })],
      ["Subdomains", summarizeSubdomains(subdomains)],
    ],
    readinessVerdict: buildReadinessVerdict(scan, { analysis, siteSummary, subdomains, marketingTags, operationsTools }),
    dnsChangeChecklist: buildDnsChangeChecklist(scan, { analysis, subdomains }),
    serviceSignals: buildServiceSignals({ connectedServices, marketingTags, operationsTools }),
    subdomainsToVerify: buildSubdomainsToVerify(subdomains),
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
      subdomains.length ? makeItem("Subdomains need ownership review", `${subdomains.length} common subdomain(s) resolved. Confirm whether each is live, legacy, staging, portal, booking, or safe to ignore.`) : null,
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
      makeItem("Who owns the domain, DNS, hosting, and email accounts?", "Use the access signals as a checklist before changing records, launching a redesign, or promising a migration."),
      subdomains.length ? makeItem("Which subdomains are still active?", "Confirm staging sites, portals, booking flows, CRM links, shops, mail hosts, and legacy tools before DNS or redirect work.") : null,
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
    panel(theme, "Access Signals", snapshot.accessSignals.map(([label, value]) => snapshotSignalRow(theme, label, value))),
    "",
    panel(theme, "First-Call Readiness", formatReadiness(theme, snapshot.readinessVerdict)),
    "",
    panel(theme, "Before Touching DNS", formatItems(theme, snapshot.dnsChangeChecklist)),
    "",
    panel(theme, "Service Tools To Confirm", formatItems(theme, snapshot.serviceSignals)),
    "",
    panel(theme, "Subdomains To Verify", formatItems(theme, snapshot.subdomainsToVerify)),
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
    "## Access Signals",
    "",
    markdownTable(snapshot.accessSignals),
    "",
    "## First-Call Readiness",
    "",
    `**${escapeMarkdown(snapshot.readinessVerdict.label)}:** ${escapeMarkdown(snapshot.readinessVerdict.summary)}`,
    "",
    ...markdownItems(snapshot.readinessVerdict.reasons),
    "",
    "## Before Touching DNS",
    "",
    ...markdownItems(snapshot.dnsChangeChecklist),
    "",
    "## Service Tools To Confirm",
    "",
    ...markdownItems(snapshot.serviceSignals),
    "",
    "## Subdomains To Verify",
    "",
    ...markdownItems(snapshot.subdomainsToVerify),
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

function formatReadiness(theme, verdict) {
  const chip = verdict.level === "ready" ? theme.blueChip("READY") : verdict.level === "caution" ? theme.chip("CAUTION") : theme.hotChip("BLOCKED");
  return [
    `${chip} ${theme.label(verdict.label)}`,
    `${theme.dim(verdict.summary)}`,
    "",
    ...formatItems(theme, verdict.reasons),
  ];
}

function snapshotSignalRow(theme, label, value) {
  const status = signalStatus(value);
  const chip = status === "found" ? theme.blueChip("FOUND") : status === "verify" ? theme.chip("VERIFY") : theme.hotChip("ASK");
  return `${theme.dim(label.padEnd(17))} ${chip} ${theme.value(value)}`;
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

function buildReadinessVerdict(scan, { analysis = {}, siteSummary = {}, subdomains = [], marketingTags = [], operationsTools = [] }) {
  const blockers = [];
  const cautions = [];
  const positives = [];

  if (!scan.http?.reachable) {
    blockers.push(makeItem("Website unreachable", "The site did not respond during the scan, so start by confirming the live URL and hosting state."));
  } else {
    positives.push(makeItem("Site is reachable", "The walkthrough can start from the live experience instead of a recovery conversation."));
  }

  if (analysis.hosting?.provider === "Unknown" || analysis.hosting?.provider === "Hidden behind Cloudflare") {
    cautions.push(makeItem("Hosting needs confirmation", "Ask who owns the origin host, backups, deployment path, and previous developer handoff."));
  } else if (analysis.hosting?.provider) {
    positives.push(makeItem("Hosting has a likely lead", `Public signals point to ${analysis.hosting.provider}. Confirm access and billing owner.`));
  }

  if (analysis.email?.provider === "Google Workspace") {
    positives.push(makeItem("Google Workspace detected", "Preserve MX, SPF, DKIM, and DMARC before any DNS or nameserver changes."));
  } else if (analysis.email?.provider === "Unknown") {
    cautions.push(makeItem("Email owner unclear", "Confirm mail provider and sender platforms before touching DNS."));
  }

  if (analysis.cloudflare?.status === "Yes" || analysis.cloudflare?.status === "Likely") {
    cautions.push(makeItem("Cloudflare/CDN needs owner", "Confirm whether this is client-owned Cloudflare, host-managed edge, or another CDN/security layer."));
  }

  if (subdomains.length) {
    cautions.push(makeItem("Subdomains need verification", `${subdomains.length} common subdomain(s) resolved. Confirm staging, portals, shops, booking, CRM, mail, and legacy uses.`));
  }

  if (!siteSummary.formsDetected && !siteSummary.phonesDetected?.length && !siteSummary.ctas?.length) {
    cautions.push(makeItem("Lead path is unclear", "Confirm how visitors become leads: calls, forms, booking, chat, CRM, or offline handoff."));
  } else {
    positives.push(makeItem("Lead path signals exist", "Use the walkthrough to validate whether calls, forms, CTAs, and routing are still correct."));
  }

  if (!marketingTags.length && !operationsTools.length) {
    cautions.push(makeItem("Measurement/tooling may be incomplete", "Ask who owns GA4, Search Console, Tag Manager, ads, call tracking, CRM, and booking tools."));
  }

  const level = blockers.length ? "blocked" : cautions.length >= 2 ? "caution" : "ready";
  const label = level === "blocked" ? "Needs recovery before a clean walkthrough" : level === "caution" ? "Good for a first call, but access-risky" : "Ready for a useful first-call walkthrough";
  const summary = level === "blocked"
    ? "Start with URL, hosting, and ownership basics before presenting recommendations."
    : level === "caution"
      ? "The snapshot has enough public signal for the call, but the account/access questions should lead the handoff."
      : "The snapshot has enough public signal to discuss positioning, lead flow, and next steps without heavy caveats.";

  return {
    level,
    label,
    summary,
    reasons: limitItems([...blockers, ...cautions, ...positives], 5),
  };
}

function buildDnsChangeChecklist(scan, { analysis = {}, subdomains = [] }) {
  const items = [
    makeItem("Confirm DNS owner", `${analysis.dnsProvider && analysis.dnsProvider !== "Unknown" ? `Public signals point to ${analysis.dnsProvider}. ` : ""}Get admin access or a delegated invite before changing records.`),
    makeItem("Protect email first", emailDnsChecklistDetail(analysis)),
    makeItem("Confirm website host and rollback path", hostingDnsChecklistDetail(analysis)),
    analysis.cloudflare?.status === "Yes" || analysis.cloudflare?.status === "Likely"
      ? makeItem("Review Cloudflare/CDN settings", "Confirm proxy status, SSL/TLS mode, page rules, redirects, firewall/security rules, and origin records.")
      : makeItem("Confirm whether a CDN exists", "No obvious Cloudflare was detected, but the client or host may still manage caching, security, or redirects."),
    subdomains.length
      ? makeItem("Inventory active subdomains", `${subdomains.length} common subdomain(s) resolved. Verify purpose, owner, and redirect requirements before cutover.`)
      : makeItem("Ask for full DNS export", "Common checks found no subdomains, but only DNS access can confirm all records, wildcards, and provider-managed hostnames."),
    makeItem("Preserve verification and service records", "Keep Google/Microsoft verification, SPF includes, DKIM selectors, CRM, booking, email marketing, and payment platform records intact."),
  ];

  if (!scan.http?.reachable) {
    items.unshift(makeItem("Confirm the real live URL", "The website was not reachable during scan, so verify the intended host before any DNS plan."));
  }

  return items.slice(0, 6);
}

function emailDnsChecklistDetail(analysis = {}) {
  const provider = analysis.email?.provider || "Unknown";
  if (provider === "No mail configured") {
    return "Mail appears intentionally disabled. Confirm that before changing nameservers or removing Null MX records.";
  }
  if (provider === "Unknown") {
    return "Email provider is unclear. Export MX, SPF, DMARC, and known DKIM selectors, then ask what sends mail for this domain.";
  }
  return `${provider} appears active. Export MX, SPF, DMARC, and DKIM selector details before DNS changes.`;
}

function hostingDnsChecklistDetail(analysis = {}) {
  const provider = analysis.hosting?.provider || "Unknown";
  if (provider === "Hidden behind Cloudflare") {
    return "Origin host is hidden behind Cloudflare. Confirm origin server, backups, deployment path, and emergency rollback.";
  }
  if (provider === "Unknown") {
    return "Origin host is unclear. Ask client or previous developer where website files, backups, and server settings live.";
  }
  return `${provider} appears to host the site. Confirm account access, backups, DNS targets, and rollback owner.`;
}

function confidenceValue(value, confidence) {
  const cleaned = String(value || "Unknown");
  return confidence ? `${cleaned} (${confidence})` : cleaned;
}

function cloudflareSummary(cloudflare = {}) {
  const status = cloudflare.status || "Unknown";
  const confidence = cloudflare.confidence ? ` (${cloudflare.confidence})` : "";
  if (status === "Yes") return `Yes${confidence}`;
  if (status === "Likely") return `Likely${confidence}`;
  if (status === "No obvious Cloudflare") return `No obvious Cloudflare${confidence}`;
  return `${status}${confidence}`;
}

function googleWorkspaceSummary(analysis = {}) {
  const emailProvider = analysis.email?.provider || "Unknown";
  const senders = analysis.emailSafety?.senderServices || [];
  const services = analysis.connectedServices || [];
  const googleSignals = [
    emailProvider === "Google Workspace" ? "MX" : null,
    senders.includes("Google Workspace") ? "SPF/sender" : null,
    services.includes("Google verification") ? "site verification" : null,
  ].filter(Boolean);

  if (!googleSignals.length) {
    return "Not detected from MX/TXT records";
  }

  return `Detected via ${googleSignals.join(", ")}`;
}

function summarizeServiceSignals({ connectedServices = [], marketingTags = [], operationsTools = [] }) {
  const services = uniqueValues([...operationsTools, ...marketingTags, ...connectedServices]);
  return services.length ? formatShortList(services, 6) : "No obvious connected service tools detected";
}

function buildServiceSignals({ connectedServices = [], marketingTags = [], operationsTools = [] }) {
  const rows = [
    operationsTools.length ? makeItem("CRM / booking / field service", `${operationsTools.join(", ")}. Confirm account owner, lead routing, notifications, and whether it should stay active.`) : null,
    marketingTags.length ? makeItem("Analytics / marketing", `${marketingTags.join(", ")}. Confirm GA4, Tag Manager, Search Console, ads, pixels, and reporting ownership.`) : null,
    connectedServices.length ? makeItem("DNS-connected services", `${connectedServices.join(", ")}. Preserve verification, sender, and platform records during DNS work.`) : null,
  ].filter(Boolean);

  return rows.length ? rows : [
    makeItem("No obvious service tools detected", "Ask what receives leads today: forms, phone calls, booking widgets, CRM, chat, email, ads, or offline handoff."),
  ];
}

function summarizeSubdomains(subdomains = []) {
  if (!subdomains.length) return "None found in common checks";
  return `${subdomains.length} found: ${formatShortList(subdomains.map((item) => item.name), 4)}`;
}

function buildSubdomainsToVerify(subdomains = []) {
  if (!subdomains.length) {
    return [
      makeItem("No common subdomains resolved", "Still confirm DNS access because wildcard records, provider dashboards, or less common hostnames may not be publicly enumerable."),
    ];
  }

  return subdomains.slice(0, 6).map((subdomain) => {
    const records = [
      subdomain.cnames?.length ? `CNAME ${subdomain.cnames.join(", ")}` : null,
      subdomain.addresses?.length ? `A ${subdomain.addresses.join(", ")}` : null,
    ].filter(Boolean);
    return makeItem(subdomain.name, records.length ? `${records.join("; ")}. Confirm purpose and owner.` : "Resolved in common checks. Confirm purpose and owner.");
  });
}

function signalStatus(value) {
  const text = String(value || "");
  if (/unknown|not detected|none found|no obvious|no clear/i.test(text)) return "ask";
  if (/likely|manual|verify/i.test(text)) return "verify";
  return "found";
}

function summarizeLeadPaths(summary = {}) {
  const parts = [];
  if (summary.formsDetected) parts.push(`${summary.formsDetected} form(s)`);
  if (summary.phonesDetected?.length) parts.push(`${summary.phonesDetected.length} phone signal(s)`);
  if (summary.ctas?.length) parts.push(`${summary.ctas.length} CTA(s)`);
  return parts.length ? parts.join(", ") : "No obvious lead paths detected";
}

function formatShortList(values = [], limit = 3) {
  const unique = uniqueValues(values);
  const shown = unique.slice(0, limit);
  const suffix = unique.length > limit ? `, +${unique.length - limit} more` : "";
  return `${shown.join(", ")}${suffix}`;
}

function uniqueValues(values = []) {
  return [...new Set(values.filter(Boolean).map(String))];
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
