import { safeHostname } from "./utils.js";

const DIRECTORY_HOSTS = /\b(yelp|angi|angieslist|homeadvisor|bbb|thumbtack|houzz|nextdoor|yellowpages|mapquest|porch|facebook|google|bing|apple|chamberofcommerce)\b/i;
const ADDRESS_PATTERN = /\b\d{2,6}\s+[A-Z0-9][A-Z0-9 .'-]{2,80}\s+(?:St|Street|Ave|Avenue|Rd|Road|Dr|Drive|Blvd|Boulevard|Ln|Lane|Ct|Court|Way|Pkwy|Parkway|Pl|Place|Hwy|Highway)\b(?:[ ,]+[A-Z][A-Za-z .'-]{2,40})?[ ,]+[A-Z]{2}[ ,]+\d{5}(?:-\d{4})?|\b\d{2,6}\s+[A-Z0-9][A-Z0-9 .'-]{2,80}\s+(?:St|Street|Ave|Avenue|Rd|Road|Dr|Drive|Blvd|Boulevard|Ln|Lane|Ct|Court|Way|Pkwy|Parkway|Pl|Place|Hwy|Highway)\b(?:[ ,]+[A-Z][A-Za-z .'-]{2,40})?(?:[ ,]+[A-Z]{2})?/gi;

export function buildCitationBaseline(scan = {}) {
  const canonical = buildCanonicalNapCandidate(scan);
  const rows = [
    buildWebsiteRow(scan, canonical),
    ...buildResearchCitationRows(scan, canonical),
  ].filter(Boolean).slice(0, 20);

  return {
    canonical,
    summary: summarizeCitationRows(rows),
    rows,
    confirmationQuestion: "Confirm the exact business name, public phone number, address or service area, Google Business Profile owner, and whether call-tracking numbers should appear on citations.",
  };
}

export function extractAddressCandidates(value) {
  const text = String(value || "").replace(/\s+/g, " ");
  const matches = text.match(ADDRESS_PATTERN) || [];
  return unique(matches.map(cleanAddress)).slice(0, 6);
}

export function extractPhones(value) {
  return unique((String(value || "").match(/\+?1?[-.\s(]*\b\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}\b/g) || [])
    .map((phone) => phone.replace(/^\+?1[-.\s]*/, "").trim()))
    .slice(0, 6);
}

function buildCanonicalNapCandidate(scan) {
  const pages = scan.site?.pages || [];
  const homepage = pages.find((page) => page.path === "/") || pages[0] || {};
  const names = unique([
    cleanBusinessName(homepage.headings?.h1?.[0]),
    cleanBusinessName(homepage.title),
    cleanBusinessName(scan.http?.title),
  ].filter(Boolean));
  const phones = unique([
    ...(scan.site?.summary?.phonesDetected || []),
    ...pages.flatMap((page) => page.phones || []),
  ]);
  const addresses = unique([
    ...(scan.site?.summary?.addressesDetected || []),
    ...pages.flatMap((page) => page.addresses || []),
    ...extractAddressCandidates(buildSiteText(scan)),
  ]);

  return {
    name: names[0] || "Unknown",
    nameSource: names[0] ? "Homepage/title signals" : "Ask Client",
    phone: phones[0] || "Unknown",
    phoneSource: phones[0] ? "Crawled website" : "Ask Client",
    address: addresses[0] || "Unknown",
    addressSource: addresses[0] ? "Crawled website" : "Ask Client",
    confidence: names[0] && phones[0] ? "Medium" : "Low",
    note: "Canonical NAP candidate only. Client must confirm the official citation record before cleanup work.",
  };
}

function buildWebsiteRow(scan, canonical) {
  return {
    source: "Current website",
    type: "owned",
    url: scan.http?.finalUrl || `https://${scan.domain?.hostname || scan.domain?.apex || ""}`,
    foundName: canonical.name,
    foundAddress: canonical.address,
    foundPhone: canonical.phone,
    matchStatus: canonical.phone === "Unknown" ? "Needs canonical phone" : "Canonical candidate",
    risk: canonical.phone === "Unknown" ? "High" : "Medium",
    action: "Confirm this is the official NAP before using it to clean up directories.",
  };
}

function buildResearchCitationRows(scan, canonical) {
  return (scan.research?.results || [])
    .filter((result) => isCitationResult(result, scan.domain?.apex))
    .map((result) => {
      const haystack = `${result.title || ""} ${result.description || ""} ${result.url || ""}`;
      const foundPhone = extractPhones(haystack)[0] || "Not found in snippet";
      const foundAddress = extractAddressCandidates(haystack)[0] || "Not found in snippet";
      const foundName = cleanBusinessName(result.title) || "Not found in snippet";
      const matchStatus = classifyNapMatch({ foundName, foundAddress, foundPhone }, canonical);

      return {
        source: sourceName(result.url),
        type: citationType(result),
        url: result.url || "",
        foundName,
        foundAddress,
        foundPhone,
        matchStatus,
        risk: riskForMatch(matchStatus),
        action: actionForMatch(matchStatus),
      };
    });
}

