const DEFAULT_LIMIT = 8;
const FETCH_TIMEOUT = 8_000;
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
      checked: Boolean(robots),
      sitemapUrls: robotSitemapUrls,
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
    headings,
    wordCount: text.split(/\s+/).filter(Boolean).length,
    ctas: extractCtas(html),
    forms: extractForms(html),
    phones: extractPhones(text),
    emails: extractEmails(text),
    schemaTypes: extractSchemaTypes(html),
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

function extractForms(html) {
  return [...html.matchAll(/<form\b[^>]*>/gi)].map((match) => ({
    raw: match[0].slice(0, 180),
  }));
}

function extractPhones(text) {
  return [...new Set((text.match(/\(?\b\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}\b/g) || []).map((value) => value.trim()))].slice(0, 10);
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
    pagesMissingH1: pages.filter((page) => page.headings.h1.length === 0).length,
    pagesWithMultipleH1: pages.filter((page) => page.headings.h1.length > 1).length,
    formsDetected: pages.reduce((sum, page) => sum + page.forms.length, 0),
    phonesDetected: [...new Set(pages.flatMap((page) => page.phones))],
    schemaTypes: [...new Set(pages.flatMap((page) => page.schemaTypes))].sort(),
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
