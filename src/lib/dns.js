const HOST_RECORD_TYPES = ["A", "AAAA", "CNAME"];
const ZONE_RECORD_TYPES = ["NS", "SOA", "MX", "TXT", "CAA", "DS"];

const DNS_RESOLVERS = [
  {
    name: "Cloudflare",
    url: "https://cloudflare-dns.com/dns-query",
  },
  {
    name: "Google",
    url: "https://dns.google/resolve",
  },
];

const COMMON_SUBDOMAINS = [
  "www",
  "staging",
  "stage",
  "dev",
  "test",
  "app",
  "portal",
  "client",
  "clients",
  "shop",
  "store",
  "blog",
  "booking",
  "mail",
  "email",
  "webmail",
  "crm",
  "support",
  "help",
  "admin",
];

const EXPANDED_SUBDOMAINS = [
  ...COMMON_SUBDOMAINS,
  "api",
  "assets",
  "autoconfig",
  "autodiscover",
  "billing",
  "cdn",
  "cloud",
  "cpanel",
  "dashboard",
  "demo",
  "docs",
  "files",
  "ftp",
  "go",
  "host",
  "imap",
  "intranet",
  "learn",
  "legacy",
  "login",
  "manage",
  "m",
  "mobile",
  "my",
  "ns1",
  "ns2",
  "old",
  "pay",
  "payments",
  "pop",
  "private",
  "secure",
  "server",
  "smtp",
  "status",
  "uat",
  "vpn",
  "whm",
];

export async function getDnsProfile(hostname, apexDomain = hostname, candidateZones = [apexDomain], options = {}) {
  const answers = {};
  const errors = {};
  const zones = [...new Set([apexDomain, ...candidateZones])];
  const selectedZone = await findBestZone(zones, errors);

  await Promise.all(
    HOST_RECORD_TYPES.map(async (type) => {
      try {
        answers[type] = await queryDns(hostname, type);
      } catch (error) {
        errors[type] = error.message;
        answers[type] = [];
      }
    }),
  );

  await Promise.all(
    ZONE_RECORD_TYPES.map(async (type) => {
      try {
        answers[type] = await queryDns(selectedZone, type);
      } catch (error) {
        errors[type] = error.message;
        answers[type] = [];
      }
    }),
  );

  const txtValues = answers.TXT.map((record) => record.data);
  const subdomainMode = options.subdomains ? "expanded" : "common";
  const subdomainCandidates = subdomainLabels(subdomainMode);
  const subdomains = await discoverCommonSubdomains(selectedZone, hostname, subdomainCandidates);
  const ipInsights = await enrichIpInsights([
    ...answers.A.map((record) => record.data),
    ...answers.AAAA.map((record) => record.data),
  ]);

  return {
    hostname,
    zone: selectedZone,
    candidateZones: zones,
    nameservers: answers.NS.map((record) => cleanDnsText(record.data)),
    addresses: answers.A.map((record) => record.data),
    ipv6Addresses: answers.AAAA.map((record) => record.data),
    cnames: answers.CNAME.map((record) => cleanDnsText(record.data)),
    soa: answers.SOA.map((record) => cleanDnsText(record.data)),
    mx: answers.MX.map((record) => ({
      priority: record.priority,
      exchange: formatMxExchange(record.exchange || record.data),
    })),
    txt: txtValues,
    spf: txtValues.find((value) => /^v=spf1\b/i.test(value)) || null,
    dmarc: await getDmarc(selectedZone),
    caa: answers.CAA.map((record) => record.data),
    dnssec: answers.DS.length > 0,
    subdomains,
    subdomainScan: {
      mode: subdomainMode,
      candidatesChecked: subdomainCandidates.length,
    },
    ipInsights,
    raw: answers,
    errors,
  };
}

async function getDmarc(hostname) {
  try {
    const records = await queryDns(`_dmarc.${hostname}`, "TXT");
    return records.map((record) => record.data).find((value) => /^v=DMARC1\b/i.test(value)) || null;
  } catch {
    return null;
  }
}

async function findBestZone(zones, errors) {
  for (const zone of zones) {
    try {
      const ns = await queryDns(zone, "NS");
      if (ns.length > 0) {
        return zone;
      }
    } catch (error) {
      errors[`NS:${zone}`] = error.message;
    }
  }

  return zones[0];
}

async function queryDns(name, type) {
  const errors = [];

  for (const resolver of DNS_RESOLVERS) {
    try {
      const url = new URL(resolver.url);
      url.searchParams.set("name", name);
      url.searchParams.set("type", type);

      const response = await fetch(url, {
        headers: {
          accept: "application/dns-json",
          "user-agent": "FITFO/0.1",
        },
      });

      if (!response.ok) {
        errors.push(`${resolver.name} HTTP ${response.status}`);
        continue;
      }

      const body = await response.json();
      return (body.Answer || []).map((answer) => parseDnsAnswer(answer, type));
    } catch (error) {
      errors.push(`${resolver.name}: ${error.message}`);
    }
  }

  throw new Error(`DNS ${type} lookup failed for ${name}: ${errors.join("; ")}`);
}

function subdomainLabels(mode) {
  return [...new Set(mode === "expanded" ? EXPANDED_SUBDOMAINS : COMMON_SUBDOMAINS)];
}