function isCitationResult(result, apex) {
  const hostname = safeHostname(result.url);
  if (!hostname || sameDomain(hostname, apex)) return false;
  const text = `${hostname} ${result.title || ""} ${result.description || ""}`;
  return DIRECTORY_HOSTS.test(text) || /\breview|rating|directory|profile|listing|map|maps\b/i.test(text);
}

function classifyNapMatch(found, canonical) {
  const hasPhone = found.foundPhone !== "Not found in snippet";
  const hasAddress = found.foundAddress !== "Not found in snippet";
  const hasName = found.foundName !== "Not found in snippet";

  if (!hasPhone && !hasAddress && !hasName) return "No NAP in snippet";
  if (hasPhone && canonical.phone !== "Unknown" && normalizePhone(found.foundPhone) !== normalizePhone(canonical.phone)) return "Phone mismatch";
  if (hasAddress && canonical.address !== "Unknown" && normalizeText(found.foundAddress) !== normalizeText(canonical.address)) return "Address mismatch";
  if (hasName && canonical.name !== "Unknown" && !namesLookRelated(found.foundName, canonical.name)) return "Name variation";
  if (hasName && hasPhone && (hasAddress || canonical.address === "Unknown")) return "Consistent candidate";
  return "Partial NAP";
}

function riskForMatch(matchStatus) {
  if (/phone mismatch|address mismatch/i.test(matchStatus)) return "High";
  if (/partial|no nap|needs/i.test(matchStatus)) return "Medium";
  if (/name variation/i.test(matchStatus)) return "Low";
  return "Low";
}

function actionForMatch(matchStatus) {
  if (matchStatus === "Phone mismatch") return "Verify whether this is an approved tracking number or an outdated citation.";
  if (matchStatus === "Address mismatch") return "Confirm physical address/service-area policy and update the listing if incorrect.";
  if (matchStatus === "Name variation") return "Confirm whether the name variant matches real-world branding and GBP policy.";
  if (matchStatus === "Partial NAP") return "Claim or update the profile after canonical NAP is confirmed.";
  if (matchStatus === "No NAP in snippet") return "Open the profile manually if it matters; snippet did not expose enough NAP data.";
  if (matchStatus === "Canonical candidate") return "Use this only after client confirms the official citation record.";
  return "Monitor or confirm ownership during citation cleanup.";
}

function summarizeCitationRows(rows) {
  const counts = {
    total: rows.length,
    highRisk: rows.filter((row) => row.risk === "High").length,
    needsReview: rows.filter((row) => row.matchStatus !== "Consistent candidate" && row.matchStatus !== "Canonical candidate").length,
  };

  return {
    ...counts,
    label: `${counts.total} citation/source row(s), ${counts.highRisk} high-risk mismatch(es), ${counts.needsReview} needing review`,
  };
}

function buildSiteText(scan) {
  return (scan.site?.pages || []).flatMap((page) => [
    page.title,
    page.metaDescription,
    ...(page.headings?.h1 || []),
    ...(page.headings?.h2 || []),
  ]).filter(Boolean).join(" ");
}

function cleanBusinessName(value) {
  const candidate = String(value || "")
    .split(/\s[|-]\s/)
    .map((part) => part.trim())
    .find(Boolean);
  if (!candidate) return null;
  return candidate
    .replace(/\b(reviews?|ratings?|profile|listing|near me)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim() || null;
}

function cleanAddress(value) {
  return String(value || "").replace(/[.,\s]+$/g, "").replace(/\s+/g, " ").trim();
}

function sourceName(url) {
  const hostname = safeHostname(url).replace(/^www\./, "");
  if (!hostname) return "Directory / profile";
  return hostname.split(".").slice(0, -1).join(".") || hostname;
}

function citationType(result) {
  const text = `${result.title || ""} ${result.description || ""} ${result.url || ""}`;
  if (/\b(yelp|bbb|angi|homeadvisor|thumbtack|review|rating|stars?)\b/i.test(text)) return "review/directory";
  if (/\b(facebook|instagram|linkedin|youtube|x\.com|twitter|tiktok)\b/i.test(text)) return "social";
  if (/\b(google|maps|bing|apple)\b/i.test(text)) return "map/profile";
  return "directory";
}

function namesLookRelated(a, b) {
  const left = normalizeText(a);
  const right = normalizeText(b);
  if (!left || !right) return false;
  return left.includes(right) || right.includes(left) || sharedTokens(left, right) >= 2;
}

function sharedTokens(a, b) {
  const left = new Set(a.split(" ").filter((token) => token.length > 2));
  return b.split(" ").filter((token) => left.has(token)).length;
}

function normalizePhone(value) {
  return String(value || "").replace(/\D/g, "").replace(/^1(?=\d{10}$)/, "");
}

function normalizeText(value) {
  return String(value || "").toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, " ").trim();
}

function sameDomain(hostname, apex) {
  if (!hostname || !apex) return false;
  const clean = hostname.replace(/^www\./, "");
  return clean === apex || clean.endsWith(`.${apex}`);
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}
