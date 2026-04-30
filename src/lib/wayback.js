import { extractPageProfile } from "./site.js";

const CDX_ENDPOINT = "https://web.archive.org/cdx/search/cdx";
const SNAPSHOT_ENDPOINT = "https://web.archive.org/web";
const FETCH_TIMEOUT = 10_000;
const DEFAULT_INDEX_LIMIT = 20;
const DEFAULT_VERSION_LIMIT = 3;

export async function getWaybackProfile(domain, http, options = {}) {
  if (!options.enabled) {
    return {
      enabled: false,
      provider: "internet-archive",
      snapshots: [],
      versions: [],
      errors: [],
    };
  }

  const fetchImpl = options.fetchImpl || globalThis.fetch;
  const indexLimit = options.limit || DEFAULT_INDEX_LIMIT;
  const versionLimit = options.versions || DEFAULT_VERSION_LIMIT;
  const errors = [];
  const candidates = buildWaybackCandidates(domain, http);
  const captures = [];

  for (const candidate of candidates) {
    try {
      const rows = await fetchCdxRows(candidate, indexLimit, fetchImpl);
      captures.push(...rows);
    } catch (error) {
      errors.push(`${candidate}: ${error.message}`);
    }
  }

  const snapshots = dedupeCaptures(captures).slice(0, indexLimit);
  const versions = [];

  for (const snapshot of snapshots.slice(0, versionLimit)) {
    const version = {
      ...snapshot,
      capturedAt: formatWaybackTimestamp(snapshot.timestamp),
      archiveUrl: `${SNAPSHOT_ENDPOINT}/${snapshot.timestamp}/${snapshot.original}`,
      rawArchiveUrl: `${SNAPSHOT_ENDPOINT}/${snapshot.timestamp}id_/${snapshot.original}`,
    };

    try {
      const html = await fetchSnapshotHtml(version.rawArchiveUrl, fetchImpl);
      const page = extractPageProfile(snapshot.original, html, snapshotOrigin(snapshot.original));
      versions.push(summarizeSnapshotVersion(version, page));
    } catch (error) {
      versions.push({
        ...version,
        fetchError: error.message,
      });
      errors.push(`${version.rawArchiveUrl}: ${error.message}`);
    }
  }

  return {
    enabled: true,
    provider: "internet-archive",
    checkedUrls: candidates,
    snapshotsFound: snapshots.length,
    snapshots,
    versions,
    comparison: compareVersions(versions),
    warnings: buildWaybackWarnings(versions),
    errors,
  };
}

export function buildWaybackCandidates(domain = {}, http = {}) {
  const hosts = new Set([
    cleanHost(domain.apex),
    cleanHost(domain.hostname),
  ]);

  if (domain.apex) {
    hosts.add(`www.${cleanHost(domain.apex)}`);
  }

  if (http.finalUrl) {
    try {
      hosts.add(new URL(http.finalUrl).hostname);
    } catch {
      // Ignore malformed final URLs from failed HTTP probes.
    }
  }

  return [...hosts]
    .filter(Boolean)
    .flatMap((host) => [`https://${host}/`, `http://${host}/`]);
}

export function compareVersions(versions = []) {
  const [latest, previous] = versions;
  if (!latest || !previous) {
    return {
      available: false,
      changes: [],
    };
  }

  const changes = [
    compareText("Title", latest.title, previous.title),
    compareText("H1", latest.h1, previous.h1),
    compareText("Meta description", latest.metaDescription, previous.metaDescription),
    compareNumber("Word count", latest.wordCount, previous.wordCount),
    compareNumber("Forms", latest.formCount, previous.formCount),
    compareList("Phone numbers", latest.phones, previous.phones),
    compareList("CTA labels", latest.ctas, previous.ctas),
    compareList("Tool signals", latest.toolSignals, previous.toolSignals),
    compareText("Meta robots", latest.metaRobots, previous.metaRobots),
  ].filter(Boolean);

  return {
    available: true,
    latest: latest.capturedAt,
    previous: previous.capturedAt,
    changes,
  };
}

