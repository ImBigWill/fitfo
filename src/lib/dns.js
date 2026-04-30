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

export async function getDnsProfile(hostname, apexDomain = hostname, candidateZones = [apexDomain]) {
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
  const subdomains = await discoverCommonSubdomains(selectedZone, hostname);
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

async function discoverCommonSubdomains(zone, scannedHostname) {
  const candidates = COMMON_SUBDOMAINS.map((label) => `${label}.${zone}`).filter((candidate) => candidate !== scannedHostname);
  const results = await Promise.all(
    candidates.map(async (name) => {
      try {
        const [addresses, cnames] = await Promise.all([queryDns(name, "A"), queryDns(name, "CNAME")]);
        return {
          name,
          addresses: addresses.map((record) => record.data),
          cnames: cnames.map((record) => cleanDnsText(record.data)),
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
