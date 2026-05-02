const HOSTING_HINTS = [
  ["wp engine", "WP Engine"],
  ["wpengine", "WP Engine"],
  ["wpenginepowered", "WP Engine"],
  ["wpeproxy", "WP Engine"],
  ["flywheel", "Flywheel"],
  ["kinsta", "Kinsta"],
  ["kinsta.cloud", "Kinsta"],
  ["pantheonsite", "Pantheon"],
  ["pantheon", "Pantheon"],
  ["acquia", "Acquia"],
  ["siteground", "SiteGround"],
  ["dreamhost", "DreamHost"],
  ["bluehost", "Bluehost"],
  ["hostgator", "HostGator"],
  ["a2hosting", "A2 Hosting"],
  ["hostinger", "Hostinger"],
  ["digitalocean", "DigitalOcean"],
  ["linode", "Akamai/Linode"],
  ["liquidweb", "Liquid Web"],
  ["cloudways", "Cloudways"],
  ["ionos", "IONOS"],
  ["ui-dns", "IONOS"],
  ["pressable", "Pressable"],
  ["wordpress.com", "WordPress.com"],
  ["godaddy", "GoDaddy"],
  ["secureserver", "GoDaddy"],
  ["namecheap", "Namecheap"],
  ["porkbun", "Porkbun"],
  ["name.com", "Name.com"],
  ["squarespace", "Squarespace"],
  ["shopify", "Shopify"],
  ["myshopify", "Shopify"],
  ["webflow", "Webflow"],
  ["wixdns", "Wix"],
  ["wix", "Wix"],
  ["netlify", "Netlify"],
  ["vercel", "Vercel"],
  ["amazonaws", "AWS"],
  ["amazon.com", "AWS"],
  ["cloudfront", "AWS CloudFront"],
  ["fastly", "Fastly"],
  ["akamai", "Akamai"],
  ["google", "Google Cloud"],
  ["googleusercontent", "Google Cloud"],
  ["azure", "Microsoft Azure"],
  ["microsoft", "Microsoft Azure"],
  ["ovh", "OVHcloud"],
  ["hetzner", "Hetzner"],
];

const DNS_PROVIDER_HINTS = [
  ["domaincontrol.com", "GoDaddy"],
  ["godaddy", "GoDaddy"],
  ["registrar-servers.com", "Namecheap"],
  ["namecheaphosting.com", "Namecheap"],
  ["hostinger", "Hostinger"],
  ["dns-parking.com", "Hostinger"],
  ["squarespacedns.com", "Squarespace"],
  ["wpengine.com", "WP Engine"],
  ["flywheel", "Flywheel"],
  ["getflywheel.com", "Flywheel"],
  ["kinsta.cloud", "Kinsta"],
  ["bluehost.com", "Bluehost"],
  ["hostgator.com", "HostGator"],
  ["a2hosting.com", "A2 Hosting"],
  ["dreamhost.com", "DreamHost"],
  ["liquidweb.com", "Liquid Web"],
  ["nexcess.net", "Nexcess/Liquid Web"],
  ["digitalocean.com", "DigitalOcean"],
  ["linode.com", "Akamai/Linode"],
  ["hover.com", "Hover"],
  ["tucows.com", "Tucows"],
  ["ionos.com", "IONOS"],
  ["ui-dns", "IONOS"],
  ["enom.com", "eNom"],
  ["dynect.net", "Oracle Dyn"],
  ["nsone.net", "NS1"],
  ["wixdns.net", "Wix"],
  ["siteground.net", "SiteGround"],
  ["siteground", "SiteGround"],
  ["cloudflare.com", "Cloudflare"],
  ["dnsmadeeasy.com", "DNS Made Easy"],
  ["dnsimple.com", "DNSimple"],
  ["route53", "AWS Route 53"],
  ["awsdns", "AWS Route 53"],
  ["googledomains.com", "Google Domains"],
  ["porkbun.com", "Porkbun"],
  ["name.com", "Name.com"],
];

const REGISTRAR_HINTS = [
  ["domaincontrol.com", "GoDaddy"],
  ["secureserver.net", "GoDaddy"],
  ["registrar-servers.com", "Namecheap"],
  ["dns-parking.com", "Hostinger"],
  ["squarespacedns.com", "Squarespace Domains"],
  ["wixdns.net", "Wix"],
  ["porkbun.com", "Porkbun"],
  ["name.com", "Name.com"],
  ["hover.com", "Hover"],
  ["dreamhost.com", "DreamHost"],
  ["ionos.com", "IONOS"],
  ["ui-dns", "IONOS"],
];

const EMAIL_HINTS = [
  ["google.com", "Google Workspace"],
  ["googlemail.com", "Google Workspace"],
  ["outlook.com", "Microsoft 365"],
  ["protection.outlook.com", "Microsoft 365"],
  ["zoho", "Zoho Mail"],
  ["mailgun", "Mailgun"],
  ["postmarkapp", "Postmark"],
  ["sendgrid", "SendGrid"],
  ["rackspace", "Rackspace Email"],
  ["emailsrvr.com", "Rackspace Email"],
  ["secureserver.net", "GoDaddy Email"],
  ["titan.email", "Titan Email"],
  ["ppe-hosted.com", "Proofpoint"],
];

