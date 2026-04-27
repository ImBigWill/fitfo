export async function getHttpProfile(hostname) {
  const targets = [`https://${hostname}`, `http://${hostname}`];
  const attempts = [];

  for (const target of targets) {
    try {
      const result = await fetchSite(target);
      return {
        checkedUrl: target,
        reachable: true,
        ...result,
        wordpress: detectWordPress(result),
        attempts,
      };
    } catch (error) {
      attempts.push({ url: target, error: error.message });
    }
  }

  return {
    checkedUrl: null,
    reachable: false,
    finalUrl: null,
    status: null,
    headers: {},
    title: null,
    metaGenerator: null,
    wordpress: {
      likely: false,
      signals: [],
    },
    attempts,
  };
}

async function fetchSite(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const response = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "user-agent": "FITFO/0.1 (+domain onboarding scanner)",
      },
    });

    const contentType = response.headers.get("content-type") || "";
    const html = contentType.includes("text/html") ? await response.text() : "";

    return {
      finalUrl: response.url,
      status: response.status,
      headers: pickHeaders(response.headers),
      title: extractTitle(html),
      metaGenerator: extractMetaGenerator(html),
      htmlSample: html.slice(0, 20_000),
    };
  } finally {
    clearTimeout(timeout);
  }
}

function detectWordPress(result) {
  const signals = [];
  const html = result.htmlSample || "";
  const headers = result.headers || {};

  if (/\/wp-content\//i.test(html)) signals.push("HTML references /wp-content/");
  if (/\/wp-includes\//i.test(html)) signals.push("HTML references /wp-includes/");
  if (/wp-json/i.test(html)) signals.push("HTML references wp-json");
  if (/wordpress/i.test(result.metaGenerator || "")) signals.push(`Generator: ${result.metaGenerator}`);
  if (/wordpress/i.test(headers["x-powered-by"] || "")) signals.push(`X-Powered-By: ${headers["x-powered-by"]}`);

  return {
    likely: signals.length > 0,
    signals,
  };
}

function pickHeaders(headers) {
  const wanted = [
    "server",
    "x-powered-by",
    "x-cache",
    "cf-cache-status",
    "cf-ray",
    "x-served-by",
    "x-hosted-by",
    "x-pantheon-styx-hostname",
    "x-acquia-application-uuid",
  ];

  const picked = {};
  for (const header of wanted) {
    const value = headers.get(header);
    if (value) picked[header] = value;
  }
  return picked;
}

function extractTitle(html) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? decodeHtml(match[1].replace(/\s+/g, " ").trim()) : null;
}

function extractMetaGenerator(html) {
  const match = html.match(/<meta[^>]+name=["']generator["'][^>]+content=["']([^"']+)["'][^>]*>/i);
  return match ? decodeHtml(match[1].trim()) : null;
}

function decodeHtml(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#039;/g, "'");
}
