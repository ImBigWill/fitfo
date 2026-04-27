import net from "node:net";

let bootstrapPromise;

const WHOIS_FALLBACKS = {
  af: "whois.nic.af",
};

const RDAP_FALLBACKS = {
  agency: ["https://rdap.identitydigital.services/rdap/"],
  ai: ["https://rdap.identitydigital.services/rdap/"],
  app: ["https://pubapi.registry.google/rdap/"],
  biz: ["https://rdap.nic.biz/"],
  business: ["https://rdap.identitydigital.services/rdap/"],
  ca: ["https://rdap.ca.fury.ca/rdap/"],
  care: ["https://rdap.identitydigital.services/rdap/"],
  cc: ["https://tld-rdap.verisign.com/cc/v1/"],
  center: ["https://rdap.identitydigital.services/rdap/"],
  cloud: ["https://rdap.registry.cloud/rdap/"],
  co: ["https://rdap.identitydigital.services/rdap/"],
  com: ["https://rdap.verisign.com/com/v1/"],
  company: ["https://rdap.identitydigital.services/rdap/"],
  consulting: ["https://rdap.identitydigital.services/rdap/"],
  construction: ["https://rdap.identitydigital.services/rdap/"],
  contractors: ["https://rdap.identitydigital.services/rdap/"],
  design: ["https://rdap.nic.design/"],
  dev: ["https://pubapi.registry.google/rdap/"],
  digital: ["https://rdap.identitydigital.services/rdap/"],
  expert: ["https://rdap.identitydigital.services/rdap/"],
  finance: ["https://rdap.identitydigital.services/rdap/"],
  group: ["https://rdap.identitydigital.services/rdap/"],
  health: ["https://rdap.nic.health/"],
  homes: ["https://rdap.centralnic.com/homes/"],
  inc: ["https://rdap.centralnic.com/inc/"],
  info: ["https://rdap.identitydigital.services/rdap/"],
  io: ["https://rdap.identitydigital.services/rdap/"],
  law: ["https://rdap.nic.law/"],
  legal: ["https://rdap.identitydigital.services/rdap/"],
  live: ["https://rdap.identitydigital.services/rdap/"],
  llc: ["https://rdap.identitydigital.services/rdap/"],
  ly: ["https://rdap.nic.ly/"],
  marketing: ["https://rdap.identitydigital.services/rdap/"],
  me: ["https://rdap.identitydigital.services/rdap/", "https://rdap.nic.me/"],
  media: ["https://rdap.identitydigital.services/rdap/"],
  net: ["https://rdap.verisign.com/net/v1/"],
  network: ["https://rdap.identitydigital.services/rdap/"],
  one: ["https://rdap.nic.one/"],
  online: ["https://rdap.radix.host/rdap/"],
  org: ["https://rdap.publicinterestregistry.org/rdap/"],
  page: ["https://pubapi.registry.google/rdap/"],
  plumbing: ["https://rdap.identitydigital.services/rdap/"],
  pro: ["https://rdap.identitydigital.services/rdap/"],
  repair: ["https://rdap.identitydigital.services/rdap/"],
  services: ["https://rdap.identitydigital.services/rdap/"],
  shop: ["https://rdap.gmoregistry.net/rdap/"],
  site: ["https://rdap.radix.host/rdap/"],
  software: ["https://rdap.identitydigital.services/rdap/"],
  solutions: ["https://rdap.identitydigital.services/rdap/"],
  store: ["https://rdap.radix.host/rdap/"],
  studio: ["https://rdap.identitydigital.services/rdap/"],
  systems: ["https://rdap.identitydigital.services/rdap/"],
  tech: ["https://rdap.radix.host/rdap/"],
  tools: ["https://rdap.identitydigital.services/rdap/"],
  tv: ["https://rdap.nic.tv/"],
  uk: ["https://rdap.nominet.uk/uk/"],
  us: ["https://rdap.nic.us/"],
  website: ["https://rdap.radix.host/rdap/"],
  xyz: ["https://rdap.centralnic.com/xyz/"],
};

export async function getRdapProfile(apexDomain) {
  try {
    const rdap = await fetchRdap(apexDomain);
    return normalizeRdap(rdap, apexDomain);
  } catch (error) {
    const whois = await getWhoisFallbackProfile(apexDomain, error).catch(() => null);
    if (whois) return whois;

    return {
      domain: apexDomain,
      available: false,
      error: error.message,
      registrar: null,
      nameservers: [],
      statuses: [],
      dates: {},
      raw: null,
    };
  }
}

async function fetchRdap(domain) {
  const urls = await getRdapUrls(domain);
  const errors = [];

  for (const url of urls) {
    try {
      const response = await fetch(url, {
        headers: {
          accept: "application/rdap+json, application/json",
          "user-agent": "FITFO/0.1",
        },
      });

      if (response.ok) {
        return response.json();
      }

      errors.push(`${url} returned HTTP ${response.status}`);
    } catch (error) {
      errors.push(`${url} failed: ${error.message}`);
    }
  }

  throw new Error(`RDAP lookup failed. Tried ${urls.length} endpoint(s): ${errors.join("; ")}`);
}