const EMAIL_SENDER_HINTS = [
  ["_spf.google.com", "Google Workspace"],
  ["spf.protection.outlook.com", "Microsoft 365"],
  ["mailgun.org", "Mailgun"],
  ["mailgun", "Mailgun"],
  ["sendgrid.net", "SendGrid"],
  ["sendgrid", "SendGrid"],
  ["spf.mtasv.net", "Postmark"],
  ["postmarkapp", "Postmark"],
  ["amazonses.com", "Amazon SES"],
  ["amazonses", "Amazon SES"],
  ["servers.mcsv.net", "Mailchimp"],
  ["spf.mandrillapp.com", "Mandrill/Mailchimp Transactional"],
  ["klaviyo", "Klaviyo"],
  ["hubspotemail.net", "HubSpot"],
  ["helpscoutemail.com", "Help Scout"],
  ["zoho", "Zoho"],
  ["secureserver.net", "GoDaddy Email"],
  ["spf.em.secureserver.net", "GoDaddy Email"],
];

const CONNECTED_SERVICE_HINTS = [
  ["google-site-verification", "Google verification"],
  ["MS=", "Microsoft verification"],
  ["facebook-domain-verification", "Facebook domain verification"],
  ["klaviyo", "Klaviyo"],
  ["mailgun", "Mailgun"],
  ["sendgrid", "SendGrid"],
  ["postmark", "Postmark"],
  ["hubspot", "HubSpot"],
  ["zendesk", "Zendesk"],
  ["shopify", "Shopify"],
  ["webflow", "Webflow"],
  ["squarespace", "Squarespace"],
  ["stripe", "Stripe"],
  ["amazonses", "Amazon SES"],
  ["spf.mandrillapp.com", "Mandrill/Mailchimp Transactional"],
  ["servers.mcsv.net", "Mailchimp"],
  ["helpscout", "Help Scout"],
];

const OPERATIONS_HINTS = [
  [/servicetitan|service titan|servicetitan\.com|schedule\.engine/i, "ServiceTitan"],
  [/housecallpro|housecall-pro|housecall pro/i, "Housecall Pro"],
  [/jobber|getjobber/i, "Jobber"],
  [/fieldedge/i, "FieldEdge"],
  [/servicefusion|service fusion/i, "Service Fusion"],
  [/servicem8/i, "ServiceM8"],
  [/workiz/i, "Workiz"],
  [/podium/i, "Podium"],
  [/birdeye/i, "Birdeye"],
  [/nicejob/i, "NiceJob"],
  [/broadly/i, "Broadly"],
  [/angi|homeadvisor/i, "Angi/HomeAdvisor"],
  [/thumbtack/i, "Thumbtack"],
  [/scheduleengine/i, "Schedule Engine"],
  [/fieldroutes/i, "FieldRoutes"],
  [/gorilladesk/i, "GorillaDesk"],
  [/salesforce/i, "Salesforce"],
  [/zoho/i, "Zoho CRM"],
  [/hubspot/i, "HubSpot CRM"],
];

export function analyzeProfile({ domain, rdap, dns, http }) {
  const inputStatus = analyzeInputStatus({ domain, rdap, dns, http });
  const registrarDetails = detectRegistrar({ rdap, dns });
  const cloudflare = detectCloudflare({ rdap, dns, http });
  const dnsProvider = detectDnsProvider({ rdap, dns, cloudflare });
  const hosting = detectHosting({ dns, http, cloudflare });
  const email = detectEmail(dns);
  const emailSafety = analyzeEmailSafety(dns, email);
  const connectedServices = detectConnectedServices(dns);
  const cms = detectCms(http);
  const marketing = detectMarketingStack(http);
  const operations = detectOperationsStack({ dns, http });
  const urlStructure = analyzeUrlStructure({ domain, http });
  const previousDeveloper = detectPreviousDeveloper();
  const accessNeeded = buildAccessChecklist({ cloudflare, hosting, cms, email, emailSafety, dnsProvider, registrar: registrarDetails.name, marketing, operations });
  const actionPlan = buildActionPlan({
    registrar: registrarDetails.name,
    cloudflare,
    hosting,
    cms,
    email,
    emailSafety,
    connectedServices,
    marketing,
    dnsProvider,
    urlStructure,
    inputStatus,
    previousDeveloper,
  });
  const risks = buildRisks({ rdap, dns, http, cloudflare, hosting, email, emailSafety, urlStructure, inputStatus });
  const launchChecklist = buildLaunchChecklist({ urlStructure, hosting, cms, email, emailSafety, marketing, operations, dnsProvider, cloudflare });

  return {
    subject: domain.apex,
    inputStatus,
    registrar: registrarDetails.name,
    registrarDetails,
    dnsProvider,
    cloudflare,
    hosting,
    cms,
    email,
    emailSafety,
    connectedServices,
    marketing,
    operations,
    urlStructure,
    previousDeveloper,
    accessNeeded,
    actionPlan,
    risks,
    launchChecklist,
  };
}

