import { buildPlumbingHomeownerUx, plumbingProfile } from "./plumbing.js";

const PROFILES = new Map([
  [plumbingProfile.slug, plumbingProfile],
]);

export function supportedVerticals() {
  return [...PROFILES.keys()];
}

export function normalizeVertical(value) {
  if (!value) return null;
  const slug = String(value).trim().toLowerCase();
  if (!PROFILES.has(slug)) {
    throw new Error(`Unsupported vertical "${value}". Supported verticals: ${supportedVerticals().join(", ")}.`);
  }
  return slug;
}

export function getVerticalProfile(slug) {
  return PROFILES.get(normalizeVertical(slug));
}

export function detectVertical(scan = {}) {
  const haystack = [
    scan.http?.title,
    ...(scan.site?.pages || []).flatMap((page) => [
      page.path,
      page.title,
      page.metaDescription,
      ...(page.headings?.h1 || []),
      ...(page.headings?.h2 || []),
    ]),
    ...(scan.research?.results || []).flatMap((result) => [
      result.title,
      result.description,
      result.url,
    ]),
  ].filter(Boolean).join(" ");

  for (const profile of PROFILES.values()) {
    if (profile.detect.some((pattern) => pattern.test(haystack))) {
      return profile.slug;
    }
  }

  return null;
}

export function buildVerticalContext(scan = {}, options = {}) {
  const explicitSlug = normalizeVertical(options.vertical);
  const detectedSlug = explicitSlug || detectVertical(scan);
  if (!detectedSlug) {
    return {
      slug: null,
      label: null,
      source: "none",
      homeownerUx: [],
      proofAssets: [],
      audienceQuestions: [],
      services: [],
      operationsTools: [],
    };
  }

  const profile = getVerticalProfile(detectedSlug);
  return {
    slug: profile.slug,
    label: profile.label,
    source: explicitSlug ? "explicit" : "detected",
    homeownerUx: buildHomeownerUx(profile, scan),
    proofAssets: profile.proofAssets,
    audienceQuestions: profile.audienceQuestions,
    services: profile.services,
    operationsTools: profile.operationsTools,
  };
}

function buildHomeownerUx(profile, scan) {
  if (profile.slug === "plumbing") {
    return buildPlumbingHomeownerUx(scan);
  }

  return [];
}
