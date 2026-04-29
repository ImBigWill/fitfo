import { createTheme } from "./theme.js";
import { kv, numbered, panel, renderAppHeader, renderSurface } from "./ui.js";

export function buildBrief(scan) {
  const { domain, http, analysis } = scan;
  const connectedServices = analysis.connectedServices || [];
  const marketing = analysis.marketing?.found || [];
  const subdomains = scan.dns.subdomains || [];
  const site = scan.site || {};
  const siteSummary = site.summary || {};
  const actionReport = buildActionReport(scan);
  const competitorStructure = buildCompetitorStructure(scan, actionReport);
  const reputationSummary = buildReputationSummary(scan, actionReport);
  const serviceLocationRecommendations = buildServiceLocationRecommendations(scan, actionReport);

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
    marketResearch: buildMarketResearch(scan),
    kickoffResearch: buildKickoffResearch(scan),
    actionReport,
    competitorStructure,
    reputationSummary,
    serviceLocationRecommendations,
    suggestedStructure: buildSuggestedStructure(scan),
    clientCallIntelligence: buildClientCallIntelligence(scan),
    confirmationScript: buildConfirmationScript(scan, actionReport, competitorStructure, reputationSummary),
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
    panel(theme, "Market Research", brief.marketResearch.map((item) => `${theme.bullet("›")} ${theme.label(item.label)} ${theme.dim(item.detail)}`)),
    "",
    panel(theme, "Current Site Read", formatResearchItems(theme, brief.kickoffResearch.currentSiteRead)),
    "",
    panel(theme, "Market Snapshot", formatResearchItems(theme, brief.kickoffResearch.marketSnapshot)),
    "",
    panel(theme, "Keyword + Page Opportunities", formatResearchItems(theme, brief.kickoffResearch.keywordPageOpportunities)),
    "",
    panel(theme, "Positioning Hypotheses", formatResearchItems(theme, brief.kickoffResearch.positioningHypotheses)),
    "",
    panel(theme, "Kickoff Call Agenda", formatResearchItems(theme, brief.kickoffResearch.kickoffCallAgenda)),
    "",
    panel(theme, "Detailed Action Report", formatActionReport(theme, brief.actionReport)),
    "",
    panel(theme, "Proof Assets Needed", formatProofAssets(theme, brief.actionReport.proofAssets)),
    "",
    panel(theme, "Content Inventory", formatContentInventory(theme, brief.actionReport.contentInventory)),
    "",
    panel(theme, "Keyword Research", formatKeywordClusters(theme, brief.actionReport.keywordClusters)),
    "",
    panel(theme, "Competitor Research", formatCompetitorResearch(theme, brief.actionReport.competitorResearch)),
    "",
    panel(theme, "Review + Reputation Summary", formatReputationSummary(theme, brief.reputationSummary)),
    "",
    panel(theme, "Competitor-Informed Structure", formatCompetitorStructure(theme, brief.competitorStructure)),
    "",
    panel(theme, "Service + Location Recommendations", formatServiceLocationRecommendations(theme, brief.serviceLocationRecommendations)),
    "",
    panel(theme, "Keyword To Page Map", formatPageMap(theme, brief.actionReport.pageMap)),
    "",
    panel(theme, "Suggested Site Structure", brief.suggestedStructure.map((item) => `${theme.bullet("›")} ${theme.label(item.path)} ${theme.dim(item.reason)}`)),
    "",
    panel(theme, "Client Call Intelligence", brief.clientCallIntelligence.map((item) => `${theme.bullet("›")} ${theme.label(item.prompt)} ${theme.dim(item.nextStep)}`)),
    "",
    panel(theme, "Kickoff Confirmation Script", formatConfirmationScript(theme, brief.confirmationScript)),
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
    "## Detailed Action Report",
    "",
    ...markdownActionReport(brief.actionReport),
    "",
    "## Proof Assets Needed",
    "",
    markdownProofAssets(brief.actionReport.proofAssets),
    "",
    "## Content Inventory",
    "",
    markdownContentInventory(brief.actionReport.contentInventory),
    "",
    "## Keyword Research",
    "",
    ...markdownKeywordClusters(brief.actionReport.keywordClusters),
    "",
    "## Competitor Research",
    "",
    ...markdownCompetitorResearch(brief.actionReport.competitorResearch),
    "",
    "## Review + Reputation Summary",
    "",
    markdownReputationSummary(brief.reputationSummary),
    "",
    "## Competitor-Informed Structure",
    "",
    markdownCompetitorStructure(brief.competitorStructure),
    "",
    "## Service + Location Recommendations",
    "",
    markdownServiceLocationRecommendations(brief.serviceLocationRecommendations),
    "",
    "## Keyword To Page Map",
    "",
    ...markdownPageMap(brief.actionReport.pageMap),
    "",
    "## Confirm On The Call",
    "",
    ...brief.confirmations.flatMap((item) => [
      `- [ ] **${item.label}**`,
      `  ${item.detail}`,
    ]),
    "",
    "## Kickoff Research Brief",
    "",
    "### Current Site Read",
    "",
    ...markdownResearchItems(brief.kickoffResearch.currentSiteRead),
    "",
    "### Market Snapshot",
    "",
    ...markdownResearchItems(brief.kickoffResearch.marketSnapshot),
    "",
    "### Keyword + Page Opportunities",
    "",
    ...markdownResearchItems(brief.kickoffResearch.keywordPageOpportunities),
    "",
    "### Positioning Hypotheses",
    "",
    ...markdownResearchItems(brief.kickoffResearch.positioningHypotheses),
    "",
    "### Kickoff Call Agenda",
    "",
    ...markdownResearchItems(brief.kickoffResearch.kickoffCallAgenda),
    "",
    "## Suggested Site Structure",
    "",
    ...brief.suggestedStructure.map((item) => `- **${item.path}:** ${item.reason}`),
    "",
    "## Site Intelligence",
    "",
    ...brief.siteIntelligence.map((item) => `- **${item.label}:** ${item.detail}`),
    "",
    "## Market Research",
    "",
    ...brief.marketResearch.map((item) => `- **${item.label}:** ${item.detail}`),
    "",
    "## Client Call Intelligence",
    "",
    ...brief.clientCallIntelligence.map((item) => `- **${item.prompt}:** ${item.nextStep}`),
    "",
    "## Kickoff Confirmation Script",
    "",
    markdownConfirmationScript(brief.confirmationScript),
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

function buildMarketResearch(scan) {
  const research = scan.research || {};
  if (!research.enabled) {
    return [{
      label: "Live search",
      detail: "Not enabled. Run with --search to use Firecrawl for market, review, and service SERP research.",
    }];
  }

  const items = [];
  if (!research.available) {
    items.push({
      label: "Firecrawl",
      detail: research.errors?.join("; ") || "Not available.",
    });
  }

  if (research.queries?.length) {
    items.push({
      label: "Queries",
      detail: research.queries.join(" | "),
    });
  }

  for (const result of (research.results || []).slice(0, 8)) {
    items.push({
      label: result.title,
      detail: `${result.url}${result.description ? ` - ${result.description}` : ""}`,
    });
  }

  if (items.length === 0) {
    items.push({
      label: "Search",
      detail: "No results returned. Try a location or more specific client/service context.",
    });
  }

  return items;
}

function buildKickoffResearch(scan) {
  return {
    currentSiteRead: buildCurrentSiteRead(scan),
    marketSnapshot: buildMarketSnapshot(scan),
    keywordPageOpportunities: buildKeywordPageOpportunities(scan),
    positioningHypotheses: buildPositioningHypotheses(scan),
    kickoffCallAgenda: buildKickoffCallAgenda(scan),
  };
}

function buildCurrentSiteRead(scan) {
  const site = scan.site || {};
  const summary = site.summary || {};
  const pages = site.pages || [];
  const homepage = pages.find((page) => page.path === "/" || page.path === "") || pages[0] || {};
  const homeH1 = homepage.headings?.h1?.[0];
  const servicePages = pages.filter((page) => /\b(services?|repairs?|install|installation|emergency|commercial|residential)\b/i.test(page.path || ""));
  const trustPages = pages.filter((page) => /\b(review|testimonial|gallery|project|case-study|about)\b/i.test(page.path || ""));
  const marketing = scan.analysis.marketing?.found || [];
  const operations = scan.analysis.operations?.found || [];

  return [
    {
      label: "Homepage message",
      source: "Observed",
      detail: homeH1 || scan.http.title
        ? `Current public-facing signal is "${homeH1 || scan.http.title}". Confirm this is still the intended offer and market position.`
        : "No clear homepage title or H1 was captured. Confirm the primary offer and audience on the call.",
    },
    {
      label: "Lead paths",
      source: site.enabled ? "Observed" : "Ask Client",
      detail: site.enabled
        ? `Crawl found ${summary.formsDetected || 0} form(s), ${summary.phonesDetected?.length || 0} phone number(s), and ${summary.ctas?.length || 0} CTA label(s). Confirm where each lead goes.`
        : "Run --deep or ask the client how leads arrive today: form, phone, booking widget, chat, CRM, email, or ads.",
    },
    {
      label: "Content footprint",
      source: site.enabled ? "Observed" : "Inferred",
      detail: site.enabled
        ? `${summary.pagesScanned || 0} page(s) crawled; ${servicePages.length} service-like page(s) and ${trustPages.length} proof/trust page(s) detected.`
        : "Deep crawl was not run, so current page inventory is incomplete.",
    },
    {
      label: "Trust and structured data",
      source: site.enabled ? "Observed" : "Ask Client",
      detail: summary.schemaTypes?.length
        ? `Detected schema types: ${summary.schemaTypes.join(", ")}. Confirm reviews, credentials, photos, guarantees, and proof assets.`
        : "No schema types were detected in crawled pages. Confirm reviews, credentials, photos, guarantees, and proof assets.",
    },
    {
      label: "Measurement and ops",
      source: [...marketing, ...operations].length ? "Observed" : "Ask Client",
      detail: [...marketing, ...operations].length
        ? `Visible tools include ${[...marketing, ...operations].join(", ")}. Confirm account owners and whether these should remain active.`
        : "No marketing or CRM tools were detected publicly. Confirm GA4, GTM, Search Console, call tracking, forms, CRM, and booking ownership.",
    },
  ];
}

function buildMarketSnapshot(scan) {
  const research = scan.research || {};
  const results = research.results || [];
  const sameDomain = results.filter((result) => isSameDomain(result.url, scan.domain.apex));
  const external = results.filter((result) => !isSameDomain(result.url, scan.domain.apex));
  const reviewResults = results.filter((result) => /\breview|rating|testimonial|bbb|yelp|google|facebook|angi|homeadvisor\b/i.test(`${result.title} ${result.description} ${result.url}`));
  const serviceResults = results.filter((result) => /\bservice|repair|install|emergency|commercial|residential|near me\b/i.test(`${result.title} ${result.description} ${result.query}`));

  if (!research.enabled) {
    return [
      {
        label: "Live market research",
        source: "Ask Client",
        detail: "Not enabled. Run with --search --location to add review, competitor, and service SERP context before the kickoff call.",
      },
      {
        label: "Location context",
        source: "Ask Client",
        detail: "Confirm the real service area, priority cities, travel radius, and markets that should not be targeted.",
      },
    ];
  }

  const items = [
    {
      label: "Search coverage",
      source: "Research",
      detail: research.available
        ? `${results.length} unique result(s) returned from ${research.queries?.length || 0} query or queries${research.location ? ` around ${research.location}` : ""}.`
        : `Search was enabled but unavailable: ${research.errors?.join("; ") || "no results returned"}.`,
    },
    {
      label: "Owned footprint",
      source: "Research",
      detail: sameDomain.length
        ? `${sameDomain.length} result(s) point back to the client domain. Use these to compare current pages against the planned sitemap.`
        : "No search results pointed back to the client domain in this pass. Confirm search visibility and indexation separately.",
    },
    {
      label: "Review and reputation signals",
      source: reviewResults.length ? "Research" : "Ask Client",
      detail: reviewResults.length
        ? `${reviewResults.length} review/reputation result(s) surfaced. Confirm which profiles matter and who owns them.`
        : "No obvious review results surfaced. Confirm Google Business Profile, Yelp, Facebook, industry directories, and review ownership.",
    },
    {
      label: "Competitor and market SERP",
      source: external.length ? "Research" : "Inferred",
      detail: external.length
        ? `${external.length} external result(s) surfaced. Use them as competitor/market language clues, not proof of direct competition.`
        : "No external results surfaced. Add location/service context or run another search before making competitor claims.",
    },
  ];

  if (serviceResults.length) {
    items.push({
      label: "Service demand clues",
      source: "Research",
      detail: `${serviceResults.length} result(s) include service-intent language. Compare these themes against the current sitemap and priority services.`,
    });
  }

  return items;
}

function buildKeywordPageOpportunities(scan) {
  const site = scan.site || {};
  const pages = site.pages || [];
  const candidates = extractKeywordCandidates(scan).slice(0, 8);
  const hasLocationPages = pages.some((page) => /\b(location|area|city|near)\b/i.test(page.path || ""));
  const hasFaq = pages.some((page) => /\bfaq|question\b/i.test(page.path || ""));
  const hasReviews = pages.some((page) => /\breview|testimonial\b/i.test(page.path || ""));
  const items = [
    {
      label: "Priority keyword candidates",
      source: candidates.length ? "Observed" : "Ask Client",
      detail: candidates.length
        ? `${candidates.join(", ")}. Confirm which terms map to real revenue-driving services.`
        : "No strong keyword candidates were extracted. Ask the client for top services, emergency terms, seasonal work, and undesirable leads.",
    },
    {
      label: "Service page map",
      source: "Inferred",
      detail: "Create one clear page per priority service only when the business can support that work and wants those leads.",
    },
    {
      label: "Location strategy",
      source: hasLocationPages ? "Observed" : "Ask Client",
      detail: hasLocationPages
        ? "Existing location/service-area pages were detected. Confirm which cities deserve dedicated pages and which should be avoided."
        : "No location page pattern was detected. Confirm service area before recommending city landing pages.",
    },
    {
      label: "FAQ and objection content",
      source: hasFaq ? "Observed" : "Inferred",
      detail: hasFaq
        ? "FAQ-like content exists. Review it for sales objections, pricing/process questions, and local SEO usefulness."
        : "Add FAQ/process content where it answers real sales objections and supports service pages.",
    },
    {
      label: "Proof pages",
      source: hasReviews ? "Observed" : "Inferred",
      detail: hasReviews
        ? "Review/testimonial pages exist. Confirm freshness, source, and whether proof can be tied to key services."
        : "Consider reviews, testimonials, project galleries, before/after photos, credentials, and case studies.",
    },
  ];

  return items;
}

function buildPositioningHypotheses(scan) {
  const haystack = buildResearchHaystack(scan);
  const traits = [
    ["Emergency response", /\bemergency|24\/?7|same day|rapid|urgent\b/i],
    ["Local trust", /\blocal|family|owned|community|nearby|neighborhood\b/i],
    ["Licensed or certified", /\blicensed|insured|certified|bonded|accredited\b/i],
    ["Residential focus", /\bresidential|homeowner|home\b/i],
    ["Commercial focus", /\bcommercial|business|facility|property manager\b/i],
    ["Financing or affordability", /\bfinancing|affordable|coupon|special|free estimate\b/i],
  ].filter(([, pattern]) => pattern.test(haystack)).map(([label]) => label);

  const items = [
    {
      label: "Core offer hypothesis",
      source: "Inferred",
      detail: scan.http.title
        ? `The current title suggests the market sees "${scan.http.title}" first. Confirm whether that is still the intended positioning.`
        : "No title was captured. Confirm the core offer, audience, and service area before writing copy.",
    },
    {
      label: "Differentiators to validate",
      source: traits.length ? "Observed" : "Ask Client",
      detail: traits.length
        ? `${traits.join(", ")} surfaced in public copy or search context. Confirm which are true, provable, and worth emphasizing.`
        : "No obvious differentiators surfaced. Ask why customers choose them, why they leave competitors, and what proof exists.",
    },
    {
      label: "Lead quality hypothesis",
      source: "Ask Client",
      detail: "Confirm which leads are profitable, which are distractions, what job sizes matter, and what the website should filter out.",
    },
    {
      label: "Proof gap hypothesis",
      source: "Inferred",
      detail: "Ask for reviews, photos, credentials, project examples, guarantees, awards, partner logos, and before/after stories that support priority services.",
    },
  ];

  return items;
}

function buildKickoffCallAgenda(scan) {
  const research = scan.research || {};
  const agenda = [
    {
      label: "Facts to confirm",
      source: "Observed",
      detail: "Confirm domain/DNS/hosting/email ownership, current site inventory, visible lead paths, tools, and launch URL before deciding scope.",
    },
    {
      label: "Business priorities",
      source: "Ask Client",
      detail: "Rank services, locations, lead types, seasonality, margins, hiring needs, and what the website must change in the next 90 days.",
    },
    {
      label: "Market and SEO assumptions",
      source: research.enabled ? "Research" : "Ask Client",
      detail: research.enabled
        ? "Use search findings as prompts, not conclusions. Ask which competitors, keywords, review profiles, and market claims are actually relevant."
        : "Run --search --location or ask directly about competitors, search terms, review profiles, and market positioning.",
    },
    {
      label: "Content and proof collection",
      source: "Ask Client",
      detail: "Request service details, service areas, photos, reviews, team/process notes, FAQs, credentials, and examples of good/bad leads.",
    },
    {
      label: "Measurement and handoff",
      source: "Ask Client",
      detail: "Confirm analytics, Search Console, Tag Manager, ads, call tracking, forms, CRM, booking tools, previous developer contact, and launch approval owner.",
    },
  ];

  return agenda;
}

function buildActionReport(scan) {
  const keywordClusters = buildKeywordClusters(scan);
  const competitorResearch = buildCompetitorResearch(scan);
  const pageMap = buildKeywordPageMap(scan, keywordClusters);
  const contentInventory = buildContentInventory(scan);
  const proofAssets = buildProofAssets(scan, competitorResearch);

  return {
    priorityActions: buildPriorityActions(scan, keywordClusters, competitorResearch, pageMap),
    keywordClusters,
    competitorResearch,
    pageMap,
    contentInventory,
    proofAssets,
  };
}

function buildPriorityActions(scan, keywordClusters, competitorResearch, pageMap) {
  const site = scan.site || {};
  const summary = site.summary || {};
  const actions = [];
  const add = (priority, owner, label, detail) => actions.push({ priority, owner, label, detail });

  add("High", "Client", "Confirm priority services and markets", "Use detected service and location themes as prompts, then have the client rank the revenue-driving services, cities, lead types, and bad-fit work.");
  add("High", "Us", "Map keywords to pages", pageMap.length
    ? "Use the keyword-to-page map to decide which existing pages should be improved and which new service/location pages should be scoped."
    : "No keyword map was generated. Run deep/search mode or gather service/location priorities manually.");
  add("High", "Client", "Collect proof assets", "Request reviews, project photos, credentials, guarantees, process notes, FAQs, team notes, and before/after examples for priority services.");
  add("High", "Us", "Confirm lead routing and tracking", "Verify forms, phone numbers, booking widgets, CRM, call tracking, GA4, Tag Manager, Search Console, and thank-you/lead attribution before launch.");

  if (summary.pagesScanned && summary.pagesWithMetaDescription < summary.pagesScanned) {
    add("Medium", "Us", "Rewrite missing metadata", `${summary.pagesScanned - summary.pagesWithMetaDescription} crawled page(s) appear to need stronger meta descriptions.`);
  }

  if ((summary.pagesMissingH1 || 0) > 0 || (summary.pagesWithMultipleH1 || 0) > 0) {
    add("Medium", "Us", "Clean page heading structure", `${summary.pagesMissingH1 || 0} page(s) missing H1 and ${summary.pagesWithMultipleH1 || 0} page(s) with multiple H1s should be reviewed before content migration.`);
  }

  if (competitorResearch.competitors.length > 0) {
    add("Medium", "Us", "Review competitor positioning", `${competitorResearch.competitors.length} likely competitor result(s) surfaced. Use them for language and page-pattern comparison, not as final strategy proof.`);
  }

  if (keywordClusters.emergency.length > 0) {
    add("Medium", "Client", "Validate emergency-service intent", "Emergency/high-intent keywords surfaced. Confirm whether these jobs are profitable, staffed, and worth emphasizing.");
  }

  if (!scan.research?.enabled) {
    add("Medium", "Us", "Run market research", "Run with --search --location before finalizing keyword, competitor, and positioning recommendations.");
  }

  return actions;
}

function buildKeywordClusters(scan) {
  const candidates = extractKeywordCandidates(scan);
  const location = scan.research?.location || "";
  const clusters = {
    coreServices: [],
    emergency: [],
    local: [],
    informational: [],
    proofTrust: [],
  };

  for (const keyword of candidates) {
    if (/\bemergency|24 7|24\/7|same day|urgent\b/i.test(keyword)) clusters.emergency.push(keyword);
    if (/\breview|testimonial|best|top|near me\b/i.test(keyword)) clusters.proofTrust.push(keyword);
    if (/\bhow|cost|price|faq|what|why|when|guide\b/i.test(keyword)) clusters.informational.push(keyword);
    if (location && keyword.toLowerCase().includes(location.toLowerCase().split(",")[0].trim())) clusters.local.push(keyword);
    if (/\b(clean|drain|electric|emergency|hvac|install|plumb(?:er|ing)?|repair|roof|service|sewer|water)\b/i.test(keyword)) clusters.coreServices.push(keyword);
  }

  if (location) {
    const locationRoot = location.toLowerCase().split(",")[0].trim();
    const locationText = location.toLowerCase();
    for (const keyword of clusters.coreServices.slice(0, 4)) {
      const normalized = keyword.toLowerCase();
      if (!normalized.includes(locationRoot) && !normalized.includes(locationText)) {
        clusters.local.push(`${keyword} ${location}`);
      }
    }
  }

  return {
    coreServices: uniqueValues(clusters.coreServices).slice(0, 10),
    emergency: uniqueValues(clusters.emergency).slice(0, 8),
    local: uniqueValues(clusters.local).slice(0, 8),
    informational: uniqueValues(clusters.informational).slice(0, 8),
    proofTrust: uniqueValues(clusters.proofTrust).slice(0, 8),
  };
}

function buildCompetitorResearch(scan) {
  const results = scan.research?.results || [];
  const classified = results.map((result) => ({
    ...result,
    type: classifyResearchResult(result, scan.domain.apex),
    patterns: detectCompetitorPatterns(result),
  }));

  return {
    owned: classified.filter((result) => result.type === "owned"),
    competitors: classified.filter((result) => result.type === "competitor"),
    directories: classified.filter((result) => result.type === "directory"),
    reviewProfiles: classified.filter((result) => result.type === "review"),
    socialProfiles: classified.filter((result) => result.type === "social"),
    other: classified.filter((result) => result.type === "other"),
    patterns: summarizeCompetitorPatterns(classified),
  };
}

function buildKeywordPageMap(scan, keywordClusters) {
  const pages = scan.site?.pages || [];
  const location = scan.research?.location || "";
  const keywords = uniqueValues([
    ...keywordClusters.coreServices,
    ...keywordClusters.emergency,
    ...keywordClusters.local,
    ...keywordClusters.informational,
    ...keywordClusters.proofTrust,
  ]).slice(0, 14);

  return keywords.map((keyword) => {
    const intent = classifyKeywordIntent(keyword, location);
    const existingPage = findMatchingPage(keyword, pages, intent);
    return {
      keyword,
      intent,
      priority: intent === "emergency" || intent === "service" ? "High" : "Medium",
      page: existingPage?.path || suggestedPathForKeyword(keyword, intent),
      status: existingPage ? "Improve existing" : "Consider new page",
      note: existingPage
        ? `Existing page found: ${existingPage.path}. Review title, H1, copy depth, proof, CTA, schema, and internal links.`
        : "No obvious existing page found in the crawl. Confirm business value before building.",
    };
  });
}

function buildContentInventory(scan) {
  const pages = scan.site?.pages || [];
  if (!pages.length) {
    return [{
      path: "Unknown",
      type: "Manual",
      title: scan.http?.title || "Unknown",
      status: "Needs crawl",
      action: "Run --deep or manually inventory homepage, service pages, location pages, proof pages, FAQ, and contact paths.",
    }];
  }

  return pages.slice(0, 20).map((page) => {
    const type = classifyPageType(page.path || "/");
    const hasMeta = Boolean(page.metaDescription);
    const h1Count = page.headings?.h1?.length || 0;
    const hasLeadPath = (page.forms?.length || 0) > 0 || (page.phones?.length || 0) > 0 || (page.ctas?.length || 0) > 0;
    const issues = [
      hasMeta ? null : "missing meta",
      h1Count === 1 ? null : h1Count === 0 ? "missing H1" : "multiple H1s",
      hasLeadPath ? null : "no visible lead path",
    ].filter(Boolean);

    return {
      path: page.path || "/",
      type,
      title: page.title || "Unknown",
      status: issues.length ? issues.join(", ") : "Looks usable",
      action: inventoryAction(type, issues),
    };
  });
}

function buildProofAssets(scan, competitorResearch) {
  const pages = scan.site?.pages || [];
  const hasReviews = pages.some((page) => /\breview|testimonial\b/i.test(`${page.path || ""} ${page.title || ""}`));
  const hasAbout = pages.some((page) => /\babout|team|company\b/i.test(`${page.path || ""} ${page.title || ""}`));
  const hasGallery = pages.some((page) => /\bgallery|project|portfolio|case-study|case studies\b/i.test(`${page.path || ""} ${page.title || ""}`));
  const patterns = competitorResearch.patterns.join(" ").toLowerCase();

  return [
    {
      asset: "Reviews and testimonials",
      priority: hasReviews ? "Medium" : "High",
      owner: "Client",
      reason: hasReviews ? "Review/testimonial page exists; confirm freshness, sources, and usage rights." : "No review/testimonial page was crawled; collect review sources and best quotes.",
    },
    {
      asset: "Project photos or before/after examples",
      priority: hasGallery ? "Medium" : "High",
      owner: "Client",
      reason: hasGallery ? "Gallery/project page exists; confirm which examples support priority services." : "No gallery/project page was crawled; collect proof for priority services and locations.",
    },
    {
      asset: "Credentials, licensing, insurance, awards",
      priority: patterns.includes("licensed") ? "High" : "Medium",
      owner: "Client",
      reason: "Needed to substantiate trust claims and local/service-page copy.",
    },
    {
      asset: "Process, guarantees, and service expectations",
      priority: "Medium",
      owner: "Client",
      reason: "Useful for FAQ, conversion copy, lead quality, and objection handling.",
    },
    {
      asset: "Team/company story",
      priority: hasAbout ? "Low" : "Medium",
      owner: "Client",
      reason: hasAbout ? "About/team content exists; confirm it is current." : "No about/team page was crawled; collect credibility and company story notes.",
    },
  ];
}

function buildCompetitorStructure(scan, actionReport) {
  const pages = scan.site?.pages || [];
  const research = actionReport.competitorResearch || {};
  const patterns = research.patterns.join(" ").toLowerCase();
  const pageMap = actionReport.pageMap || [];
  const hasReviews = hasPath(pages, "review") || hasPath(pages, "testimonial");
  const hasAbout = hasPath(pages, "about") || hasPath(pages, "team");
  const hasFaq = hasPath(pages, "faq") || hasPath(pages, "question");
  const hasLocations = hasPath(pages, "location") || hasPath(pages, "area");
  const hasServices = hasPath(pages, "service");
  const items = [];

  const add = (priority, path, trigger, rationale) => {
    if (!items.some((item) => item.path === path)) {
      items.push({ priority, path, trigger, rationale });
    }
  };

  if (!hasServices && (research.competitors?.length || pageMap.some((item) => item.intent === "service"))) {
    add("High", "/services/", "Competitor/service SERPs show service intent", "Create a service hub so priority work is easy to scan, compare, and expand into focused service pages.");
  }

  const serviceTargets = pageMap.filter((item) => ["service", "emergency"].includes(item.intent) && item.page !== "/").slice(0, 3);
  for (const target of serviceTargets) {
    add(target.intent === "emergency" ? "High" : "Medium", target.page, `Keyword signal: ${target.keyword}`, "Scope this only if the client confirms it is profitable, staffed, and supported by proof.");
  }

  if (!hasReviews && ((research.reviewProfiles?.length || 0) > 0 || (research.directories?.length || 0) > 0 || patterns.includes("review proof"))) {
    add("High", "/reviews/", "Review and directory results surfaced", "Centralize reputation proof and decide which third-party profiles should be linked, embedded, or simply monitored.");
  }

  if (scan.research?.location && !hasLocations) {
    add("Medium", "/locations/{city}/", `Search location: ${scan.research.location}`, "Build location pages only for real service areas with local proof, photos, reviews, and operations coverage.");
  }

  if (!hasFaq) {
    add("Medium", "/faq/", "Client-call and SERP questions need a home", "Use this for sales objections, pricing/process questions, emergency expectations, and service-area clarity.");
  }

  if (!hasAbout && (patterns.includes("local ownership") || patterns.includes("licensed/insured"))) {
    add("Medium", "/about/", "Trust patterns surfaced in competitor/reputation research", "Use company story, licensing, insurance, team, process, and proof to support conversion.");
  }

  if (!items.length) {
    add("Medium", "/services/{priority-service}/", "Manual validation needed", "No strong competitor structure signal surfaced. Use the client call to rank services before expanding the sitemap.");
  }

  return items.slice(0, 8);
}

function buildReputationSummary(scan, actionReport) {
  const research = actionReport.competitorResearch || {};
  const reviewProfiles = research.reviewProfiles || [];
  const directories = research.directories || [];
  const socialProfiles = research.socialProfiles || [];
  const owned = research.owned || [];
  const patterns = research.patterns || [];
  const hasReviewsPage = (scan.site?.pages || []).some((page) => /\breview|testimonial\b/i.test(`${page.path || ""} ${page.title || ""}`));

  return [
    {
      channel: "Review profiles",
      signal: reviewProfiles.length ? `${reviewProfiles.length} profile/result signal(s)` : "None detected",
      action: reviewProfiles.length
        ? "Confirm Google Business Profile, Yelp/Angi/industry profile ownership, best reviews, and whether profiles should be linked or monitored."
        : "Ask which review platforms matter and who owns Google Business Profile before writing reputation copy.",
    },
    {
      channel: "Directories",
      signal: directories.length ? `${directories.length} directory signal(s)` : "None detected",
      action: directories.length
        ? "Check NAP consistency, categories, tracking numbers, and whether directory pages outrank the client."
        : "Confirm whether industry/local directories are part of the acquisition mix.",
    },
    {
      channel: "Owned proof",
      signal: hasReviewsPage || owned.length ? "Owned proof exists or surfaced" : "No owned review/testimonial proof found in crawl/search",
      action: hasReviewsPage
        ? "Refresh testimonials, citations, source links, review schema, and service-specific proof."
        : "Plan a reviews/proof page or proof blocks if the client can provide usable review assets.",
    },
    {
      channel: "Social proof",
      signal: socialProfiles.length ? `${socialProfiles.length} social profile signal(s)` : "None detected",
      action: socialProfiles.length
        ? "Confirm which social profiles are active, who owns them, and whether they should appear on the site."
        : "Ask whether social channels drive trust, recruiting, or leads before adding them to the website.",
    },
    {
      channel: "Market patterns",
      signal: patterns.length ? patterns.join(", ") : "No repeated patterns detected",
      action: "Use these as prompts for proof collection, not as final positioning until the client confirms what is true.",
    },
  ];
}

function buildServiceLocationRecommendations(scan, actionReport) {
  const pageMap = actionReport.pageMap || [];
  const pages = scan.site?.pages || [];
  const hasLocationPages = pages.some((page) => classifyPageType(page.path || "/") === "Location");
  const location = scan.research?.location || "";
  const items = [];
  const add = (priority, type, page, focus, recommendation) => {
    if (!items.some((item) => item.page === page && item.focus === focus)) {
      items.push({ priority, type, page, focus, recommendation });
    }
  };

  for (const item of pageMap.filter((entry) => ["service", "emergency"].includes(entry.intent)).slice(0, 5)) {
    add(
      item.intent === "emergency" ? "High" : item.priority,
      item.intent === "emergency" ? "Emergency service" : "Service",
      item.page,
      item.keyword,
      item.status === "Improve existing"
        ? "Improve copy depth, proof, FAQs, CTA, metadata, schema, and internal links on the existing page."
        : "Confirm business value and staffing before building a focused page for this service.",
    );
  }

  for (const item of pageMap.filter((entry) => entry.intent === "local").slice(0, 4)) {
    add(
      "Medium",
      "Location",
      item.page,
      item.keyword,
      item.status === "Improve existing"
        ? "Add local proof, service-area clarity, reviews, photos, and conversion paths to the existing page."
        : "Build only if this is a real service area with operations coverage, local proof, and enough demand.",
    );
  }

  if (location && !hasLocationPages && !items.some((item) => item.type === "Location")) {
    add(
      "Medium",
      "Location",
      "/locations/{city}/",
      location,
      "Confirm priority cities and service radius before creating location pages.",
    );
  }

  if (!items.length) {
    add(
      "High",
      "Manual",
      "/services/{priority-service}/",
      "Client-ranked services",
      "No strong service/location map was generated. Ask the client to rank services and markets before scoping pages.",
    );
  }

  return items.slice(0, 10);
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

function buildConfirmationScript(scan, actionReport, competitorStructure, reputationSummary) {
  const keywordExamples = uniqueValues([
    ...(actionReport.keywordClusters?.coreServices || []),
    ...(actionReport.keywordClusters?.local || []),
  ]).slice(0, 4);
  const competitorExamples = (actionReport.competitorResearch?.competitors || []).slice(0, 3).map((result) => result.title || result.url);
  const reputationSignals = reputationSummary.filter((item) => !/^None detected$/i.test(item.signal)).map((item) => item.channel);

  return [
    {
      topic: "Priority services and markets",
      ask: keywordExamples.length
        ? `We found signals around ${keywordExamples.join(", ")}. Which of these are profitable, staffed, and worth building around?`
        : "Which services, locations, and lead types should the website prioritize first?",
      why: "Prevents building pages for services the client does not want or cannot support.",
    },
    {
      topic: "Competitor reality check",
      ask: competitorExamples.length
        ? `These competitors or market results surfaced: ${competitorExamples.join(", ")}. Which ones are actually relevant, and who else should we inspect?`
        : "Who are the real competitors the client cares about, and which competitors are irrelevant noise?",
      why: "Search results are research prompts, not strategy by themselves.",
    },
    {
      topic: "Reputation ownership",
      ask: reputationSignals.length
        ? `We saw reputation signals around ${reputationSignals.join(", ")}. Who owns those profiles, and which proof can we use on the site?`
        : "Which review profiles, testimonials, photos, credentials, and proof assets can we use publicly?",
      why: "Proof assets shape conversion pages, review pages, schema, and claims.",
    },
    {
      topic: "Structure approval",
      ask: `Does this initial structure make sense: ${competitorStructure.slice(0, 4).map((item) => item.path).join(", ")}? What should be removed before we scope content?`,
      why: "Keeps the sitemap tied to business reality instead of generic SEO expansion.",
    },
    {
      topic: "Lead routing and measurement",
      ask: "Where should forms, calls, booking widgets, and quote requests go, and who owns GA4, GTM, Search Console, ads, CRM, and call tracking?",
      why: "Launch work is risky until routing, attribution, and account ownership are clear.",
    },
    {
      topic: "Handoff blockers",
      ask: "Who can grant access to registrar, DNS, hosting, CMS, email, analytics, CRM, backups, and previous developer notes?",
      why: "These are the likely blockers before implementation or launch.",
    },
  ];
}

function buildClientCallIntelligence(scan) {
  const { analysis } = scan;
  const site = scan.site || {};
  const summary = site.summary || {};
  const prompts = [
    {
      prompt: "Confirm lead flow",
      nextStep: buildLeadFlowPrompt(scan),
    },
    {
      prompt: "Confirm CRM/booking owner",
      nextStep: buildOwnerPrompt(analysis.connectedServices || []),
    },
    {
      prompt: "Confirm canonical launch host",
      nextStep: "Decide whether apex or www is the primary launch URL, then align redirects, SSL, Search Console, analytics, and DNS records to that host.",
    },
    {
      prompt: "Confirm top services/markets",
      nextStep: site.enabled
        ? `Use the ${summary.pagesScanned || 0} crawled page(s) as a starting inventory, then have the client rank revenue-driving services, markets, and locations.`
        : "Ask the client to rank revenue-driving services, markets, and locations before committing to sitemap and content scope.",
    },
    {
      prompt: "Confirm analytics/Search Console access",
      nextStep: buildMeasurementPrompt(analysis.marketing?.found || []),
    },
    {
      prompt: "Confirm prior developer handoff",
      nextStep: buildHandoffPrompt(scan),
    },
  ];

  if ((scan.dns.subdomains || []).length > 0) {
    prompts.push({
      prompt: "Confirm legacy tools and staging",
      nextStep: "Review discovered subdomains with the client for staging sites, portals, booking flows, CRMs, shops, or legacy apps that need redirects or access.",
    });
  }

  if (analysis.cms.platform === "WordPress") {
    prompts.push({
      prompt: "Confirm WordPress change owner",
      nextStep: "Identify who can approve admin access, plugin updates, theme edits, backups, form changes, and launch-window freezes.",
    });
  }

  return prompts.slice(0, 8);
}

function buildLeadFlowPrompt(scan) {
  const summary = scan.site?.summary || {};
  if (scan.site?.enabled) {
    const forms = summary.formsDetected || 0;
    const phones = summary.phonesDetected?.length || 0;
    const ctas = summary.ctas?.length || 0;
    return `Crawl detected ${forms} form(s), ${phones} phone number(s), and ${ctas} CTA label(s). Confirm where each lead lands, who responds, and what should be tracked.`;
  }

  return "Deep crawl was not run. Confirm whether leads arrive through forms, phone calls, booking widgets, chat, email, ads, or offline handoff.";
}

function buildOwnerPrompt(connectedServices) {
  if (connectedServices.length > 0) {
    return `FITFO detected ${connectedServices.join(", ")}. Confirm who owns each account, billing, notifications, and launch-critical integrations.`;
  }

  return "No CRM or booking platform was detected from public signals. Ask what receives website leads today and who can grant access.";
}

function buildMeasurementPrompt(marketingTags) {
  if (marketingTags.length > 0) {
    return `FITFO detected ${marketingTags.join(", ")}. Confirm GA4, Tag Manager, Search Console, ads, call tracking, and reporting ownership before changing tags.`;
  }

  return "No marketing tags were detected. Confirm whether GA4, Search Console, Tag Manager, ads, call tracking, and form attribution need to be created or recovered.";
}

function buildHandoffPrompt(scan) {
  const hosting = scan.analysis.hosting || {};
  if (hosting.provider === "Unknown" || hosting.provider === "Hidden behind Cloudflare") {
    return "Hosting is not clear from public records. Ask for the previous developer, host, registrar, DNS, backups, deployment path, and emergency contact.";
  }

  return `Hosting appears to be ${hosting.provider}. Ask for previous developer contact, host access, backups, deployment notes, DNS change process, and billing owner.`;
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

function formatResearchItems(theme, items) {
  return items.map((item) => `${theme.bullet("›")} ${theme.label(item.label)} ${theme.chip(`[${item.source}]`)} ${theme.dim(item.detail)}`);
}

function formatActionReport(theme, report) {
  return report.priorityActions.map((item) => (
    `${theme.bullet("›")} ${theme.label(item.label)} ${theme.chip(`[${item.priority}]`)} ${theme.dim(`${item.owner}: ${item.detail}`)}`
  ));
}

function formatProofAssets(theme, proofAssets) {
  return proofAssets.map((item) => `${theme.bullet("›")} ${theme.label(item.asset)} ${theme.chip(`[${item.priority}]`)} ${theme.dim(`${item.owner}: ${item.reason}`)}`);
}

function formatContentInventory(theme, inventory) {
  return inventory.slice(0, 10).map((item) => `${theme.bullet("›")} ${theme.label(item.path)} ${theme.dim(`${item.type} | ${item.status} | ${item.action}`)}`);
}

function formatKeywordClusters(theme, clusters) {
  return [
    formatCluster(theme, "Core services", clusters.coreServices),
    formatCluster(theme, "Emergency / high intent", clusters.emergency),
    formatCluster(theme, "Local modifiers", clusters.local),
    formatCluster(theme, "Informational", clusters.informational),
    formatCluster(theme, "Proof / trust", clusters.proofTrust),
  ];
}

function formatCluster(theme, label, values) {
  return `${theme.bullet("›")} ${theme.label(label)} ${theme.dim(values.length ? values.join(", ") : "No strong signals yet")}`;
}

function formatCompetitorResearch(theme, research) {
  return [
    `${theme.bullet("›")} ${theme.label("Likely competitors")} ${theme.dim(formatResultTitles(research.competitors))}`,
    `${theme.bullet("›")} ${theme.label("Directories")} ${theme.dim(formatResultTitles(research.directories))}`,
    `${theme.bullet("›")} ${theme.label("Review profiles")} ${theme.dim(formatResultTitles(research.reviewProfiles))}`,
    `${theme.bullet("›")} ${theme.label("Owned footprint")} ${theme.dim(formatResultTitles(research.owned))}`,
    `${theme.bullet("›")} ${theme.label("Observed patterns")} ${theme.dim(research.patterns.length ? research.patterns.join(", ") : "No repeated competitor patterns detected")}`,
  ];
}

function formatReputationSummary(theme, reputationSummary) {
  return reputationSummary.map((item) => `${theme.bullet("›")} ${theme.label(item.channel)} ${theme.dim(`${item.signal} | ${item.action}`)}`);
}

function formatCompetitorStructure(theme, structure) {
  return structure.map((item) => `${theme.bullet("›")} ${theme.label(item.path)} ${theme.chip(`[${item.priority}]`)} ${theme.dim(`${item.trigger}: ${item.rationale}`)}`);
}

function formatServiceLocationRecommendations(theme, recommendations) {
  return recommendations.map((item) => `${theme.bullet("›")} ${theme.label(item.page)} ${theme.chip(`[${item.priority}]`)} ${theme.dim(`${item.type}: ${item.focus}. ${item.recommendation}`)}`);
}

function formatPageMap(theme, pageMap) {
  if (!pageMap.length) {
    return [`${theme.bullet("›")} ${theme.label("No map yet")} ${theme.dim("Run --deep --search or confirm service priorities manually.")}`];
  }

  return pageMap.slice(0, 10).map((item) => (
    `${theme.bullet("›")} ${theme.label(item.keyword)} ${theme.chip(`[${item.priority}]`)} ${theme.dim(`${item.status}: ${item.page} (${item.intent})`)}`
  ));
}

function formatConfirmationScript(theme, script) {
  return script.map((item, index) => numbered(theme, index + 1, item.topic, `${item.ask} ${item.why}`));
}

function markdownResearchItems(items) {
  return items.map((item) => `- **${item.label}** _${item.source}_: ${item.detail}`);
}

function markdownActionReport(report) {
  return [
    markdownTableWithHeaders(["Priority", "Owner", "Action", "Detail"], report.priorityActions.map((item) => [
      item.priority,
      item.owner,
      item.label,
      item.detail,
    ])),
  ];
}

function markdownProofAssets(proofAssets) {
  return markdownTableWithHeaders(["Priority", "Owner", "Asset", "Reason"], proofAssets.map((item) => [
    item.priority,
    item.owner,
    item.asset,
    item.reason,
  ]));
}

function markdownContentInventory(inventory) {
  return markdownTableWithHeaders(["Path", "Type", "Title", "Status", "Action"], inventory.map((item) => [
    item.path,
    item.type,
    item.title,
    item.status,
    item.action,
  ]));
}

function markdownKeywordClusters(clusters) {
  return [
    markdownTableWithHeaders(["Cluster", "Keywords"], [
      ["Core services", clusters.coreServices.length ? clusters.coreServices.join(", ") : "No strong signals yet"],
      ["Emergency / high intent", clusters.emergency.length ? clusters.emergency.join(", ") : "No strong signals yet"],
      ["Local modifiers", clusters.local.length ? clusters.local.join(", ") : "No strong signals yet"],
      ["Informational", clusters.informational.length ? clusters.informational.join(", ") : "No strong signals yet"],
      ["Proof / trust", clusters.proofTrust.length ? clusters.proofTrust.join(", ") : "No strong signals yet"],
    ]),
  ];
}

function markdownCompetitorResearch(research) {
  return [
    markdownTableWithHeaders(["Type", "Results"], [
      ["Likely competitors", formatResultTitles(research.competitors)],
      ["Directories", formatResultTitles(research.directories)],
      ["Review profiles", formatResultTitles(research.reviewProfiles)],
      ["Owned footprint", formatResultTitles(research.owned)],
      ["Observed patterns", research.patterns.length ? research.patterns.join(", ") : "No repeated competitor patterns detected"],
    ]),
  ];
}

function markdownReputationSummary(reputationSummary) {
  return markdownTableWithHeaders(["Channel", "Signal", "Action"], reputationSummary.map((item) => [
    item.channel,
    item.signal,
    item.action,
  ]));
}

function markdownCompetitorStructure(structure) {
  return markdownTableWithHeaders(["Priority", "Path", "Trigger", "Rationale"], structure.map((item) => [
    item.priority,
    item.path,
    item.trigger,
    item.rationale,
  ]));
}

function markdownServiceLocationRecommendations(recommendations) {
  return markdownTableWithHeaders(["Priority", "Type", "Page", "Focus", "Recommendation"], recommendations.map((item) => [
    item.priority,
    item.type,
    item.page,
    item.focus,
    item.recommendation,
  ]));
}

function markdownPageMap(pageMap) {
  if (!pageMap.length) return ["- No keyword page map yet. Run `--deep --search` or confirm service priorities manually."];
  return [
    markdownTableWithHeaders(["Priority", "Intent", "Keyword", "Page", "Status", "Note"], pageMap.slice(0, 14).map((item) => [
      item.priority,
      item.intent,
      item.keyword,
      item.page,
      item.status,
      item.note,
    ])),
  ];
}

function markdownConfirmationScript(script) {
  return markdownTableWithHeaders(["Topic", "Ask", "Why"], script.map((item) => [
    item.topic,
    item.ask,
    item.why,
  ]));
}

function extractKeywordCandidates(scan) {
  const values = [];
  const location = scan.research?.location || "";
  for (const page of scan.site?.pages || []) {
    values.push(...pathParts(page.path));
    values.push(...(page.headings?.h1 || []));
    values.push(...(page.headings?.h2 || []));
  }

  for (const result of scan.research?.results || []) {
    values.push(result.query || "");
  }

  const stop = new Set([
    "about",
    "best",
    "client",
    "contact",
    "example",
    "home",
    "near",
    "page",
    "reviews",
    "services",
    "with",
  ]);

  return [...new Set(values
    .map((value) => cleanKeywordCandidate(value, location))
    .filter((value) => value.length >= 5 && value.length <= 48)
    .filter((value) => !stop.has(value))
    .filter((value) => /\b(clean|drain|electric|emergency|hvac|install|plumb(?:er|ing)?|repair|roof|service|sewer|water)\b/i.test(value)))]
    .slice(0, 12);
}

function cleanKeywordCandidate(value, location = "") {
  let text = String(value || "")
    .toLowerCase()
    .replace(/["'`]/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/-/g, " ")
    .replace(/\b(the\s+best\s+10|top\s+10\s+best|updated\s+\d{4})\b/g, " ")
    .replace(/\b(reviews?|ratings?|services?)\b$/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const locationRoot = String(location || "").split(",")[0].toLowerCase().replace(/[^a-z0-9\s]/g, " ").trim();
  const state = String(location || "").split(",")[1]?.toLowerCase().replace(/[^a-z]/g, "").trim();
  if (locationRoot) {
    text = collapseRepeatedLocation(text, locationRoot, state);
  }

  return text.replace(/\s+/g, " ").trim();
}

function collapseRepeatedLocation(text, locationRoot, state) {
  const rootPattern = escapeRegExp(locationRoot).replace(/\s+/g, "\\s+");
  const statePattern = state ? `\\s+${escapeRegExp(state)}` : "";
  const duplicatedLocation = new RegExp(`\\b(${rootPattern})\\s+([^\\s].*?)\\s+\\1${statePattern}\\b`, "i");
  const match = text.match(duplicatedLocation);
  if (match) {
    return `${match[1]} ${match[2]}`.trim();
  }

  const trailingLocation = new RegExp(`\\s+${rootPattern}${statePattern}\\b`, "i");
  return text.replace(trailingLocation, "").trim();
}

function pathParts(path) {
  return String(path || "")
    .split("/")
    .map((part) => part.replace(/-/g, " ").trim())
    .filter(Boolean);
}

function buildResearchHaystack(scan) {
  const pages = scan.site?.pages || [];
  const results = scan.research?.results || [];
  return [
    scan.http?.title || "",
    ...pages.flatMap((page) => [
      page.title || "",
      page.metaDescription || "",
      ...(page.headings?.h1 || []),
      ...(page.headings?.h2 || []),
      ...(page.ctas || []),
    ]),
    ...results.flatMap((result) => [result.title || "", result.description || "", result.query || ""]),
  ].join("\n");
}

function classifyResearchResult(result, apex) {
  const text = `${result.title || ""} ${result.description || ""} ${result.url || ""}`.toLowerCase();
  const hostname = safeHostname(result.url);
  if (isSameDomain(result.url, apex)) return "owned";
  if (/\b(facebook|instagram|linkedin|youtube|x\.com|twitter|tiktok)\b/i.test(hostname)) return "social";
  if (/\b(yelp|angi|angieslist|homeadvisor|bbb|thumbtack|houzz|nextdoor|yellowpages|mapquest|porch)\b/i.test(hostname)) {
    return /\breview|rating|stars?\b/i.test(text) ? "review" : "directory";
  }
  if (/\breview|rating|testimonial|complaints?\b/i.test(text)) return "review";
  if (/\b(service|repair|install|emergency|commercial|residential|plumb(?:er|ing)?|hvac|roof|electric)\b/i.test(text)) return "competitor";
  return "other";
}

function detectCompetitorPatterns(result) {
  const text = `${result.title || ""} ${result.description || ""} ${result.query || ""}`.toLowerCase();
  const patterns = [];
  const checks = [
    ["emergency service", /\bemergency|24\/?7|same day|urgent\b/i],
    ["review proof", /\breview|rating|stars?|testimonial\b/i],
    ["local ownership", /\blocal|family owned|locally owned|community\b/i],
    ["licensed/insured", /\blicensed|insured|certified|bonded\b/i],
    ["free estimates", /\bfree estimate|estimate|quote\b/i],
    ["financing", /\bfinancing|payment plan\b/i],
  ];

  for (const [label, pattern] of checks) {
    if (pattern.test(text)) patterns.push(label);
  }

  return patterns;
}

function summarizeCompetitorPatterns(results) {
  const counts = new Map();
  for (const pattern of results.flatMap((result) => result.patterns || [])) {
    counts.set(pattern, (counts.get(pattern) || 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([pattern, count]) => `${pattern} (${count})`)
    .slice(0, 8);
}

function findMatchingPage(keyword, pages, intent = "service") {
  const tokens = keywordTokens(keyword);
  if (!tokens.length) return null;

  let bestPage = null;
  let bestScore = 0;

  for (const page of pages) {
    if (!pageMatchesIntent(page, intent)) continue;

    const haystack = [
      page.path || "",
      page.title || "",
      page.metaDescription || "",
      ...(page.headings?.h1 || []),
      ...(page.headings?.h2 || []),
    ].join(" ").toLowerCase();

    const score = tokens.filter((token) => haystack.includes(token)).length;
    if (score > bestScore) {
      bestPage = page;
      bestScore = score;
    }
  }

  const minimumScore = tokens.length <= 1 ? 1 : 2;
  return bestScore >= minimumScore ? bestPage : null;
}

function pageMatchesIntent(page, intent) {
  const type = classifyPageType(page.path || "/");
  const text = `${page.path || ""} ${page.title || ""}`.toLowerCase();

  if (intent === "proof") {
    return type === "Proof" || /\breview|testimonial|case-study|gallery|project\b/.test(text);
  }

  if (intent === "informational") {
    return type === "FAQ" || /\bfaq|question|guide|blog|resource\b/.test(text);
  }

  if (intent === "local") {
    return type === "Location" || type === "Homepage" || /\blocation|area|city|county|near\b/.test(text);
  }

  return type === "Service" || type === "Homepage";
}

function classifyKeywordIntent(keyword, location = "") {
  if (/\bemergency|24 7|24\/7|same day|urgent\b/i.test(keyword)) return "emergency";
  if (/\breview|testimonial|best|top\b/i.test(keyword)) return "proof";
  if (/\bhow|cost|price|faq|what|why|when|guide\b/i.test(keyword)) return "informational";
  const locationRoot = String(location || "").split(",")[0].trim();
  if (/\bnear me|city|county\b/i.test(keyword) || (locationRoot && keyword.toLowerCase().includes(locationRoot.toLowerCase()))) return "local";
  return "service";
}

function suggestedPathForKeyword(keyword, intent) {
  const slug = slugifyKeyword(keyword);
  if (intent === "local") return `/locations/${slug}/`;
  if (intent === "informational") return `/faq/${slug}/`;
  if (intent === "proof") return "/reviews/";
  return `/services/${slug}/`;
}

function classifyPageType(path) {
  const value = String(path || "/").toLowerCase();
  if (value === "/" || value === "") return "Homepage";
  if (/\bservice|repair|install|emergency|drain|plumb|hvac|roof|electric\b/.test(value)) return "Service";
  if (/\blocation|area|city|near\b/.test(value)) return "Location";
  if (/\breview|testimonial\b/.test(value)) return "Proof";
  if (/\bgallery|project|portfolio|case-study\b/.test(value)) return "Proof";
  if (/\bfaq|question\b/.test(value)) return "FAQ";
  if (/\bcontact|quote|schedule|book\b/.test(value)) return "Conversion";
  if (/\babout|team|company\b/.test(value)) return "Trust";
  return "Content";
}

function inventoryAction(type, issues) {
  if (!issues.length) return "Keep, refresh proof and CTA during content pass.";
  if (type === "Service") return "Improve service intent, proof, FAQs, CTA, metadata, and internal links.";
  if (type === "Location") return "Confirm real service area and add local proof before expanding.";
  if (type === "Conversion") return "Verify lead routing, tracking, thank-you flow, and mobile usability.";
  if (type === "Proof") return "Refresh testimonials, review sources, project examples, and usage rights.";
  if (type === "Homepage") return "Clarify offer, service area, proof, and primary conversion path.";
  return "Review content quality, metadata, headings, CTA, and role in the sitemap.";
}

function keywordTokens(keyword) {
  return String(keyword || "")
    .toLowerCase()
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 3)
    .filter((token) => !["best", "near", "service", "services"].includes(token));
}

function slugifyKeyword(keyword) {
  return String(keyword || "service")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "service";
}

function formatResultTitles(results) {
  return results.length ? results.slice(0, 5).map((result) => result.title || result.url).join(", ") : "None detected";
}

function uniqueValues(values) {
  return [...new Set(values.map((value) => String(value || "").trim()).filter(Boolean))];
}

function escapeRegExp(value) {
  return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function safeHostname(url) {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return "";
  }
}

function isSameDomain(url, apex) {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, "");
    return hostname === apex || hostname.endsWith(`.${apex}`);
  } catch {
    return false;
  }
}

function markdownTable(rows) {
  return [
    "| Field | Value |",
    "| --- | --- |",
    ...rows.map(([key, value]) => `| ${escapeTable(key)} | ${escapeTable(value)} |`),
  ].join("\n");
}

function markdownTableWithHeaders(headers, rows) {
  return [
    `| ${headers.map(escapeTable).join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map(escapeTable).join(" | ")} |`),
  ].join("\n");
}

function yamlString(value) {
  return String(value ?? "").replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function escapeTable(value) {
  return String(value ?? "").replace(/\|/g, "\\|").replace(/\n/g, "<br>");
}