async function discoverCommonSubdomains(zone, scannedHostname, labels = COMMON_SUBDOMAINS) {
  const candidates = labels.map((label) => `${label}.${zone}`).filter((candidate) => candidate !== scannedHostname);
  const results = await Promise.all(
    candidates.map(async (name) => {
      try {
        const [addresses, cnames] = await Promise.all([queryDns(name, "A"), queryDns(name, "CNAME")]);
        const classification = classifySubdomain(name, zone);
        return {
          name,
          label: subdomainLabel(name, zone),
          addresses: addresses.map((record) => record.data),
          cnames: cnames.map((record) => cleanDnsText(record.data)),
          category: classification.category,
          priority: classification.priority,
          risk: classification.risk,
          action: classification.action,
        };
      } catch {
        return null;
      }
    }),
  );

  return results
    .filter((result) => result && (result.addresses.length > 0 || result.cnames.length > 0))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function classifySubdomain(name, zone = "") {
  const label = subdomainLabel(name, zone);

  if (/^(staging|stage|dev|test|demo|uat|old|legacy)$/.test(label)) {
    return {
      category: "Staging / legacy",
      priority: "High",
      risk: "May expose non-production, legacy, or redesign infrastructure.",
      action: "Confirm owner, purpose, access, and whether it needs to stay, be blocked, or redirect before launch.",
    };
  }

  if (/^(portal|client|clients|app|dashboard|login|my|secure|intranet|private)$/.test(label)) {
    return {
      category: "Portal / app",
      priority: "High",
      risk: "May support client portals, authenticated apps, dashboards, or private workflows.",
      action: "Do not remove or redirect until the client confirms active users, owner, and replacement path.",
    };
  }

  if (/^(booking|crm|support|help|go|learn|docs|status)$/.test(label)) {
    return {
      category: "Operations / support",
      priority: "Medium",
      risk: "May support booking, CRM, support, docs, or operational workflows.",
      action: "Confirm tool owner, lead routing, and whether launch changes affect this host.",
    };
  }

  if (/^(shop|store|pay|payments|billing)$/.test(label)) {
    return {
      category: "Commerce / billing",
      priority: "High",
      risk: "May support payments, billing, ecommerce, or customer account flows.",
      action: "Confirm platform owner, SSL, checkout/payment dependencies, and redirect requirements.",
    };
  }

  if (/^(mail|email|webmail|autodiscover|autoconfig|imap|pop|smtp)$/.test(label)) {
    return {
      category: "Email",
      priority: "High",
      risk: "May be tied to email hosting, mailbox discovery, or mail client configuration.",
      action: "Do not alter until email provider, MX/SPF/DKIM/DMARC, and mailbox ownership are confirmed.",
    };
  }

  if (/^(admin|cpanel|whm|ftp|server|host|cloud|vpn|manage|api)$/.test(label)) {
    return {
      category: "Technical admin / infrastructure",
      priority: "High",
      risk: "May expose admin, hosting, API, VPN, or infrastructure access paths.",
      action: "Confirm owner and access path; review security posture before launch or DNS cleanup.",
    };
  }

  if (/^(cdn|assets|files|blog|m|mobile|www|ns1|ns2)$/.test(label)) {
    return {
      category: "Content / delivery",
      priority: "Medium",
      risk: "May support content delivery, mobile variants, blog content, or DNS infrastructure.",
      action: "Confirm whether this host should remain live, consolidate, or be redirected.",
    };
  }

  return {
    category: "Unknown",
    priority: "Medium",
    risk: "Purpose is not obvious from the hostname.",
    action: "Confirm owner, purpose, access, and launch handling before DNS or redirect changes.",
  };
}

function subdomainLabel(name, zone = "") {
  const host = String(name || "").toLowerCase();
  const suffix = zone ? `.${String(zone).toLowerCase()}` : "";
  if (suffix && host.endsWith(suffix)) return host.slice(0, -suffix.length).split(".").pop();
  return host.split(".")[0] || host;
}

async function enrichIpInsights(addresses) {
  const uniqueAddresses = [...new Set(addresses.filter(Boolean))];
  const insights = await Promise.all(uniqueAddresses.map(async (address) => ({
    address,
    reverseDns: await getReverseDns(address),
    asn: await getAsnInsight(address),
  })));

  return insights.filter((item) => item.reverseDns.length || item.asn);
}

async function getReverseDns(address) {
  const ptrName = reverseLookupName(address);
  if (!ptrName) return [];

  try {
    const records = await queryDns(ptrName, "PTR");
    return records.map((record) => cleanDnsText(record.data));
  } catch {
    return [];
  }
}

async function getAsnInsight(address) {
  const lookupName = asnLookupName(address);
  if (!lookupName) return null;

  try {
    const records = await queryDns(lookupName, "TXT");
    const data = records.map((record) => cleanDnsText(record.data)).find((value) => /\|/.test(value));
    return parseCymruAsn(data);
  } catch {
    return null;
  }
}

function reverseLookupName(address) {
  if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(address)) {
    return `${address.split(".").reverse().join(".")}.in-addr.arpa`;
  }

  return null;
}

function asnLookupName(address) {
  if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(address)) {
    return `${address.split(".").reverse().join(".")}.origin.asn.cymru.com`;
  }

  return null;
}

function parseCymruAsn(value) {
  if (!value) return null;
  const parts = value.replace(/^"|"$/g, "").split("|").map((part) => part.trim());
  if (parts.length < 7 || /^AS/i.test(parts[0])) return null;

  return {
    asn: parts[0],
    route: parts[2],
    country: parts[3],
    registry: parts[4],
    allocated: parts[5],
    name: parts.slice(6).join(" | "),
  };
}

function parseDnsAnswer(answer, type) {
  if (type === "MX") {
    const [priority, ...exchangeParts] = answer.data.split(/\s+/);
    return {
      ...answer,
      priority: Number(priority),
      exchange: exchangeParts.join(" "),
    };
  }

  return answer;
}

function cleanDnsText(value) {
  return String(value || "").replace(/\.$/, "").replace(/^"|"$/g, "").replace(/\\"/g, "\"");
}

function formatMxExchange(value) {
  const cleaned = cleanDnsText(value);
  return cleaned || "(null MX, no mail accepted)";
}
