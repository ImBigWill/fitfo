const DEFAULT_LIMIT = 8;
const FETCH_TIMEOUT = 8_000;
const AI_CRAWLER_AGENTS = new Set([
  "anthropic-ai",
  "bytespider",
  "ccbot",
  "chatgpt-user",
  "claude-web",
  "claudebot",
  "cohere-ai",
  "gptbot",
  "google-extended",
  "oai-searchbot",
  "perplexitybot",
]);
const SERVICE_PATH_HINTS = [
  "service",
  "services",
  "repair",
  "installation",
  "emergency",
  "residential",
  "commercial",
  "location",
  "locations",
  "area",
  "contact",
  "about",
  "reviews",
  "gallery",
  "projects",
  "faq",
];

export async function getSiteProfile(domain, http, options = {}) {
  if (!options.deep) {
    return {
      enabled: false,
      provider: "local",
      pages: [],
      discoveredUrls: [],
      errors: [],
    };
  }

  const limit = options.limit || DEFAULT_LIMIT;
  const baseUrl = resolveBaseUrl(domain, http);
  const origin = new URL(baseUrl).origin;
  const errors = [];
  const [robots, sitemap] = await Promise.all([
    fetchText(new URL("/robots.txt", origin).toString()).catch((error) => {
      errors.push(`robots.txt: ${error.message}`);
      return null;
    }),
    discoverSitemap(origin).catch((error) => {
      errors.push(`sitemap: ${error.message}`);
      return { url: new URL("/sitemap.xml", origin).toString(), urls: [] };
    }),
  ]);

  const robotSitemapUrls = extractRobotsSitemaps(robots);
  if (robotSitemapUrls.length && sitemap.urls.length === 0) {
    for (const sitemapUrl of robotSitemapUrls) {
      try {
        const text = await fetchText(sitemapUrl);
        sitemap.urls.push(...extractSitemapUrls(text));
      } catch (error) {
        errors.push(`${sitemapUrl}: ${error.message}`);
      }
    }
  }

  const discoveredUrls = prioritizeUrls([
    baseUrl,
    ...sitemap.urls,
  ], origin).slice(0, limit);

  const pages = [];
  for (const url of discoveredUrls) {
    try {
      const html = await fetchHtml(url);
      pages.push(extractPageProfile(url, html, origin));
    } catch (error) {
      errors.push(`${url}: ${error.message}`);
    }
  }

  return {
    enabled: true,
    provider: "local",
    baseUrl,
    robots: {
      checked: robots !== null,
      sitemapUrls: robotSitemapUrls,
      aiCrawlerRules: extractAiCrawlerRules(robots),
    },
    sitemap,
    discoveredUrls,
    pages,
    summary: summarizePages(pages),
    recommendations: buildSiteRecommendations(pages),
    errors,
  };
}

function resolveBaseUrl(domain, http) {
  if (http?.finalUrl) return http.finalUrl;
  return `https://${domain.hostname || domain.apex}`;
}

async function discoverSitemap(origin) {
  const candidates = [
    new URL("/sitemap.xml", origin).toString(),
    new URL("/sitemap_index.xml", origin).toString(),
  ];

  for (const url of candidates) {
    try {
      const text = await fetchText(url);
      const urls = extractSitemapUrls(text);
      if (urls.length) return { url, urls };
    } catch {
      // Try the next common sitemap location.
    }
  }

  return { url: candidates[0], urls: [] };
}

async function fetchHtml(url) {
  const response = await fetchWithTimeout(url, {
    headers: {
      "user-agent": "FITFO/0.1 (+client onboarding site brief)",
      accept: "text/html,application/xhtml+xml",
    },
  });
  const contentType = response.headers.get("content-type") || "";
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  if (!contentType.includes("text/html") && !contentType.includes("application/xhtml")) {
    throw new Error(`not HTML (${contentType || "unknown content type"})`);
  }
  return response.text();
}

