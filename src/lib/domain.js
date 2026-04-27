const COMMON_SECOND_LEVEL_TLDS = new Set([
  "ac.uk",
  "co.uk",
  "gov.uk",
  "ltd.uk",
  "me.uk",
  "net.uk",
  "org.uk",
  "plc.uk",
  "com.au",
  "net.au",
  "org.au",
  "co.nz",
  "org.nz",
  "com.br",
  "com.mx",
  "com.sg",
  "co.jp",
  "com.tr",
  "com.ar",
  "com.cn",
  "com.hk",
  "co.za",
  "co.ai",
  "com.ai",
  "net.ai",
  "org.ai",
]);

export function normalizeDomainInput(input) {
  const raw = String(input || "").trim();
  if (!raw) {
    throw new Error("A domain is required.");
  }

  const withProtocol = /^[a-z][a-z0-9+.-]*:\/\//i.test(raw) ? raw : `https://${raw}`;
  let parsed;
  try {
    parsed = new URL(withProtocol);
  } catch {
    throw new Error(`Could not parse domain: ${input}`);
  }

  const hostname = parsed.hostname.toLowerCase().replace(/\.$/, "");
  if (!hostname || !hostname.includes(".")) {
    throw new Error(`Expected a real domain, got: ${input}`);
  }

  return {
    input: raw,
    hostname,
    apex: guessApexDomain(hostname),
    candidates: guessDomainCandidates(hostname),
  };
}

function guessApexDomain(hostname) {
  const labels = hostname.split(".").filter(Boolean);
  if (labels.length <= 2) {
    return hostname;
  }

  const lastTwo = labels.slice(-2).join(".");
  if (COMMON_SECOND_LEVEL_TLDS.has(lastTwo)) {
    return labels.slice(-3).join(".");
  }

  return labels.slice(-2).join(".");
}

function guessDomainCandidates(hostname) {
  const labels = hostname.split(".").filter(Boolean);
  const candidates = [guessApexDomain(hostname)];

  for (let index = 0; index < labels.length - 1; index += 1) {
    candidates.push(labels.slice(index).join("."));
  }

  return [...new Set(candidates)];
}
