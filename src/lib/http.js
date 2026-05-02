import tls from "node:tls";

export async function getHttpProfile(hostname, apex = hostname) {
  const targets = [`https://${hostname}`, `http://${hostname}`];
  const attempts = [];
  const redirectChecks = [];
  const ssl = await getTlsProfile(hostname);
  const urlStructure = await getUrlStructure(hostname, apex);
  let primary = null;

  for (const target of targets) {
    try {
      const result = await fetchSite(target);
      redirectChecks.push(result.redirect);
      if (!primary || target.startsWith("https://")) {
        primary = { target, result };
      }
    } catch (error) {
      attempts.push({ url: target, error: error.message });
      redirectChecks.push({
        startUrl: target,
        reachable: false,
        finalUrl: null,
        status: null,
        hops: [],
        error: error.message,
      });
    }
  }

  if (primary) {
    return {
      checkedUrl: primary.target,
      reachable: true,
      ...primary.result,
      wordpress: detectWordPress(primary.result),
      attempts,
      redirects: redirectChecks,
      urlStructure,
      ssl,
    };
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
    redirects: redirectChecks,
    urlStructure,
    ssl,
  };
}

async function getUrlStructure(hostname, apex) {
  const hosts = [...new Set([hostname, apex, apex.startsWith("www.") ? apex : `www.${apex}`])].filter(Boolean);
  const checks = await Promise.all(hosts.map((host) => getHostUrlChecks(host)));
  return buildUrlStructureProfile(apex, checks);
}

export function buildUrlStructureProfile(apex, checks = []) {
  const reachableChecks = checks.flatMap((check) => check.variants).filter((variant) => variant.reachable && variant.finalUrl);
  const finalHosts = reachableChecks.map((variant) => safeHost(variant.finalUrl)).filter(Boolean);
  const finalProtocols = reachableChecks.map((variant) => safeProtocol(variant.finalUrl)).filter(Boolean);
  const preferredHost = mostCommon(finalHosts);
  const preferredProtocol = mostCommon(finalProtocols);
  const matrix = buildRedirectMatrix(checks, preferredHost, preferredProtocol);
  const issues = buildUrlStructureIssues({ apex, checks, reachableChecks, matrix, preferredHost, preferredProtocol });

  return {
    checkedHosts: checks,
    matrix,
    issues,
    preferredHost: preferredHost || null,
    preferredProtocol: preferredProtocol || null,
    www: preferredHost ? preferredHost.startsWith("www.") : null,
    recommendation: buildUrlRecommendation(apex, preferredHost, preferredProtocol, reachableChecks, issues),
  };
}

async function getHostUrlChecks(host) {
  const variants = [];

  for (const protocol of ["https", "http"]) {
    const startUrl = `${protocol}://${host}`;
    try {
      variants.push(await fetchRedirectCheck(startUrl));
    } catch (error) {
      variants.push({
        startUrl,
        reachable: false,
        finalUrl: null,
        status: null,
        hops: [],
        error: error.message,
      });
    }
  }

  return { host, variants };
}

async function fetchRedirectCheck(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const result = await followRedirects(url, controller.signal);
    const response = result.response;
    response.body?.cancel?.();

    return {
      startUrl: url,
      reachable: true,
      finalUrl: response.url,
      status: response.status,
      hops: result.hops,
    };
  } finally {
    clearTimeout(timeout);
  }
}

function buildRedirectMatrix(checks, preferredHost, preferredProtocol) {
  return checks.flatMap((hostCheck) => (hostCheck.variants || []).map((variant) => {
    const finalHost = safeHost(variant.finalUrl);
    const finalProtocol = safeProtocol(variant.finalUrl);

    return {
      startUrl: variant.startUrl,
      startHost: safeHost(variant.startUrl) || hostCheck.host,
      startProtocol: safeProtocol(variant.startUrl),
      reachable: Boolean(variant.reachable),
      finalUrl: variant.finalUrl || null,
      finalHost,
      finalProtocol,
      status: variant.status || null,
      hops: variant.hops || [],
      redirects: (variant.hops || []).length,
      error: variant.error || null,
      canonical: Boolean(
        variant.reachable
        && finalHost
        && finalProtocol
        && preferredHost
        && preferredProtocol
        && finalHost === preferredHost
        && finalProtocol === preferredProtocol
      ),
    };
  }));
}

