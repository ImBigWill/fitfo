const HOSTING_HINTS = [
  ["wp engine", "WP Engine"],
  ["wpengine", "WP Engine"],
  ["flywheel", "Flywheel"],
  ["kinsta", "Kinsta"],
  ["pantheonsite", "Pantheon"],
  ["pantheon", "Pantheon"],
  ["acquia", "Acquia"],
  ["siteground", "SiteGround"],
  ["dreamhost", "DreamHost"],
  ["bluehost", "Bluehost"],
  ["hostgator", "HostGator"],
  ["godaddy", "GoDaddy"],
  ["squarespace", "Squarespace"],
  ["shopify", "Shopify"],
  ["myshopify", "Shopify"],
  ["webflow", "Webflow"],
  ["wixdns", "Wix"],
  ["wix", "Wix"],
  ["netlify", "Netlify"],
  ["vercel", "Vercel"],
];

const DNS_PROVIDER_HINTS = [
  ["domaincontrol.com", "GoDaddy"],
  ["godaddy", "GoDaddy"],
  ["registrar-servers.com", "Namecheap"],
  ["namecheaphosting.com", "Namecheap"],
  ["wixdns.net", "Wix"],
  ["squarespacedns.com", "Squarespace"],
  ["siteground.net", "SiteGround"],
  ["siteground", "SiteGround"],
  ["cloudflare.com", "Cloudflare"],
  ["dnsmadeeasy.com", "DNS Made Easy"],
  ["dnsimple.com", "DNSimple"],
  ["route53", "AWS Route 53"],
  ["awsdns", "AWS Route 53"],
  ["googledomains.com", "Google Domains"],
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
  ["secureserver.net", "GoDaddy Email"],
  ["ppe-hosted.com", "Proofpoint"],
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

export function analyzeProfile({ domain, rdap, dns, http }) {
  const cloudflare = detectCloudflare({ rdap, dns, http });
  const dnsProvider = detectDnsProvider({ rdap, dns, cloudflare });
  const hosting = detectHosting({ dns, http, cloudflare });
  const email = detectEmail(dns);
  const connectedServices = detectConnectedServices(dns);
  const cms = detectCms(http);
  const marketing = detectMarketingStack(http);
  const previousDeveloper = detectPreviousDeveloper();
  const accessNeeded = buildAccessChecklist({ cloudflare, hosting, cms, email, dnsProvider, registrar: rdap.registrar?.name, marketing });
  const actionPlan = buildActionPlan({
    registrar: rdap.registrar?.name,
    cloudflare,
    hosting,
    cms,
    email,
    connectedServices,
    marketing,
    dnsProvider,
    previousDeveloper,
  });
  const risks = buildRisks({ rdap, dns, http, cloudflare, hosting, email });

  return {
    subject: domain.apex,
    registrar: rdap.registrar?.name || "Unknown",
    dnsProvider,
    cloudflare,
    hosting,
    cms,
    email,
    connectedServices,
    marketing,
    previousDeveloper,
    accessNeeded,
    actionPlan,
    risks,
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
  const haystack = [
    ...(dns.cnames || []),
    ...(dns.nameservers || []),
    http.finalUrl || "",
    http.headers?.server || "",
    http.headers?.["x-powered-by"] || "",
    http.headers?.["x-served-by"] || "",
    http.headers?.["x-hosted-by"] || "",
    http.headers?.["x-pantheon-styx-hostname"] || "",
    http.headers?.["x-acquia-application-uuid"] || "",
  ]
    .join(" ")
    .toLowerCase();

  const match = HOSTING_HINTS.find(([needle]) => haystack.includes(needle));

  if (match) {
    return {
      provider: match[1],
      confidence: "Medium",
      note: "Detected from DNS or HTTP hints.",
    };
  }

  if (cloudflare.status === "Yes" || cloudflare.status === "Likely") {
    return {
      provider: "Hidden behind Cloudflare",
      confidence: "High",
      note: "Cloudflare is in front, so the origin host may not be publicly visible.",
    };
  }

  return {
    provider: "Unknown",
    confidence: "Low",
    note: "No clear hosting fingerprint found.",
  };
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

function detectCms(http) {
  if (http.wordpress?.likely) {
    return {
      platform: "WordPress",
      confidence: "Medium",
      signals: http.wordpress.signals,
    };
  }

  return {
    platform: "Unknown",
    confidence: "Low",
    signals: [],
  };
}

function buildAccessChecklist({ cloudflare, hosting, cms, email, dnsProvider, registrar, marketing }) {
  const items = [];
  const registrarName = registrar || "the domain registrar";

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
  }

  items.push({
    item: "Analytics and marketing access",
    reason: `Needed for GA4, Search Console, Tag Manager, ad pixels, call tracking, forms, CRM, and campaign measurement.${marketing.found.length ? ` Detected: ${marketing.found.join(", ")}.` : ""}`,
  });

  items.push({
    item: "Previous developer contact",
    reason: "Useful if hosting, DNS, or origin details are hidden or owned by a third party.",
  });

  return items;
}

function buildActionPlan({ registrar, cloudflare, hosting, cms, email, dnsProvider }) {
  const actions = [];
  const registrarName = registrar || "domain registrar";

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
      detail: `DNS records indicate ${email.provider}. Document MX, SPF, DKIM, and DMARC before changing nameservers or DNS.`,
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

function buildRisks({ rdap, dns, http, cloudflare, hosting, email }) {
  const risks = [];

  if (!rdap.available) {
    risks.push("RDAP lookup failed, so registrar details need manual verification.");
  }

  if (email.provider !== "No mail configured" && !dns.dmarc) {
    risks.push("No DMARC record detected for the scanned hostname.");
  }

  if (email.provider !== "No mail configured" && !dns.spf) {
    risks.push("No SPF record detected for the scanned hostname.");
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

  if ((cloudflare.status === "Yes" || cloudflare.status === "Likely") && hosting.provider === "Hidden behind Cloudflare") {
    risks.push("Origin hosting is hidden behind Cloudflare and must be confirmed with account access.");
  }

  return risks;
}
