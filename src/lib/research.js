const FIRECRAWL_SEARCH_URL = "https://api.firecrawl.dev/v2/search";

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

  if (provider !== "firecrawl") {
    return {
      enabled: true,
      provider,
      available: false,
      queries,
      results: [],
      errors: [`Unsupported research provider: ${provider}`],
    };
  }

  if (!apiKey) {
    return {
      enabled: true,
      provider: "firecrawl",
      available: false,
      queries,
      results: [],
      errors: ["FIRECRAWL_API_KEY is not set. Add it to enable live web research."],
    };
  }

  const results = [];
  const errors = [];
  for (const query of queries) {
    try {
      results.push(...await firecrawlSearch(query, {
        apiKey,
        limit: options.searchLimit || 5,
        country: options.country || "US",
        location: options.location || null,
      }));
    } catch (error) {
      errors.push(`${query}: ${error.message}`);
    }
  }

  return {
    enabled: true,
    provider: "firecrawl",
    available: true,
    queries,
    results: uniqueResults(results),
    errors,
  };
}

export function buildResearchQueries(domain, http, site, options = {}) {
  const brand = cleanTitle(http?.title) || domain.apex;
  const serviceHints = extractServiceHints(site).slice(0, 3);
  const location = options.location;
  const base = location ? `${brand} ${location}` : brand;
  const queries = [
    `"${brand}"`,
    `${base} reviews`,
    `${base} services`,
  ];

  for (const service of serviceHints) {
    queries.push(`${service} ${location || domain.apex}`);
  }

  return [...new Set(queries)].slice(0, options.queryLimit || 6);
}

async function firecrawlSearch(query, options) {
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

  const body = await response.json();
  const web = body?.data?.web || [];
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
    .filter((value) => /\b(service|repair|install|clean|plumb|roof|hvac|electric|legal|design|marketing|emergency)\b/.test(value));
}

function uniqueResults(results) {
  const seen = new Set();
  return results.filter((result) => {
    if (seen.has(result.url)) return false;
    seen.add(result.url);
    return true;
  });
}