function detectRegistrar({ rdap, dns }) {
  const rdapRegistrar = rdap.registrar?.name;
  if (rdapRegistrar) {
    return {
      name: rdapRegistrar,
      confidence: "High",
      source: "RDAP",
      note: "Registrar found from RDAP records.",
    };
  }

  const nameservers = [...(rdap.nameservers || []), ...(dns.nameservers || [])].join(" ").toLowerCase();
  const match = REGISTRAR_HINTS.find(([needle]) => nameservers.includes(needle));
  if (match) {
    return {
      name: `Likely ${match[1]}`,
      confidence: "Medium",
      source: "Nameserver inference",
      note: `RDAP did not return a registrar, but nameservers strongly suggest ${match[1]}. Confirm domain ownership and billing manually.`,
    };
  }

  return {
    name: "Unknown",
    confidence: "Manual",
    source: "Manual confirmation",
    note: "Registrar was not found in RDAP and could not be inferred confidently from nameservers.",
  };
}

function analyzeInputStatus({ domain, rdap, dns, http }) {
  const nameservers = dns.nameservers || [];
  const hostRecords = [
    ...(dns.addresses || []),
    ...(dns.ipv6Addresses || []),
    ...(dns.cnames || []),
  ];
  const rdapFailed = rdap.available === false;
  const noDnsAuthority = nameservers.length === 0;
  const noHostRecords = hostRecords.length === 0;
  const siteUnreachable = !http.reachable;
  const errors = [
    rdap.error,
    http.ssl?.error,
    ...(http.redirects || []).map((check) => check.error),
    ...Object.values(dns.errors || {}),
  ].filter(Boolean);
  const nameResolutionFailed = errors.some((error) => /ENOTFOUND|NXDOMAIN|not found|fetch failed/i.test(error));

  if (rdapFailed && noDnsAuthority && noHostRecords && siteUnreachable) {
    return {
      status: "Unresolved",
      confidence: nameResolutionFailed ? "High" : "Medium",
      summary: `No RDAP, DNS, or website records were found for ${domain.hostname}. Check exact spelling or confirm the domain is registered before onboarding.`,
    };
  }

  if (noDnsAuthority && noHostRecords && siteUnreachable) {
    return {
      status: "DNS/website unreachable",
      confidence: "Medium",
      summary: `FITFO could not find DNS authority or a reachable website for ${domain.hostname}. Confirm spelling and DNS status before planning launch work.`,
    };
  }

  return {
    status: "Looks resolvable",
    confidence: "Medium",
    summary: "Public records or website signals were found for this exact input.",
  };
}

function detectPreviousDeveloper() {
  return {
    contact: "Not publicly identifiable",
    confidence: "Manual",
    note: "Previous developer contact usually is not exposed in RDAP, DNS, or HTTP data. Ask the client for the person or agency that last managed the domain, DNS, hosting, or WordPress site.",
  };
}

function detectCloudflare({ rdap, dns, http }) {
  const nameservers = [...(rdap.nameservers || []), ...(dns.nameservers || [])].map((value) => value.toLowerCase());
  const headerSignals = Object.entries(http.headers || {})
    .filter(([key, value]) => key.startsWith("cf-") || /cloudflare/i.test(value))
    .map(([key, value]) => `${key}: ${value}`);

  const nsSignals = [...new Set(nameservers.filter((server) => server.includes("ns.cloudflare.com")))];

  if (nsSignals.length > 0) {
    return {
      status: "Yes",
      confidence: "High",
      signals: nsSignals.map((server) => `Cloudflare nameserver: ${server}`),
    };
  }

  if (headerSignals.length > 0) {
    return {
      status: "Likely",
      confidence: "Medium",
      signals: headerSignals,
    };
  }

  return {
    status: "No obvious Cloudflare",
    confidence: "Low",
    signals: [],
  };
}

function detectDnsProvider({ rdap, dns, cloudflare }) {
  if (cloudflare.status === "Yes") return "Cloudflare";

  const nameservers = [...(rdap.nameservers || []), ...(dns.nameservers || [])].join(" ").toLowerCase();
  const match = DNS_PROVIDER_HINTS.find(([needle]) => nameservers.includes(needle));
  return match ? match[1] : "Unknown";
}

function detectHosting({ dns, http, cloudflare }) {
  const evidence = buildHostingEvidence({ dns, http });
  const haystack = evidence.map((item) => item.value).join(" ").toLowerCase();
  const match = HOSTING_HINTS.find(([needle]) => haystack.includes(needle));

  if (match) {
    const matchedEvidence = evidence
      .filter((item) => String(item.value || "").toLowerCase().includes(match[0]))
      .map((item) => `${item.source}: ${item.value}`);

    return {
      provider: match[1],
      confidence: matchedEvidence.some((item) => /^CNAME|^HTTP|^PTR|^ASN/i.test(item)) ? "Medium" : "Low",
      note: "Detected from public DNS, HTTP, reverse DNS, or ASN/network hints.",
      evidence: matchedEvidence.length ? matchedEvidence : evidence.slice(0, 5).map((item) => `${item.source}: ${item.value}`),
      edge: cloudflare.status === "Yes" || cloudflare.status === "Likely" ? "Cloudflare/CDN may be in front of the origin." : "No obvious Cloudflare edge detected.",
    };
  }

  if (cloudflare.status === "Yes" || cloudflare.status === "Likely") {
    return {
      provider: "Hidden behind Cloudflare",
      confidence: "High",
      note: "Cloudflare is in front, so the origin host may not be publicly visible.",
      evidence: [
        ...(cloudflare.signals || []).map((signal) => `Cloudflare: ${signal}`),
        ...evidence.slice(0, 5).map((item) => `${item.source}: ${item.value}`),
      ],
      edge: "Cloudflare is the visible edge/proxy. Ask for origin hosting separately.",
    };
  }

  const networkEvidence = evidence.filter((item) => ["PTR", "ASN", "SOA", "CAA"].includes(item.source));

  return {
    provider: "Unknown",
    confidence: networkEvidence.length ? "Manual" : "Low",
    note: networkEvidence.length
      ? "Public DNS/network clues were found, but none matched a known hosting provider confidently."
      : "No clear hosting fingerprint found.",
    evidence: networkEvidence.slice(0, 6).map((item) => `${item.source}: ${item.value}`),
    edge: "No obvious CDN/proxy edge detected.",
  };
}