export function formatWaybackTimestamp(timestamp) {
  const value = String(timestamp || "");
  if (!/^\d{14}$/.test(value)) return value || "Unknown";
  return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)} ${value.slice(8, 10)}:${value.slice(10, 12)} UTC`;
}

async function fetchCdxRows(url, limit, fetchImpl) {
  const params = new URLSearchParams({
    url,
    output: "json",
    fl: "timestamp,original,statuscode,mimetype,digest,length",
    collapse: "digest",
    limit: String(-Math.abs(limit)),
    fastLatest: "true",
  });
  params.append("filter", "statuscode:200");
  params.append("filter", "mimetype:text/html");

  const response = await fetchWithTimeout(`${CDX_ENDPOINT}?${params.toString()}`, {
    headers: {
      "user-agent": "FITFO/0.1 (+client onboarding wayback checks)",
      accept: "application/json",
    },
  }, fetchImpl);

  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const json = await response.json();
  if (!Array.isArray(json) || json.length < 2) return [];

  const headers = json[0];
  return json.slice(1)
    .map((row) => Object.fromEntries(headers.map((key, index) => [key, row[index]])))
    .filter((row) => row.timestamp && row.original)
    .map((row) => ({
      timestamp: row.timestamp,
      original: row.original,
      statuscode: row.statuscode || "",
      mimetype: row.mimetype || "",
      digest: row.digest || "",
      length: row.length || "",
    }));
}

async function fetchSnapshotHtml(url, fetchImpl) {
  const response = await fetchWithTimeout(url, {
    headers: {
      "user-agent": "FITFO/0.1 (+client onboarding wayback checks)",
      accept: "text/html,application/xhtml+xml",
    },
  }, fetchImpl);
  const contentType = response.headers.get("content-type") || "";
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  if (!contentType.includes("text/html") && !contentType.includes("application/xhtml")) {
    throw new Error(`not HTML (${contentType || "unknown content type"})`);
  }
  return response.text();
}

async function fetchWithTimeout(url, options, fetchImpl) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
  try {
    return await fetchImpl(url, {
      ...options,
      redirect: "follow",
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

function dedupeCaptures(captures) {
  const seen = new Set();
  return captures
    .sort((a, b) => String(b.timestamp).localeCompare(String(a.timestamp)))
    .filter((capture) => {
      const key = `${capture.digest || "no-digest"}:${capture.original}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function summarizeSnapshotVersion(snapshot, page) {
  return {
    ...snapshot,
    title: page.title || "",
    h1: page.headings?.h1?.[0] || "",
    metaDescription: page.metaDescription || "",
    metaRobots: page.metaRobots || "",
    canonicalUrl: page.canonicalUrl || "",
    wordCount: page.wordCount || 0,
    formCount: page.forms?.length || 0,
    phones: page.phones || [],
    ctas: page.ctas || [],
    schemaTypes: page.schemaTypes || [],
    toolSignals: page.toolSignals || [],
  };
}

function buildWaybackWarnings(versions = []) {
  const warnings = [];
  const latest = versions[0];
  const previous = versions[1];
  if (!latest) return warnings;

  if (/noindex/i.test(latest.metaRobots || "")) {
    warnings.push("Latest archived homepage includes noindex in meta robots. Confirm current indexability before launch planning.");
  }

  if (previous && previous.formCount > 0 && latest.formCount === 0) {
    warnings.push("Earlier archived homepage had forms but the latest archived version does not. Confirm current lead capture paths.");
  }

  if (previous && previous.phones?.length && !latest.phones?.length) {
    warnings.push("Earlier archived homepage exposed phone numbers but the latest archived version did not. Confirm call tracking and phone visibility.");
  }

  if (previous && previous.toolSignals?.length && !latest.toolSignals?.length) {
    warnings.push("Earlier archived homepage exposed tracking/tool signals but the latest archived version did not. Confirm analytics and tag manager continuity.");
  }

  return warnings;
}

function compareText(label, latest, previous) {
  if (normalizeText(latest) === normalizeText(previous)) return null;
  return {
    signal: label,
    latest: latest || "Not detected",
    previous: previous || "Not detected",
    note: "Changed between recent Wayback captures.",
  };
}

function compareNumber(label, latest, previous) {
  if (Number(latest || 0) === Number(previous || 0)) return null;
  const delta = Number(latest || 0) - Number(previous || 0);
  return {
    signal: label,
    latest: String(latest || 0),
    previous: String(previous || 0),
    note: `${delta > 0 ? "+" : ""}${delta} from previous capture.`,
  };
}

function compareList(label, latest = [], previous = []) {
  const latestText = normalizeList(latest);
  const previousText = normalizeList(previous);
  if (latestText === previousText) return null;
  return {
    signal: label,
    latest: latest.length ? latest.join(", ") : "Not detected",
    previous: previous.length ? previous.join(", ") : "Not detected",
    note: "Visible set changed between recent Wayback captures.",
  };
}

function normalizeText(value) {
  return String(value || "").replace(/\s+/g, " ").trim().toLowerCase();
}

function normalizeList(values) {
  return [...new Set(values.map(normalizeText).filter(Boolean))].sort().join("|");
}

function cleanHost(value) {
  return String(value || "").replace(/^https?:\/\//i, "").replace(/\/.*$/, "").replace(/^www\.$/, "").trim().toLowerCase();
}

function snapshotOrigin(url) {
  try {
    return new URL(url).origin;
  } catch {
    return "https://example.com";
  }
}
