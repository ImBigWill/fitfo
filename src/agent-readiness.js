export function buildAgentReadiness(scan = {}) {
  const site = scan.site || {};
  const analysis = scan.analysis || {};
  const rows = [];

  rows.push(buildRobotsRow(site));
  rows.push(buildSitemapRow(site));
  rows.push(buildCanonicalRow(scan, analysis));
  rows.push(buildContentRow(site));
  rows.push(buildNoindexRow(site));
  rows.push(buildAiPolicyRow(site));
  rows.push({
    area: "Protocol Discovery",
    signal: ".well-known / MCP / OAuth metadata",
    status: "Not applicable",
    evidence: "No application/API protocol discovery check is enabled yet.",
    action: "Park for app/API sites; do not add emerging protocols to a normal local-business site without a product reason.",
  });
  rows.push({
    area: "Commerce",
    signal: "Agentic commerce protocols",
    status: "Not applicable",
    evidence: "No commerce workflow is in scope for the current onboarding scan.",
    action: "Keep x402, MPP, UCP, and ACP checks parked until FITFO has a practical commerce use case.",
  });

  return {
    summary: summarizeAgentReadiness(rows),
    rows,
  };
}

function buildRobotsRow(site) {
  if (!site.enabled) {
    return row("Discoverability", "robots.txt", "Not checked", "Deep crawl was not enabled.", "Run `fitfo plan domain.com --deep --agent-ready` to check robots.txt.");
  }

  if (site.robots?.checked) {
    return row("Discoverability", "robots.txt", "Found", `${site.robots.sitemapUrls?.length || 0} sitemap reference(s) found in robots.txt.`, "Review crawler and AI crawler policy before launch.");
  }

  return row("Discoverability", "robots.txt", "Missing or blocked", "robots.txt was not reachable during the deep crawl.", "Confirm whether this is intentional and publish clear crawler rules before launch.");
}

function buildSitemapRow(site) {
  if (!site.enabled) {
    return row("Discoverability", "sitemap.xml", "Not checked", "Deep crawl was not enabled.", "Run deep mode before launch planning.");
  }

  const sitemapUrls = site.sitemap?.urls?.length || 0;
  const robotsReferences = site.robots?.sitemapUrls?.length || 0;
  if (sitemapUrls || robotsReferences) {
    return row("Discoverability", "sitemap.xml", "Found", `${sitemapUrls} sitemap URL(s) extracted; ${robotsReferences} robots.txt sitemap reference(s).`, "Verify the future sitemap uses the final canonical host and launch URLs.");
  }

  return row("Discoverability", "sitemap.xml", "Missing or empty", "No sitemap URLs were extracted from common sitemap locations or robots.txt references.", "Publish a sitemap before launch so search engines and agents have a reliable URL inventory.");
}

function buildCanonicalRow(scan, analysis) {
  const urlStructure = analysis.urlStructure || {};
  const issues = urlStructure.issues || [];
  const preferredHost = urlStructure.preferredHost && urlStructure.preferredHost !== "Unknown" ? urlStructure.preferredHost : null;

  if (issues.length) {
    return row("Discoverability", "Canonical host", "Review", issues.map((issue) => issue.summary).join(" "), "Resolve apex/www and HTTP/HTTPS behavior before making agent-readiness claims.");
  }

  if (preferredHost) {
    return row("Discoverability", "Canonical host", "Found", `${urlStructure.preferredProtocol || "HTTPS"} ${preferredHost}`, "Preserve this canonical host across redirects, sitemap, canonical tags, and launch QA.");
  }

  return row("Discoverability", "Canonical host", "Unknown", scan.domain?.apex || "No domain evidence", "Confirm the intended live host before redesign and launch.");
}

function buildContentRow(site) {
  if (!site.enabled) {
    return row("Content", "Readable public pages", "Not checked", "Deep crawl was not enabled.", "Run `fitfo plan domain.com --deep --agent-ready` to verify important public pages are readable without app-only rendering.");
  }

  const pages = site.pages || [];
  const readablePages = pages.filter((page) => Number(page.wordCount || 0) > 50);
  if (readablePages.length) {
    return row("Content", "Readable public pages", "Found", `${readablePages.length} of ${pages.length} crawled page(s) had extractable text.`, "Keep critical launch copy, headings, metadata, and CTAs extractable for crawlers and agents.");
  }

  if (pages.length) {
    return row("Content", "Readable public pages", "Review", `${pages.length} page(s) crawled, but little extractable text was found.`, "Check whether important content depends on JavaScript, gated rendering, or blocked resources.");
  }

  return row("Content", "Readable public pages", "Missing or blocked", "No pages were successfully crawled.", "Confirm the site is reachable and public pages can be fetched before launch.");
}

function buildNoindexRow(site) {
  if (!site.enabled || !site.pages?.length) {
    return row("Content", "Noindex / robots meta", "Not checked", "No crawled page metadata is available.", "Run deep mode and inspect launch pages for accidental noindex rules.");
  }

  const blocked = site.pages.filter((page) => /noindex|none/i.test(page.metaRobots || ""));
  if (blocked.length) {
    return row("Content", "Noindex / robots meta", "Review", `${blocked.length} crawled page(s) include noindex/none meta robots directives.`, "Confirm whether those pages should remain blocked after launch.");
  }

  return row("Content", "Noindex / robots meta", "Clear", "No noindex/none meta robots directives found in crawled pages.", "Re-check after launch on the final production host.");
}

function buildAiPolicyRow(site) {
  if (!site.enabled) {
    return row("Bot Access", "AI crawler policy", "Not checked", "Deep crawl was not enabled.", "Run deep mode to inspect robots.txt before deciding AI crawler policy.");
  }

  if (!site.robots?.checked) {
    return row("Bot Access", "AI crawler policy", "Unknown", "robots.txt was not reachable.", "Decide and publish intentional AI crawler rules if the client has a policy preference.");
  }

  const rules = site.robots.aiCrawlerRules || [];
  if (rules.length) {
    const evidence = rules.slice(0, 6).map((rule) => `${rule.agent} ${rule.directive}: ${rule.path}`).join("; ");
    return row("Bot Access", "AI crawler policy", "Found", evidence, "Confirm whether these allow/block rules match the client's content and AI policy.");
  }

  return row("Bot Access", "AI crawler policy", "Needs strategy", "robots.txt is present but no explicit AI crawler directives were detected.", "Ask whether the client wants to allow, limit, or block AI crawler access before launch.");
}

function row(area, signal, status, evidence, action) {
  return { area, signal, status, evidence, action };
}

function summarizeAgentReadiness(rows = []) {
  const counts = rows.reduce((totals, item) => {
    totals[item.status] = (totals[item.status] || 0) + 1;
    return totals;
  }, {});

  const useful = ["Found", "Clear", "Review", "Needs strategy", "Missing or blocked", "Missing or empty", "Not checked", "Unknown", "Not applicable"]
    .map((key) => counts[key] ? `${counts[key]} ${key.toLowerCase()}` : null)
    .filter(Boolean);

  return useful.length ? `Agent readiness generated ${useful.join(", ")} signal(s).` : "Agent readiness has no generated signals yet.";
}