function buildHostingEvidence({ dns, http }) {
  const headerKeys = [
    "server",
    "x-powered-by",
    "x-served-by",
    "x-hosted-by",
    "x-pantheon-styx-hostname",
    "x-acquia-application-uuid",
    "x-cache",
    "via",
  ];
  const evidence = [
    ...(dns.cnames || []).map((value) => ({ source: "CNAME", value })),
    ...(dns.soa || []).map((value) => ({ source: "SOA", value })),
    ...(dns.caa || []).map((value) => ({ source: "CAA", value })),
    ...(dns.nameservers || []).map((value) => ({ source: "Nameserver", value })),
    ...(dns.ipInsights || []).flatMap((item) => [
      ...(item.reverseDns || []).map((value) => ({ source: "PTR", value: `${item.address} -> ${value}` })),
      item.asn ? { source: "ASN", value: `${item.address} -> AS${item.asn.asn} ${item.asn.name || ""} ${item.asn.route || ""}`.trim() } : null,
    ].filter(Boolean)),
    http.finalUrl ? { source: "Final URL", value: http.finalUrl } : null,
    ...headerKeys.flatMap((key) => http.headers?.[key] ? [{ source: `HTTP ${key}`, value: http.headers[key] }] : []),
  ].filter(Boolean);

  return evidence.filter((item, index, rows) => (
    rows.findIndex((candidate) => candidate.source === item.source && candidate.value === item.value) === index
  ));
}

function detectEmail(dns) {
  const mxValues = (dns.mx || []).map((record) => record.exchange).join(" ").toLowerCase();
  if (mxValues.includes("null mx")) {
    return {
      provider: "No mail configured",
      mx: dns.mx || [],
    };
  }

  const match = EMAIL_HINTS.find(([needle]) => mxValues.includes(needle));

  return {
    provider: match ? match[1] : "Unknown",
    mx: dns.mx || [],
  };
}

function analyzeEmailSafety(dns, email) {
  const hasMx = (dns.mx || []).length > 0 && email.provider !== "No mail configured";
  const spf = dns.spf || (dns.txt || []).find((value) => /^v=spf1\b/i.test(value)) || null;
  const dmarc = dns.dmarc || null;
  const dmarcPolicy = parseDmarcPolicy(dmarc);
  const senderServices = detectEmailSenderServices(dns);

  let riskLevel = "Manual";
  const warnings = [];

  if (email.provider === "No mail configured") {
    riskLevel = "Low";
  } else if (!hasMx) {
    riskLevel = "Manual";
    warnings.push("No MX records were detected. Confirm whether the domain should receive email before DNS changes.");
  } else if (!spf || !dmarc) {
    riskLevel = "High";
    if (!spf) warnings.push("MX records exist but no SPF record was detected.");
    if (!dmarc) warnings.push("MX records exist but no DMARC record was detected.");
  } else if (dmarcPolicy === "none") {
    riskLevel = "Medium";
    warnings.push("DMARC policy is p=none, which is monitoring only.");
  } else {
    riskLevel = "Low";
  }

  return {
    provider: email.provider,
    riskLevel,
    hasMx,
    spf: {
      present: Boolean(spf),
      value: spf,
      summary: spf ? "Detected" : "Not detected",
    },
    dmarc: {
      present: Boolean(dmarc),
      value: dmarc,
      policy: dmarcPolicy || "Unknown",
      summary: dmarc ? `Detected${dmarcPolicy ? ` (${dmarcPolicy})` : ""}` : "Not detected",
    },
    dkim: {
      summary: "Confirm selectors manually",
      note: "DKIM selectors are usually not publicly enumerable without knowing the sender platform.",
    },
    senderServices,
    warnings,
    summary: buildEmailSafetySummary({ email, hasMx, spf, dmarc, dmarcPolicy, senderServices }),
    checklist: buildEmailSafetyChecklist({ email, hasMx, spf, dmarc, dmarcPolicy, senderServices }),
  };
}

function parseDmarcPolicy(dmarc) {
  if (!dmarc) return null;
  const match = dmarc.match(/(?:^|;)\s*p\s*=\s*(none|quarantine|reject)\b/i);
  return match ? match[1].toLowerCase() : null;
}