function buildUrlStructureIssues({ checks, matrix, preferredHost, preferredProtocol }) {
  const issues = [];
  const reachableRows = matrix.filter((row) => row.reachable && row.finalUrl);
  const reachableFinalHosts = new Set(reachableRows.map((row) => row.finalHost).filter(Boolean));
  const reachableFinalProtocols = new Set(reachableRows.map((row) => row.finalProtocol).filter(Boolean));
  const deadRows = matrix.filter((row) => !row.reachable);
  const httpRows = matrix.filter((row) => row.startProtocol === "http:");
  const httpStillHttpRows = httpRows.filter((row) => row.reachable && row.finalProtocol === "http:");
  const nonCanonicalRows = reachableRows.filter((row) => preferredHost && preferredProtocol && !row.canonical);
  const hostCount = checks.length;

  if (!reachableRows.length) {
    issues.push({
      code: "no_reachable_variants",
      severity: "High",
      summary: "No apex/www HTTP or HTTPS variant reached a final URL.",
      detail: "Confirm the live host, DNS records, SSL state, and whether the domain is parked or down.",
    });
  }

  if (deadRows.length) {
    issues.push({
      code: "dead_variants",
      severity: deadRows.length >= Math.max(1, hostCount) ? "Medium" : "Low",
      summary: `${deadRows.length} apex/www URL variant(s) failed during redirect checks.`,
      detail: "Confirm whether failed variants should redirect to the primary launch URL or remain intentionally unavailable.",
    });
  }

  if (reachableFinalHosts.size > 1) {
    issues.push({
      code: "split_hosts",
      severity: "Medium",
      summary: "Apex/www variants resolve to more than one final host.",
      detail: "Choose one canonical launch host and redirect the other variants to it before launch, Search Console, sitemap, and analytics setup.",
    });
  }

  if (reachableFinalProtocols.has("http:")) {
    issues.push({
      code: "insecure_final_url",
      severity: "High",
      summary: "At least one reachable variant finishes on HTTP instead of HTTPS.",
      detail: "Force HTTPS before launch and confirm SSL coverage for the chosen canonical host.",
    });
  }

  if (httpStillHttpRows.length) {
    issues.push({
      code: "http_not_forced",
      severity: "High",
      summary: `${httpStillHttpRows.length} HTTP variant(s) did not upgrade to HTTPS.`,
      detail: "Confirm HTTP-to-HTTPS redirects before launch, analytics, Search Console, and client handoff.",
    });
  }

  if (nonCanonicalRows.length) {
    issues.push({
      code: "noncanonical_variants",
      severity: "Medium",
      summary: `${nonCanonicalRows.length} reachable variant(s) do not finish on the likely canonical URL.`,
      detail: "Map redirect rules so apex, www, HTTP, and HTTPS variants converge on one final launch URL.",
    });
  }

  return issues;
}

function buildUrlRecommendation(apex, preferredHost, preferredProtocol, checks, issues = []) {
  if (!preferredHost) {
    return "No reachable canonical URL was detected. Confirm launch host manually.";
  }

  const hostLabel = preferredHost === apex
    ? "apex/non-www"
    : preferredHost === `www.${apex}`
      ? "www"
      : preferredHost;
  const protocolLabel = preferredProtocol === "https:" ? "HTTPS" : "HTTP";
  const splitHosts = new Set(checks.map((check) => safeHost(check.finalUrl)).filter(Boolean)).size > 1;

  if (splitHosts) {
    return `Launch planning should preserve ${hostLabel} as the likely primary URL, but redirect behavior is split. Confirm canonical redirects before launch.`;
  }

  if (issues.some((issue) => ["insecure_final_url", "http_not_forced"].includes(issue.code))) {
    return `Likely primary launch host is ${hostLabel}, but HTTPS behavior needs cleanup. Force HTTPS before launch and preserve ${hostLabel} as the canonical host unless the client intentionally changes it.`;
  }

  if (issues.some((issue) => issue.code === "dead_variants" || issue.code === "noncanonical_variants")) {
    return `Likely primary launch URL is ${protocolLabel} on ${hostLabel}, but apex/www variants need redirect QA before launch.`;
  }

  return `Likely primary launch URL is ${protocolLabel} on ${hostLabel}. Preserve this choice unless the client intentionally wants to change canonical host.`;
}

