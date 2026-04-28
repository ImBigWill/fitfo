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
    marketResearch: buildMarketResearch(scan),
    kickoffResearch: buildKickoffResearch(scan),
    suggestedStructure: buildSuggestedStructure(scan),
    clientCallIntelligence: buildClientCallIntelligence(scan),
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
    panel(theme, "Suggested Site Structure", brief.suggestedStructure.map((item) => `${theme.bullet("›")} ${theme.label(item.path)} ${theme.dim(item.reason)}`)),
    "",
    panel(theme, "Client Call Intelligence", brief.clientCallIntelligence.map((item) => `${theme.bullet("›")} ${theme.label(item.prompt)} ${theme.dim(item.nextStep)}`)),
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
    "## Market Research",
    "",
    ...brief.marketResearch.map((item) => `- **${item.label}:** ${item.detail}`),
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
    "## Client Call Intelligence",
    "",
    ...brief.clientCallIntelligence.map((item) => `- **${item.prompt}:** ${item.nextStep}`),
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
  const servicePages = pages.filter((page) => /\b(service|repair|install|emergency|commercial|residential)\b/i.test(page.path || ""));
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

function markdownResearchItems(items) {
  return items.map((item) => `- **${item.label}** _${item.source}_: ${item.detail}`);
}

function extractKeywordCandidates(scan) {
  const values = [];
  for (const page of scan.site?.pages || []) {
    values.push(...pathParts(page.path));
    values.push(...(page.headings?.h1 || []));
    values.push(...(page.headings?.h2 || []));
  }

  for (const result of scan.research?.results || []) {
    values.push(result.query || "");
    values.push(result.title || "");
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
    .map((value) => String(value).toLowerCase().replace(/[^a-z0-9\s-]/g, " ").replace(/-/g, " ").replace(/\s+/g, " ").trim())
    .filter((value) => value.length >= 5 && value.length <= 48)
    .filter((value) => !stop.has(value))
    .filter((value) => /\b(clean|drain|electric|emergency|hvac|install|plumb|repair|roof|service|sewer|water)\b/i.test(value)))]
    .slice(0, 12);
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

function yamlString(value) {
  return String(value ?? "").replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function escapeTable(value) {
  return String(value ?? "").replace(/\|/g, "\\|").replace(/\n/g, "<br>");
}