function detectEmailSenderServices(dns) {
  const records = [
    dns.spf || "",
    dns.dmarc || "",
    ...(dns.txt || []),
    ...(dns.mx || []).map((record) => record.exchange),
    ...(dns.cnames || []),
  ].join("\n").toLowerCase();

  const services = EMAIL_SENDER_HINTS
    .filter(([needle]) => records.includes(needle.toLowerCase()))
    .map(([, service]) => service);

  return [...new Set(services)].sort();
}

function buildEmailSafetySummary({ email, hasMx, spf, dmarc, dmarcPolicy, senderServices }) {
  if (email.provider === "No mail configured") {
    return "MX records indicate mail is intentionally not configured. Confirm this before changing DNS.";
  }

  if (!hasMx) {
    return "No MX records were detected. Confirm whether this domain should receive email.";
  }

  const provider = email.provider === "Unknown" ? "email" : email.provider;
  const senders = senderServices.length ? ` Sender clues: ${senderServices.join(", ")}.` : "";
  const dmarcNote = dmarc && dmarcPolicy ? ` DMARC policy is ${dmarcPolicy}.` : "";
  const missing = [
    spf ? null : "SPF",
    dmarc ? null : "DMARC",
  ].filter(Boolean);

  if (missing.length) {
    return `${provider} has MX records, but ${missing.join(" and ")} ${missing.length === 1 ? "was" : "were"} not detected. Preserve existing mail records and confirm sender platforms before launch.${senders}`;
  }

  return `${provider} has MX, SPF, and DMARC records. Preserve MX, SPF, DKIM, and DMARC during DNS changes.${dmarcNote}${senders}`;
}

function buildEmailSafetyChecklist({ email, hasMx, spf, dmarc, dmarcPolicy, senderServices }) {
  const checklist = [];

  if (email.provider === "No mail configured") {
    return [
      "Confirm the domain is not supposed to receive or send email.",
      "Preserve any intentional Null MX record during DNS changes.",
    ];
  }

  if (!hasMx) {
    checklist.push("Confirm whether this domain should receive email.");
  } else {
    checklist.push("Export current MX records before changing nameservers or DNS.");
  }

  checklist.push(spf ? "Preserve the current SPF record exactly unless sender platforms change." : "Ask which platforms send email for this domain, then create or preserve SPF.");
  checklist.push(dmarc ? `Preserve the current DMARC record${dmarcPolicy ? ` with p=${dmarcPolicy}` : ""}.` : "Ask whether DMARC should be added before or after launch.");
  checklist.push("Confirm DKIM selectors for Google/Microsoft, CRM, form, email marketing, and transactional senders.");

  if (senderServices.length) {
    checklist.push(`Confirm access or owner for sender platforms: ${senderServices.join(", ")}.`);
  } else {
    checklist.push("Ask whether forms, CRM, newsletters, invoices, or booking tools send email from this domain.");
  }

  checklist.push("Do not change nameservers until email ownership and rollback path are clear.");
  return checklist;
}

function detectConnectedServices(dns) {
  const records = [
    ...(dns.mx || []).map((record) => record.exchange),
    ...(dns.txt || []),
    ...(dns.cnames || []),
    ...(dns.caa || []),
  ];

  const haystack = records.join("\n");
  const services = [];

  for (const [needle, service] of CONNECTED_SERVICE_HINTS) {
    if (haystack.toLowerCase().includes(needle.toLowerCase())) {
      services.push(service);
    }
  }

  return [...new Set(services)].sort();
}