async function fetchText(url) {
  const response = await fetchWithTimeout(url, {
    headers: {
      "user-agent": "FITFO/0.1 (+client onboarding site brief)",
      accept: "text/plain,text/xml,application/xml,text/html",
    },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.text();
}

async function fetchWithTimeout(url, options) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
  try {
    return await fetch(url, {
      ...options,
      redirect: "follow",
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

function extractSitemapUrls(xml) {
  return [...String(xml || "").matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)]
    .map((match) => decodeXml(match[1].trim()))
    .filter((value) => /^https?:\/\//i.test(value));
}

function extractRobotsSitemaps(robots) {
  return [...String(robots || "").matchAll(/^sitemap:\s*(.+)$/gim)]
    .map((match) => match[1].trim())
    .filter(Boolean);
}

function extractAiCrawlerRules(robots) {
  const rules = [];
  let agents = [];
  let hasDirective = false;

  for (const rawLine of String(robots || "").split(/\r?\n/)) {
    const line = rawLine.replace(/#.*/, "").trim();
    if (!line) continue;

    const [rawKey, ...rawValue] = line.split(":");
    const key = String(rawKey || "").trim().toLowerCase();
    const value = rawValue.join(":").trim();

    if (key === "user-agent") {
      if (hasDirective) {
        agents = [];
        hasDirective = false;
      }
      agents.push(value.toLowerCase());
      continue;
    }

    if ((key === "allow" || key === "disallow") && agents.some((agent) => AI_CRAWLER_AGENTS.has(agent))) {
      hasDirective = true;
      for (const agent of agents) {
        if (!AI_CRAWLER_AGENTS.has(agent)) continue;
        rules.push({
          agent,
          directive: key,
          path: value || "/",
        });
      }
    } else if (key === "allow" || key === "disallow") {
      hasDirective = true;
    }
  }

  return rules;
}

function prioritizeUrls(urls, origin) {
  const sameOrigin = [...new Set(urls)]
    .map((url) => normalizeUrl(url))
    .filter(Boolean)
    .filter((url) => {
      try {
        const parsed = new URL(url);
        return parsed.origin === origin;
      } catch {
        return false;
      }
    });

  return sameOrigin.sort((a, b) => scoreUrl(b) - scoreUrl(a));
}

function scoreUrl(url) {
  const path = new URL(url).pathname.toLowerCase();
  if (path === "/" || path === "") return 100;
  let score = 0;
  for (const hint of SERVICE_PATH_HINTS) {
    if (path.includes(hint)) score += 10;
  }
  score -= path.split("/").filter(Boolean).length;
  return score;
}

function normalizeUrl(url) {
  try {
    const parsed = new URL(url);
    parsed.hash = "";
    parsed.search = "";
    return parsed.toString();
  } catch {
    return null;
  }
}

export function extractPageProfile(url, html, origin) {
  const text = stripTags(html);
  const links = extractLinks(html, origin);
  const headings = {
    h1: extractTagText(html, "h1"),
    h2: extractTagText(html, "h2").slice(0, 12),
  };

  return {
    url,
    path: new URL(url).pathname || "/",
    title: extractTitle(html),
    metaDescription: extractMeta(html, "description"),
    metaRobots: extractMeta(html, "robots"),
    canonicalUrl: extractCanonical(html, origin),
    language: extractHtmlLanguage(html),
    headings,
    wordCount: text.split(/\s+/).filter(Boolean).length,
    ctas: extractCtas(html),
    forms: extractForms(html, origin),
    phones: extractPhones(text),
    addresses: extractAddresses(text),
    emails: extractEmails(text),
    schemaTypes: extractSchemaTypes(html),
    toolSignals: extractToolSignals(html),
    scriptHosts: extractScriptHosts(html),
    internalLinks: links.internal.slice(0, 25),
    externalLinks: links.external.slice(0, 15),
  };
}

function extractTitle(html) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? decodeHtml(match[1].replace(/\s+/g, " ").trim()) : null;
}

function extractMeta(html, name) {
  const pattern = new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']+)["'][^>]*>`, "i");
  const match = html.match(pattern);
  return match ? decodeHtml(match[1].trim()) : null;
}

function extractCanonical(html, origin) {
  const match = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["'][^>]*>/i)
    || html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["'][^>]*>/i);
  if (!match) return null;

  try {
    return normalizeUrl(new URL(decodeHtml(match[1].trim()), origin).toString());
  } catch {
    return decodeHtml(match[1].trim());
  }
}

function extractHtmlLanguage(html) {
  const match = html.match(/<html[^>]+lang=["']([^"']+)["'][^>]*>/i);
  return match ? decodeHtml(match[1].trim()) : null;
}

function extractTagText(html, tag) {
  return [...html.matchAll(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "gi"))]
    .map((match) => stripTags(match[1]).replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

function extractLinks(html, origin) {
  const internal = [];
  const external = [];
  for (const match of html.matchAll(/<a\b[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    const href = match[1];
    const label = stripTags(match[2]).replace(/\s+/g, " ").trim();
    try {
      const url = new URL(href, origin);
      const entry = { url: normalizeUrl(url.toString()), label };
      if (!entry.url || url.protocol.startsWith("mailto") || url.protocol.startsWith("tel")) continue;
      if (url.origin === origin) internal.push(entry);
      else external.push(entry);
    } catch {
      // Ignore malformed links.
    }
  }
  return {
    internal: uniqueLinks(internal),
    external: uniqueLinks(external),
  };
}

function uniqueLinks(links) {
  const seen = new Set();
  return links.filter((link) => {
    if (seen.has(link.url)) return false;
    seen.add(link.url);
    return true;
  });
}

function extractCtas(html) {
  const labels = extractLinks(html, "https://example.com").internal.map((link) => link.label);
  return labels
    .filter((label) => /\b(call|contact|quote|schedule|book|get started|request|estimate|consultation|appointment)\b/i.test(label))
    .slice(0, 12);
}

function extractForms(html, origin) {
  const forms = [...html.matchAll(/<form\b([^>]*)>([\s\S]*?)<\/form>/gi)].map((match) => {
    const attrs = match[1] || "";
    const body = match[2] || "";
    return buildFormProfile(attrs, body, origin);
  });

  if (forms.length) return forms;

  return [...html.matchAll(/<form\b([^>]*)>/gi)].map((match) => buildFormProfile(match[1] || "", "", origin));
}

function buildFormProfile(attrs, body, origin) {
  const action = attrValue(attrs, "action");
  const normalizedAction = action ? normalizeFormAction(action, origin) : null;

  return {
    action: normalizedAction,
    method: (attrValue(attrs, "method") || "GET").toUpperCase(),
    id: attrValue(attrs, "id"),
    name: attrValue(attrs, "name"),
    classes: attrValue(attrs, "class"),
    fields: extractFormFields(body),
    submitLabels: extractSubmitLabels(body),
    raw: `<form${attrs}>`.replace(/\s+/g, " ").slice(0, 180),
  };
}

function normalizeFormAction(action, origin) {
  if (!action || action === "#") return action || null;
  try {
    return normalizeUrl(new URL(decodeHtml(action), origin).toString());
  } catch {
    return decodeHtml(action);
  }
}

function extractFormFields(body) {
  const fields = [];
  for (const match of body.matchAll(/<(input|select|textarea)\b([^>]*)>/gi)) {
    const tag = match[1].toLowerCase();
    const attrs = match[2] || "";
    const name = attrValue(attrs, "name") || attrValue(attrs, "id") || attrValue(attrs, "aria-label");
    const type = attrValue(attrs, "type") || tag;
    if (name) fields.push(`${name} (${type})`);
  }
  return [...new Set(fields)].slice(0, 12);
}

function extractSubmitLabels(body) {
  const labels = [
    ...[...body.matchAll(/<button\b[^>]*>([\s\S]*?)<\/button>/gi)].map((match) => stripTags(match[1]).replace(/\s+/g, " ").trim()),
    ...[...body.matchAll(/<input\b[^>]*type=["']submit["'][^>]*>/gi)].map((match) => attrValue(match[0], "value")),
  ];
  return [...new Set(labels.filter(Boolean))].slice(0, 8);
}

function attrValue(attrs, name) {
  const pattern = new RegExp(`\\b${name}=["']([^"']*)["']`, "i");
  const match = String(attrs || "").match(pattern);
  return match ? decodeHtml(match[1].trim()) : null;
}

function extractPhones(text) {
  return [...new Set((text.match(/\(?\b\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}\b/g) || []).map((value) => value.trim()))].slice(0, 10);
}

function extractAddresses(text) {
  const matches = String(text || "").replace(/\s+/g, " ").match(/\b\d{2,6}\s+[A-Z0-9][A-Z0-9 .'-]{2,80}\s+(?:St|Street|Ave|Avenue|Rd|Road|Dr|Drive|Blvd|Boulevard|Ln|Lane|Ct|Court|Way|Pkwy|Parkway|Pl|Place|Hwy|Highway)\b(?:[ ,]+[A-Z][A-Za-z .'-]{2,40})?[ ,]+[A-Z]{2}[ ,]+\d{5}(?:-\d{4})?|\b\d{2,6}\s+[A-Z0-9][A-Z0-9 .'-]{2,80}\s+(?:St|Street|Ave|Avenue|Rd|Road|Dr|Drive|Blvd|Boulevard|Ln|Lane|Ct|Court|Way|Pkwy|Parkway|Pl|Place|Hwy|Highway)\b(?:[ ,]+[A-Z][A-Za-z .'-]{2,40})?(?:[ ,]+[A-Z]{2})?/gi) || [];
  return [...new Set(matches.map((value) => value.replace(/[.,\s]+$/g, "").replace(/\s+/g, " ").trim()))].slice(0, 10);
}

function extractEmails(text) {
  return [...new Set((text.match(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi) || []).map((value) => value.trim()))].slice(0, 10);
}

function extractSchemaTypes(html) {
  const types = [];
  for (const match of html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const parsed = JSON.parse(decodeHtml(match[1].trim()));
      collectSchemaTypes(parsed, types);
    } catch {
      // Ignore malformed JSON-LD.
    }
  }
  return [...new Set(types)].sort();
}

function extractToolSignals(html) {
  const checks = [
    [/googletagmanager\.com\/gtm\.js|GTM-[A-Z0-9]+/i, "Google Tag Manager"],
    [/googletagmanager\.com\/gtag\/js|gtag\(|G-[A-Z0-9]+/i, "Google Analytics / GA4"],
    [/google-site-verification/i, "Google Search Console verification"],
    [/connect\.facebook\.net|fbq\(/i, "Meta Pixel"],
    [/cdn\.callrail\.com|callrail/i, "CallRail"],
    [/js\.hsforms\.net|hubspot/i, "HubSpot"],
    [/gravityforms|gform_/i, "Gravity Forms"],
    [/wpforms/i, "WPForms"],
    [/service-titan|servicetitan/i, "ServiceTitan"],
    [/housecallpro|housecall-pro/i, "Housecall Pro"],
    [/jobber/i, "Jobber"],
    [/calendly/i, "Calendly"],
    [/podium/i, "Podium"],
    [/birdeye/i, "Birdeye"],
    [/nicejob/i, "NiceJob"],
  ];

  return checks.filter(([, label]) => label).flatMap(([pattern, label]) => pattern.test(html) ? [label] : []);
}

function extractScriptHosts(html) {
  return [...new Set([...html.matchAll(/<script\b[^>]+src=["']([^"']+)["'][^>]*>/gi)]
    .map((match) => {
      try {
        return new URL(decodeHtml(match[1]), "https://example.com").hostname.replace(/^www\./, "");
      } catch {
        return null;
      }
    })
    .filter(Boolean)
    .filter((host) => host !== "example.com"))]
    .slice(0, 20);
}

function collectSchemaTypes(value, types) {
  if (Array.isArray(value)) {
    value.forEach((item) => collectSchemaTypes(item, types));
    return;
  }
  if (!value || typeof value !== "object") return;
  if (value["@type"]) types.push(...(Array.isArray(value["@type"]) ? value["@type"] : [value["@type"]]));
  if (value["@graph"]) collectSchemaTypes(value["@graph"], types);
}

export function summarizePages(pages) {
  return {
    pagesScanned: pages.length,
    pagesWithMetaDescription: pages.filter((page) => page.metaDescription).length,
    pagesWithCanonical: pages.filter((page) => page.canonicalUrl).length,
    pagesNoindex: pages.filter((page) => /\bnoindex\b/i.test(page.metaRobots || "")).map((page) => page.path),
    pagesMissingH1: pages.filter((page) => page.headings.h1.length === 0).length,
    pagesWithMultipleH1: pages.filter((page) => page.headings.h1.length > 1).length,
    formsDetected: pages.reduce((sum, page) => sum + page.forms.length, 0),
    phonesDetected: [...new Set(pages.flatMap((page) => page.phones))],
    addressesDetected: [...new Set(pages.flatMap((page) => page.addresses || []))],
    emailsDetected: [...new Set(pages.flatMap((page) => page.emails))],
    schemaTypes: [...new Set(pages.flatMap((page) => page.schemaTypes))].sort(),
    toolSignals: [...new Set(pages.flatMap((page) => page.toolSignals))].sort(),
    scriptHosts: [...new Set(pages.flatMap((page) => page.scriptHosts))].sort().slice(0, 30),
    ctas: [...new Set(pages.flatMap((page) => page.ctas))].slice(0, 20),
  };
}

export function buildSiteRecommendations(pages) {
  const recommendations = [];
  const summary = summarizePages(pages);

  if (summary.pagesScanned === 0) {
    recommendations.push("No pages were crawled. Confirm whether the site blocks basic crawlers or requires JavaScript rendering.");
    return recommendations;
  }

  if (summary.pagesWithMetaDescription < summary.pagesScanned) {
    recommendations.push("Write unique meta descriptions for important pages before launch.");
  }
  if (summary.pagesWithCanonical < summary.pagesScanned) {
    recommendations.push("Confirm canonical tags on priority pages before migration and redirect mapping.");
  }
  if (summary.pagesNoindex.length > 0) {
    recommendations.push(`Review noindex directives before launch: ${summary.pagesNoindex.join(", ")}.`);
  }
  if (summary.pagesMissingH1 > 0 || summary.pagesWithMultipleH1 > 0) {
    recommendations.push("Clean up H1 structure so each key page has one clear primary heading.");
  }
  if (summary.formsDetected === 0) {
    recommendations.push("Confirm the primary lead path. No forms were detected in the crawled pages.");
  }
  if (summary.phonesDetected.length === 0) {
    recommendations.push("Confirm whether phone calls matter. No phone number was detected in crawled page text.");
  }
  if (summary.schemaTypes.length === 0) {
    recommendations.push("Add schema markup for organization, local business, services, FAQs, and reviews where appropriate.");
  }

  return recommendations;
}

function stripTags(value) {
  return decodeHtml(String(value || "").replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " "));
}

function decodeHtml(value) {
  return String(value || "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#039;/g, "'");
}

function decodeXml(value) {
  return decodeHtml(value);
}