async function fetchSite(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const result = await followRedirects(url, controller.signal);
    const response = result.response;

    const contentType = response.headers.get("content-type") || "";
    const html = contentType.includes("text/html") ? await response.text() : "";

    return {
      finalUrl: response.url,
      status: response.status,
      headers: pickHeaders(response.headers),
      title: extractTitle(html),
      metaGenerator: extractMetaGenerator(html),
      htmlSample: html.slice(0, 20_000),
      redirect: {
        startUrl: url,
        reachable: true,
        finalUrl: response.url,
        status: response.status,
        hops: result.hops,
      },
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function followRedirects(startUrl, signal, maxRedirects = 8) {
  let currentUrl = startUrl;
  const hops = [];

  for (let index = 0; index <= maxRedirects; index += 1) {
    const response = await fetch(currentUrl, {
      redirect: "manual",
      signal,
      headers: {
        "user-agent": "FITFO/0.1 (+domain onboarding scanner)",
      },
    });

    const location = response.headers.get("location");
    const isRedirect = response.status >= 300 && response.status < 400 && location;

    if (!isRedirect) {
      return { response, hops };
    }

    const nextUrl = new URL(location, currentUrl).toString();
    hops.push({
      url: currentUrl,
      status: response.status,
      location: nextUrl,
    });
    currentUrl = nextUrl;
  }

  throw new Error(`Too many redirects from ${startUrl}`);
}

async function getTlsProfile(hostname) {
  return new Promise((resolve) => {
    const socket = tls.connect({
      host: hostname,
      port: 443,
      servername: hostname,
      rejectUnauthorized: false,
      timeout: 8_000,
    });

    let settled = false;
    const finish = (profile) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve(profile);
    };

    socket.on("secureConnect", () => {
      const certificate = socket.getPeerCertificate();
      if (!certificate || Object.keys(certificate).length === 0) {
        finish({
          available: false,
          valid: socket.authorized,
          error: "No peer certificate returned.",
        });
        return;
      }

      const validTo = new Date(certificate.valid_to);
      const daysRemaining = Number.isNaN(validTo.getTime())
        ? null
        : Math.ceil((validTo.getTime() - Date.now()) / 86_400_000);

      finish({
        available: true,
        valid: socket.authorized,
        authorizationError: socket.authorizationError || null,
        subject: certificate.subject || {},
        issuer: certificate.issuer || {},
        validFrom: certificate.valid_from || null,
        validTo: certificate.valid_to || null,
        daysRemaining,
        subjectAltName: certificate.subjectaltname || null,
      });
    });

    socket.on("timeout", () => {
      finish({
        available: false,
        valid: false,
        error: "TLS connection timed out.",
      });
    });

    socket.on("error", (error) => {
      finish({
        available: false,
        valid: false,
        error: error.message,
      });
    });
  });
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
    "x-shopid",
    "x-shopify-stage",
    "x-seen-by",
    "x-wix-request-id",
    "x-webflow-page-id",
  ];

  const picked = {};
  for (const header of wanted) {
    const value = headers.get(header);
    if (value) picked[header] = value;
  }
  return picked;
}

function safeHost(url) {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
}

function safeProtocol(url) {
  try {
    return new URL(url).protocol.toLowerCase();
  } catch {
    return null;
  }
}

function mostCommon(values) {
  const counts = new Map();
  for (const value of values) {
    counts.set(value, (counts.get(value) || 0) + 1);
  }

  return [...counts.entries()].sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))[0]?.[0] || null;
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