function detectMarketingStack(http) {
  const html = http.htmlSample || "";
  const headers = http.headers || {};
  const found = [];

  const checks = [
    [/googletagmanager\.com\/gtm\.js|GTM-[A-Z0-9]+/i, "Google Tag Manager"],
    [/googletagmanager\.com\/gtag\/js|G-[A-Z0-9]+/i, "Google Analytics / GA4"],
    [/googleadservices\.com|AW-[A-Z0-9]+/i, "Google Ads"],
    [/connect\.facebook\.net|fbq\(/i, "Meta Pixel"],
    [/hubspot|hs-scripts|js\.hsforms\.net/i, "HubSpot"],
    [/callrail|cdn\.callrail\.com/i, "CallRail"],
    [/klaviyo/i, "Klaviyo"],
    [/mailchimp|mc\.us\d+\.list-manage\.com/i, "Mailchimp"],
    [/calendly/i, "Calendly"],
    [/gravityforms|gform_/i, "Gravity Forms"],
    [/wpforms/i, "WPForms"],
  ];

  for (const [pattern, service] of checks) {
    if (pattern.test(html) || pattern.test(JSON.stringify(headers))) {
      found.push(service);
    }
  }

  return {
    found: [...new Set(found)].sort(),
    requiredAccess: [
      "Google Analytics / GA4",
      "Google Search Console",
      "Google Tag Manager",
      "Google Ads, if campaigns are running",
      "Google Business Profile, if local SEO matters",
      "Meta Business Manager / Pixel, if social ads or tracking are used",
      "Call tracking, CRM, form, booking, and email marketing tools detected or used",
    ],
  };
}

function detectOperationsStack({ dns, http }) {
  const haystack = [
    http.htmlSample || "",
    JSON.stringify(http.headers || {}),
    ...(dns.txt || []),
    ...(dns.cnames || []),
  ].join("\n");
  const found = [];

  for (const [pattern, service] of OPERATIONS_HINTS) {
    if (pattern.test(haystack)) {
      found.push(service);
    }
  }

  return {
    found: [...new Set(found)].sort(),
    requiredAccess: [
      "CRM or field-service platform admin access, if one exists",
      "Lead source and form routing settings",
      "Call tracking numbers and booking widgets",
      "Pipeline, estimate, dispatch, and notification owners",
    ],
  };
}

function analyzeUrlStructure({ domain, http }) {
  const profile = http.urlStructure || {};
  const preferredHost = profile.preferredHost || safeHost(http.finalUrl);
  const preferredProtocol = profile.preferredProtocol || safeProtocol(http.finalUrl);
  const isWww = typeof profile.www === "boolean" ? profile.www : preferredHost ? preferredHost.startsWith("www.") : null;
  const recommendation = profile.recommendation || buildFallbackUrlRecommendation(domain.apex, preferredHost, preferredProtocol);

  return {
    preferredHost: preferredHost || "Unknown",
    preferredProtocol: preferredProtocol ? preferredProtocol.replace(":", "").toUpperCase() : "Unknown",
    canonicalStyle: isWww === null ? "Unknown" : isWww ? "www" : "apex/non-www",
    recommendation,
    issues: profile.issues || [],
  };
}

function detectCms(http) {
  if (http.wordpress?.likely) {
    return {
      platform: "WordPress",
      confidence: "Medium",
      signals: http.wordpress.signals,
    };
  }

  const html = http.htmlSample || "";
  const headers = http.headers || {};
  const metaGenerator = http.metaGenerator || "";
  const haystack = [html, JSON.stringify(headers), metaGenerator, http.finalUrl || ""].join("\n");
  const checks = [
    {
      platform: "Shopify",
      pattern: /cdn\.shopify\.com|myshopify\.com|x-shopid|x-shopify-stage|Shopify/i,
      signal: "Shopify storefront clues",
    },
    {
      platform: "Webflow",
      pattern: /webflow\.js|data-wf-page|webflow\.io|x-webflow-page-id|Webflow/i,
      signal: "Webflow page clues",
    },
    {
      platform: "Wix",
      pattern: /wixstatic\.com|wix\.com|x-wix-request-id|x-seen-by|Wix\.com Website Builder/i,
      signal: "Wix site clues",
    },
    {
      platform: "Squarespace",
      pattern: /static\.squarespace\.com|squarespace-cdn|squarespace\.com|Squarespace/i,
      signal: "Squarespace site clues",
    },
  ];
  const match = checks.find((check) => check.pattern.test(haystack));

  if (match) {
    return {
      platform: match.platform,
      confidence: "Medium",
      signals: [match.signal],
    };
  }

  return {
    platform: "Unknown",
    confidence: "Low",
    signals: [],
  };
}

function buildAccessChecklist({ cloudflare, hosting, cms, email, emailSafety, dnsProvider, registrar, marketing, operations }) {
  const items = [];
  const registrarName = handoffName(registrar, "domain registrar");

  items.push({
    item: `${registrarName} access`,
    reason: "Needed for ownership, renewals, nameserver changes, transfer lock checks, and billing continuity.",
  });

  if (dnsProvider === "Cloudflare" || cloudflare.status === "Yes") {
    items.push({
      item: "Cloudflare access",
      reason: "Needed to review DNS, proxy settings, page rules, SSL/TLS, redirects, and origin configuration.",
    });
  } else if (cloudflare.status === "Likely") {
    items.push({
      item: "Cloudflare/CDN confirmation",
      reason: "Cloudflare headers were detected, but nameservers are not Cloudflare. This may be a host-managed CDN rather than a client-owned Cloudflare account.",
    });
  } else {
    const dnsAccessName = dnsProvider === "Unknown" ? "DNS provider" : `${dnsProvider} DNS`;
    items.push({
      item: `${dnsAccessName} access`,
      reason: "Needed to review and safely update DNS records.",
    });
  }

  if (hosting.provider === "Hidden behind Cloudflare" || hosting.provider === "Unknown") {
    items.push({
      item: "Hosting provider confirmation",
      reason: "The public scan could not confidently identify the origin host.",
    });
  } else {
    items.push({
      item: `${hosting.provider} hosting access`,
      reason: "Needed for files, backups, server settings, and deployment control.",
    });
  }

  if (cms.platform === "WordPress") {
    items.push({
      item: "WordPress administrator access",
      reason: "Needed to audit users, plugins, theme, updates, backups, and site health.",
    });
  }

  if (email.provider !== "Unknown" && email.provider !== "No mail configured") {
    items.push({
      item: `${email.provider} admin access or DNS coordination`,
      reason: "Needed before changing DNS records that could affect email delivery.",
    });
  } else if (emailSafety?.hasMx || emailSafety?.riskLevel === "High") {
    items.push({
      item: "Email/DNS safety review",
      reason: "Needed because email records exist but ownership or SPF/DMARC status needs confirmation before DNS changes.",
    });
  }

  items.push({
    item: "Analytics and marketing access",
    reason: `Needed for GA4, Search Console, Tag Manager, ad pixels, call tracking, forms, CRM, and campaign measurement.${marketing.found.length ? ` Detected: ${marketing.found.join(", ")}.` : ""}`,
  });

  items.push({
    item: "CRM / booking / field-service access",
    reason: `Needed to confirm where leads go after form fills, calls, bookings, and quote requests.${operations.found.length ? ` Detected: ${operations.found.join(", ")}.` : ""}`,
  });

  items.push({
    item: "Previous developer contact",
    reason: "Useful if hosting, DNS, or origin details are hidden or owned by a third party.",
  });

  return items;
}

function buildActionPlan({ registrar, cloudflare, hosting, cms, email, emailSafety, dnsProvider, urlStructure, inputStatus }) {
  const actions = [];
  const registrarName = handoffName(registrar, "domain registrar");

  if (inputStatus?.status === "Unresolved") {
    actions.push({
      label: "Check exact domain spelling",
      detail: inputStatus.summary,
    });
  }

  actions.push({
    label: `Track down ${registrarName}`,
    detail: `Ask the client who has the ${registrarName} login, billing ownership, or delegated account access.`,
  });

  if (cloudflare.status === "Yes" || dnsProvider === "Cloudflare") {
    actions.push({
      label: "Track down Cloudflare",
      detail: "The nameservers indicate Cloudflare is controlling DNS. Ask who owns the Cloudflare account and request admin access or a delegated invite.",
    });
  } else if (cloudflare.status === "Likely") {
    actions.push({
      label: "Confirm Cloudflare/CDN layer",
      detail: "Cloudflare response headers were detected, but nameservers do not point to Cloudflare. Ask whether this is host-managed CDN/security, such as a WP Engine edge layer, instead of a separate Cloudflare account.",
    });
  } else {
    actions.push({
      label: `Track down ${dnsProvider === "Unknown" ? "DNS provider" : dnsProvider}`,
      detail: "Ask the client or previous developer who controls DNS records before making any website or email changes.",
    });
  }

  if (hosting.provider === "Hidden behind Cloudflare") {
    actions.push({
      label: "Ask previous developer for origin hosting",
      detail: "Cloudflare is hiding the real server. Ask the previous developer which host serves the site and how access should be transferred.",
    });
  } else if (hosting.provider === "Unknown") {
    actions.push({
      label: "Confirm hosting provider",
      detail: "FITFO could not identify hosting confidently. Ask the client or previous developer where the website files, backups, and server are managed.",
    });
  } else {
    actions.push({
      label: `Track down ${hosting.provider} hosting`,
      detail: `Ask for ${hosting.provider} account access, a collaborator invite, or a clean handoff from the previous developer.`,
    });
  }

  if (urlStructure?.preferredHost && urlStructure.preferredHost !== "Unknown") {
    actions.push({
      label: `Confirm ${urlStructure.canonicalStyle} launch URL`,
      detail: `${urlStructure.recommendation} Confirm this before redesign launch, Search Console setup, sitemap submission, redirects, and analytics filters.`,
    });
  }

  if (cms.platform === "WordPress") {
    actions.push({
      label: "Get WordPress administrator access",
      detail: "Ask for a new admin user, not a shared password, so you can audit users, plugins, theme, backups, and updates.",
    });
  }

  if (email.provider === "Unknown") {
    actions.push({
      label: "Clarify email provider",
      detail: "Email records were not enough to identify the provider. Ask what service handles mail before touching DNS.",
    });
  } else if (email.provider !== "No mail configured") {
    actions.push({
      label: `Protect ${email.provider} email`,
      detail: emailSafety?.summary || `DNS records indicate ${email.provider}. Document MX, SPF, DKIM, and DMARC before changing nameservers or DNS.`,
    });
  }

  actions.push({
    label: "Inventory DNS-dependent services",
    detail: "Before changing DNS or nameservers, document MX, SPF, DKIM selectors you know about, DMARC, verification TXT records, CNAMEs, and marketing/email platform records.",
  });

  if (dnsProvider !== "Unknown") {
    actions.push({
      label: "Review active subdomains",
      detail: "FITFO checks common subdomains, but DNS access is needed to confirm all active records and avoid missing staging, portals, shops, mail, or booking tools.",
    });
  }

  actions.push({
    label: "Get previous developer contact",
    detail: "Ask the client for the person or agency that last managed the site, DNS, hosting, Cloudflare, or WordPress.",
  });

  return actions;
}

function buildRisks({ rdap, dns, http, cloudflare, hosting, email, emailSafety, urlStructure, inputStatus }) {
  const risks = [];

  if (inputStatus?.status === "Unresolved") {
    risks.push(inputStatus.summary);
  }

  if (!rdap.available) {
    risks.push("RDAP lookup failed, so registrar details need manual verification.");
  }

  for (const warning of emailSafety?.warnings || []) {
    risks.push(warning);
  }

  if (dns.nameservers.length === 0) {
    risks.push("No nameservers were detected, so DNS authority needs manual verification.");
  }

  if (dns.subdomains?.length > 0) {
    risks.push(`${dns.subdomains.length} common subdomain(s) resolved. Verify whether they are active client properties before changing DNS or hosting.`);
  }

  if (!http.reachable) {
    risks.push("Website did not respond over HTTP or HTTPS during the scan.");
  }

  if (http.ssl?.available === false) {
    risks.push(`TLS certificate was not readable over port 443${http.ssl.error ? `: ${http.ssl.error}` : "."}`);
  } else if (http.ssl?.valid === false) {
    risks.push(`TLS certificate was not trusted${http.ssl.authorizationError ? `: ${http.ssl.authorizationError}` : "."}`);
  }

  if (typeof http.ssl?.daysRemaining === "number" && http.ssl.daysRemaining < 30) {
    risks.push(`TLS certificate expires in ${http.ssl.daysRemaining} day(s). Confirm renewal ownership before launch or migration work.`);
  }

  const httpCheck = (http.redirects || []).find((check) => check.startUrl?.startsWith("http://"));
  if (httpCheck?.reachable && httpCheck.finalUrl?.startsWith("http://")) {
    risks.push("HTTP does not appear to redirect to HTTPS. Confirm SSL redirect behavior before launch.");
  }

  if (urlStructure?.canonicalStyle === "Unknown") {
    risks.push("Canonical URL style could not be identified. Confirm whether launch should use www or apex/non-www.");
  }

  for (const issue of urlStructure?.issues || []) {
    if (issue.severity === "High" || issue.severity === "Medium") {
      risks.push(`${issue.summary} ${issue.detail}`);
    }
  }

  if ((cloudflare.status === "Yes" || cloudflare.status === "Likely") && hosting.provider === "Hidden behind Cloudflare") {
    risks.push("Origin hosting is hidden behind Cloudflare and must be confirmed with account access.");
  }

  return risks;
}

function buildLaunchChecklist({ urlStructure, hosting, cms, email, emailSafety, marketing, operations, dnsProvider, cloudflare }) {
  return [
    {
      item: "Canonical host",
      detail: urlStructure?.recommendation || "Confirm whether the redesign launches on www or apex/non-www.",
    },
    {
      item: "Redirects",
      detail: buildRedirectChecklistDetail(urlStructure),
    },
    {
      item: "DNS cutover",
      detail: `Confirm TTLs, DNS owner${dnsProvider && dnsProvider !== "Unknown" ? ` at ${dnsProvider}` : ""}, rollback path, and whether Cloudflare/CDN settings are involved${cloudflare.status !== "No obvious Cloudflare" ? " before changing records" : ""}.`,
    },
    {
      item: "Hosting and backups",
      detail: `Confirm ${hosting.provider === "Unknown" ? "hosting" : hosting.provider} access, backups, deployment path, PHP/runtime settings, and emergency restore ownership.`,
    },
    {
      item: "CMS launch state",
      detail: cms.platform === "WordPress"
        ? "Confirm admin users, plugins, theme, forms, permalinks, caching, redirects, and update/backups before launch."
        : "Confirm CMS owner, admin access, redirects, forms, and deployment process before launch.",
    },
    {
      item: "Email safety",
      detail: email.provider === "No mail configured"
        ? "Confirm the domain truly does not send or receive mail before DNS changes."
        : emailSafety?.summary || `Preserve ${email.provider === "Unknown" ? "email" : email.provider} MX, SPF, DKIM, and DMARC records during DNS changes.`,
    },
    {
      item: "Tracking and CRM",
      detail: `Reinstall/verify GA4, GTM, Search Console, call tracking, form routing, pixels, and CRM/booking tools${[...marketing.found, ...operations.found].length ? ` (${[...marketing.found, ...operations.found].join(", ")})` : ""}.`,
    },
    {
      item: "Post-launch QA",
      detail: "Check homepage, key service pages, forms, phone links, thank-you pages, sitemap, robots.txt, indexability, speed, and 404s.",
    },
  ];
}

function buildRedirectChecklistDetail(urlStructure = {}) {
  const issues = urlStructure.issues || [];
  if (!issues.length) {
    return "Map old URLs, preserve important paths, force HTTPS, and redirect the non-primary host to the primary host.";
  }

  const summaries = issues
    .filter((issue) => issue.severity === "High" || issue.severity === "Medium")
    .map((issue) => issue.summary);

  if (!summaries.length) {
    return "Map old URLs, preserve important paths, force HTTPS, and redirect the non-primary host to the primary host.";
  }

  return `${summaries.slice(0, 3).join(" ")} Map old URLs, force HTTPS, and make apex/www variants converge on the confirmed canonical host.`;
}

function knownOrFallback(value, fallback) {
  return value && value !== "Unknown" ? value : fallback;
}

function handoffName(value, fallback) {
  if (!value || value === "Unknown") return fallback;
  return String(value).replace(/^Likely\s+/i, "");
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

function buildFallbackUrlRecommendation(apex, preferredHost, preferredProtocol) {
  if (!preferredHost) {
    return "No reachable canonical URL was detected. Confirm launch host manually.";
  }

  const hostLabel = preferredHost === apex ? "apex/non-www" : preferredHost === `www.${apex}` ? "www" : preferredHost;
  const protocolLabel = preferredProtocol === "https:" ? "HTTPS" : "HTTP";
  return `Likely primary launch URL is ${protocolLabel} on ${hostLabel}. Preserve this choice unless the client intentionally wants to change canonical host.`;
}
