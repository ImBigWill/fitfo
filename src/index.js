import { normalizeDomainInput } from "./lib/domain.js";
import { getDnsProfile } from "./lib/dns.js";
import { getHttpProfile } from "./lib/http.js";
import { getRdapProfile } from "./lib/rdap.js";
import { getSiteProfile } from "./lib/site.js";
import { getResearchProfile } from "./lib/research.js";
import { getWaybackProfile } from "./lib/wayback.js";
import { analyzeProfile } from "./lib/analyze.js";
import { APP_VERSION } from "./meta.js";
import { buildVerticalContext, normalizeVertical } from "./verticals/index.js";

export async function scanDomain(input, options = {}) {
  const startedAt = new Date().toISOString();
  const domain = normalizeDomainInput(input);
  const verticalSlug = normalizeVertical(options.vertical);

  const [rdap, dns, http] = await Promise.all([
    getRdapProfile(domain.apex),
    getDnsProfile(domain.hostname, domain.apex, domain.candidates),
    getHttpProfile(domain.hostname, domain.apex),
  ]);

  const analysis = analyzeProfile({ domain, rdap, dns, http });
  const site = await getSiteProfile(domain, http, {
    deep: options.deep,
    limit: options.crawlLimit,
  });
  const research = await getResearchProfile(domain, http, site, {
    search: options.search,
    provider: options.researchProvider,
    searchLimit: options.searchLimit,
    location: options.location,
    country: options.country,
  });
  const wayback = await getWaybackProfile(domain, http, {
    enabled: options.wayback,
    limit: options.waybackLimit,
    versions: options.waybackVersions,
  });

  const scan = {
    tool: "FITFO",
    scanVersion: APP_VERSION,
    startedAt,
    finishedAt: new Date().toISOString(),
    domain,
    rdap,
    dns,
    http,
    site,
    research,
    wayback,
    analysis,
  };

  return {
    ...scan,
    vertical: buildVerticalContext(scan, { vertical: verticalSlug }),
  };
}
