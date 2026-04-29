import { execFile } from "node:child_process";
import { promisify } from "node:util";

const FIRECRAWL_SEARCH_URL = "https://api.firecrawl.dev/v2/search";
const execFileAsync = promisify(execFile);

export async function getResearchProfile(domain, http, site, options = {}) {
  if (!options.search) {
    return {
      enabled: false,
      provider: null,
      queries: [],
      results: [],
      errors: [],
    };
  }

  const queries = buildResearchQueries(domain, http, site, options);
  const provider = options.provider || "firecrawl";
  const apiKey = Object.hasOwn(options, "firecrawlApiKey") ? options.firecrawlApiKey : process.env.FIRECRAWL_API_KEY;
  const limit = options.searchLimit || 5;
  const country = options.country || "US";
  const location = options.location || null;

  if (provider !== "firecrawl") {
    return {
      enabled: true,
      provider,
      method: null,
      available: false,
      queries,
      results: [],
      errors: [`Unsupported research provider: ${provider}`],
      location,
      country,
    };
  }

  if (!apiKey && options.cliFallback === false) {
    return {
      enabled: true,
      provider: "firecrawl",
      method: null,
      available: false,
      queries,
      results: [],
      errors: ["FIRECRAWL_API_KEY is not set. Add it or run `firecrawl login` to enable live web research."],
      location,
      country,
    };
  }

  const results = [];
  const errors = [];
  const method = apiKey ? "api" : "cli";
  const search = apiKey ? firecrawlApiSearch : options.firecrawlCliSearch || firecrawlCliSearch;

  for (const query of queries) {
    try {
      results.push(...await search(query, {
        apiKey,
        limit,
        country,
        location,
      }));
    } catch (error) {
      errors.push(`${query}: ${error.message}`);
    }
  }

  return {
    enabled: true,
    provider: "firecrawl",
    method,
    available: results.length > 0 || errors.length < queries.length,
    queries,
    results: uniqueResults(results),
    errors,
    location,
    country,
  };
}

export function buildResearchQueries(domain, http, site, options = {}) {
  const brand = cleanTitle(http?.title) || domain.apex;
  const serviceHints = extractServiceHints(site).slice(0, 3);
  const location = options.location;
  const category = inferServiceCategory(http, site);
  const base = location ? `${brand} ${location}` : brand;
  const queries = [
    `"${brand}"`,
    `${base} reviews`,
    `${base} services`,
  ];

  if (category && location) {
    queries.push(`${category} ${location}`);
  }

  for (const service of serviceHints) {
    queries.push(`${service} ${location || domain.apex}`);
  }

  if (category && location) {
    queries.push(`best ${category} ${location}`);
    queries.push(`${category} reviews ${location}`);
  }

  if (serviceHints.length > 0 && location) {
    queries.push(`best ${serviceHints[0]} ${location}`);
  }

  return [...new Set(queries)].slice(0, options.queryLimit || 6);
}

async function firecrawlApiSearch(query, options) {
  const response = await fetch(FIRECRAWL_SEARCH_URL, {
    method: "POST",
    headers: {
      authorization: `Bearer ${options.apiKey}`,
      "content-type": "application/json",
      "user-agent": "FITFO/0.1 (+client onboarding research)",
    },
    body: JSON.stringify({
      query,
      limit: options.limit,
      sources: ["web"],
      country: options.country,
      location: options.location || undefined,
      ignoreInvalidURLs: true,
    }),
  });

  if (!response.ok) {
    throw new Error(`Firecrawl HTTP ${response.status}`);
  }

  return normalizeFirecrawlResults(await response.json(), query);
}

async function firecrawlCliSearch(query, options) {
  const args = [
    "search",
    query,
    "--limit",
    String(options.limit),
    "--sources",
    "web",
    "--country",
    options.country,
    "--ignore-invalid-urls",
    "--json",
  ];

  if (options.location) {
    args.push("--location", options.location);
  }

  try {
    const { stdout } = await execFileAsync("firecrawl", args, {
      timeout: options.timeout || 60000,
      maxBuffer: 1024 * 1024 * 4,
    });

    return normalizeFirecrawlResults(JSON.parse(stdout), query);
  } catch (error) {
    if (error.code === "ENOENT") {
      throw new Error("Firecrawl CLI is not installed. Install it or set FIRECRAWL_API_KEY.");
    }

    if (error instanceof SyntaxError) {
      throw new Error("Firecrawl CLI returned invalid JSON.");
    }

    const detail = String(error.stderr || error.message || "").trim();
    throw new Error(detail || "Firecrawl CLI search failed. Run `firecrawl login` or set FIRECRAWL_API_KEY.");
  }
}

export function normalizeFirecrawlResults(body, query) {
  if (body?.success === false) {
    throw new Error(body.error || "Firecrawl search failed.");
  }

  const web = body?.data?.web || body?.web || [];
  return web.map((result) => ({
    query,
    title: result.title || result.metadata?.title || "Untitled",
    description: result.description || result.metadata?.description || "",
    url: result.url || result.metadata?.url || result.metadata?.sourceURL || "",
  })).filter((result) => result.url);
}

function cleanTitle(title) {
  return String(title || "")
    .split(/\s[|-]\s/)
    .map((part) => part.trim())
    .find(Boolean);
}

function extractServiceHints(site) {
  const pages = site?.pages || [];
  const candidates = [];
  for (const page of pages) {
    candidates.push(...(page.headings?.h1 || []));
    candidates.push(...(page.headings?.h2 || []));
    const pathParts = String(page.path || "").split("/").filter(Boolean);
    candidates.push(...pathParts.map((part) => part.replace(/-/g, " ")));
  }

  return candidates
    .map((value) => value.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim())
    .filter((value) => value.length > 3 && value.length < 50)
    .filter((value) => /\b(service|repair|install|clean|plumb(?:er|ing)?|roof|hvac|electric|legal|design|marketing|emergency)\b/.test(value));
}

function uniqueResults(results) {
  const seen = new Set();
  return results.filter((result) => {
    if (seen.has(result.url)) return false;
    seen.add(result.url);
    return true;
  });
}

function inferServiceCategory(http, site) {
  const haystack = [
    http?.title || "",
    ...(site?.pages || []).flatMap((page) => [
      page.title || "",
      page.metaDescription || "",
      ...(page.headings?.h1 || []),
      ...(page.headings?.h2 || []),
      page.path || "",
    ]),
  ].join(" ").toLowerCase();

  const checks = [
    ["plumber", /\bplumb(?:er|ing)?\b/],
    ["hvac contractor", /\bhvac|heating|cooling|air conditioning\b/],
    ["electrician", /\belectric(?:ian|al)?\b/],
    ["roofer", /\broof(?:er|ing)?\b/],
    ["drain cleaning", /\bdrain|sewer\b/],
    ["marketing agency", /\bmarketing|seo|web design\b/],
  ];

  return checks.find(([, pattern]) => pattern.test(haystack))?.[0] || null;
}
