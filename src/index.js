import { normalizeDomainInput } from "./lib/domain.js";
import { getDnsProfile } from "./lib/dns.js";
import { getHttpProfile } from "./lib/http.js";
import { getRdapProfile } from "./lib/rdap.js";
import { analyzeProfile } from "./lib/analyze.js";

export async function scanDomain(input) {
  const startedAt = new Date().toISOString();
  const domain = normalizeDomainInput(input);

  const [rdap, dns, http] = await Promise.all([
    getRdapProfile(domain.apex),
    getDnsProfile(domain.hostname, domain.apex, domain.candidates),
    getHttpProfile(domain.hostname),
  ]);

  const analysis = analyzeProfile({ domain, rdap, dns, http });

  return {
    tool: "FITFO",
    scanVersion: "0.1.0",
    startedAt,
    finishedAt: new Date().toISOString(),
    domain,
    rdap,
    dns,
    http,
    analysis,
  };
}