async function getRdapUrls(domain) {
  const tld = domain.split(".").pop();
  const urls = [];
  let bootstrap;

  try {
    bootstrap = await getBootstrap();
  } catch {
    bootstrap = null;
  }

  if (bootstrap) {
    for (const [tlds, baseUrls] of bootstrap.services) {
      if (tlds.includes(tld)) {
        urls.push(...baseUrls.map((baseUrl) => buildDomainUrl(baseUrl, domain)));
      }
    }
  }

  urls.push(...(RDAP_FALLBACKS[tld] || []).map((baseUrl) => buildDomainUrl(baseUrl, domain)));
  urls.push(buildDomainUrl("https://rdap.org/", domain));

  return [...new Set(urls)];
}

async function getBootstrap() {
  if (!bootstrapPromise) {
    bootstrapPromise = fetch("https://data.iana.org/rdap/dns.json", {
      headers: {
        accept: "application/json",
        "user-agent": "FITFO/0.1",
      },
    }).then((response) => {
      if (!response.ok) {
        throw new Error(`IANA RDAP bootstrap failed with HTTP ${response.status}`);
      }
      return response.json();
    });
  }

  return bootstrapPromise;
}

function normalizeRdap(rdap, domain) {
  return {
    domain,
    available: true,
    registrar: findRegistrar(rdap),
    nameservers: (rdap.nameservers || []).map((server) => server.ldhName || server.unicodeName).filter(Boolean),
    statuses: rdap.status || [],
    dates: Object.fromEntries((rdap.events || []).map((event) => [event.eventAction, event.eventDate])),
    raw: rdap,
  };
}

async function getWhoisFallbackProfile(domain, rdapError) {
  const tld = domain.split(".").pop();
  const host = WHOIS_FALLBACKS[tld];
  if (!host) return null;

  const raw = await queryWhois(host, domain);
  const parsed = parseWhois(raw);

  return {
    domain,
    available: true,
    source: "WHOIS",
    error: rdapError.message,
    registrar: parsed.registrar ? { name: parsed.registrar, handle: null } : null,
    nameservers: parsed.nameservers,
    statuses: parsed.statuses,
    dates: parsed.dates,
    raw,
  };
}

function queryWhois(host, domain) {
  return new Promise((resolve, reject) => {
    const socket = net.createConnection(43, host);
    let output = "";

    socket.setTimeout(8_000);
    socket.setEncoding("utf8");

    socket.on("connect", () => {
      socket.write(`${domain}\r\n`);
    });

    socket.on("data", (chunk) => {
      output += chunk;
    });

    socket.on("end", () => {
      resolve(output);
    });

    socket.on("timeout", () => {
      socket.destroy(new Error(`WHOIS lookup timed out for ${host}`));
    });

    socket.on("error", reject);
  });
}

function parseWhois(raw) {
  const lines = raw.split(/\r?\n/);
  const nameservers = [];
  const statuses = [];
  const dates = {};
  let registrar = null;

  for (const line of lines) {
    const [rawKey, ...rawValueParts] = line.split(":");
    if (!rawValueParts.length) continue;

    const key = rawKey.trim().toLowerCase();
    const value = rawValueParts.join(":").trim();
    if (!value) continue;

    if (!registrar && /registrar|sponsoring registrar/.test(key) && !/date|expir|created|updated|changed/.test(key)) {
      registrar = value;
    } else if (/name server|nameserver|nserver/.test(key)) {
      nameservers.push(value.split(/\s+/)[0].toLowerCase().replace(/\.$/, ""));
    } else if (/status/.test(key)) {
      statuses.push(value);
    } else if (/created|creation|registered/.test(key)) {
      dates.registration ||= value;
    } else if (/expir|paid-till/.test(key)) {
      dates.expiration ||= value;
    } else if (/updated|changed|modified/.test(key)) {
      dates["last changed"] ||= value;
    }
  }

  return {
    registrar,
    nameservers: [...new Set(nameservers)],
    statuses: [...new Set(statuses)],
    dates,
  };
}

function findRegistrar(rdap) {
  const entities = rdap.entities || [];
  const registrar = entities.find((entity) => (entity.roles || []).includes("registrar"));
  if (!registrar) return null;

  const vcard = registrar.vcardArray?.[1] || [];
  const fn = vcard.find((entry) => entry[0] === "fn");
  const org = vcard.find((entry) => entry[0] === "org");

  return {
    name: fn?.[3] || org?.[3] || registrar.handle || null,
    handle: registrar.handle || null,
  };
}

function buildDomainUrl(baseUrl, domain) {
  if (baseUrl.includes("{domain}")) {
    return baseUrl.replace("{domain}", encodeURIComponent(domain));
  }

  const normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(`domain/${encodeURIComponent(domain)}`, normalizedBaseUrl).toString();
}
