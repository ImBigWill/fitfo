export function buildInfrastructureSnapshot(scan) {
  const analysis = scan.analysis || {};
  const dns = scan.dns || {};
  const registrar = analysis.registrar || "Unknown";
  const registrarDetails = analysis.registrarDetails || {};
  const dnsProvider = analysis.dnsProvider || "Unknown";
  const hosting = analysis.hosting || {};
  const cms = analysis.cms || {};
  const email = analysis.email || {};
  const nameservers = dns.nameservers || [];

  return [
    {
      area: "Registrar / Domain Provider",
      finding: registrar,
      confidence: registrarDetails.confidence || confidenceForValue(registrar),
      clientNeed: registrar === "Unknown"
        ? "Client must confirm who owns the domain account and provide registrar login, billing owner, or delegated access."
        : `Client must provide ${stripLikely(registrar)} login, billing owner, transfer-lock status, or delegated registrar access.`,
    },
    {
      area: "DNS / Nameservers",
      finding: dnsProvider === "Unknown"
        ? nameservers.length ? `Unknown provider (${nameservers.join(", ")})` : "Unknown"
        : `${dnsProvider}${nameservers.length ? ` (${nameservers.join(", ")})` : ""}`,
      confidence: confidenceForValue(dnsProvider),
      clientNeed: dnsProvider === "Unknown"
        ? "Client or previous developer must confirm who controls DNS before any website, email, or launch changes."
        : `Client must provide ${dnsProvider} DNS access or confirm who can safely edit records.`,
    },
    {
      area: "Cloudflare",
      finding: plainCloudflareStatus(scan),
      confidence: analysis.cloudflare?.confidence || "Manual",
      clientNeed: cloudflareClientNeed(scan),
    },
    {
      area: "Hosting / Website Files",
      finding: hosting.provider || "Unknown",
      confidence: hosting.confidence || confidenceForValue(hosting.provider),
      clientNeed: hosting.provider && hosting.provider !== "Unknown" && hosting.provider !== "Hidden behind Cloudflare"
        ? `Client must provide ${hosting.provider} hosting access, collaborator invite, backups, deployment path, and billing owner. Public evidence: ${formatFound(hosting.evidence)}.`
        : `Client or previous developer must confirm where the website files, backups, server, and deployment path live. Public evidence: ${formatFound(hosting.evidence)}.`,
    },
    {
      area: "CMS / Website Admin",
      finding: cms.platform || "Unknown",
      confidence: cms.confidence || confidenceForValue(cms.platform),
      clientNeed: cms.platform && cms.platform !== "Unknown"
        ? `Client must provide ${cms.platform} administrator access and identify who manages updates, forms, and plugins.`
        : "Client must confirm whether there is a CMS, admin login, staging site, or previous developer-managed account.",
    },
    {
      area: "Email",
      finding: email.provider || "Unknown",
      confidence: email.provider && email.provider !== "Unknown" ? "Medium" : "Manual",
      clientNeed: email.provider && email.provider !== "Unknown"
        ? `Client must confirm ${email.provider} admin ownership or who approves MX, SPF, DKIM, and DMARC changes.`
        : "Client must confirm email provider before DNS changes so mail is not disrupted.",
    },
  ];
}

export function buildLoginChecklist(scan) {
  const analysis = scan.analysis || {};
  const registrar = stripLikely(analysis.registrar || "domain registrar");
  const dnsProvider = analysis.dnsProvider || "DNS provider";
  const hosting = analysis.hosting?.provider || "hosting provider";
  const cms = analysis.cms?.platform || "CMS";
  const email = analysis.email?.provider || "email provider";
  const cloudflareNeeded = isCloudflareInUse(scan);

  const rows = [
    {
      access: "Domain registrar",
      status: analysis.registrar && analysis.registrar !== "Unknown" ? registrar : "Unknown",
      needed: `Get ${registrar} login, owner invite, billing contact, renewal status, and transfer-lock status.`,
    },
    {
      access: "DNS / nameserver control",
      status: dnsProvider,
      needed: dnsProvider === "Unknown"
        ? "Find who can edit DNS records before launch, email, or tracking changes."
        : `Get ${dnsProvider} DNS access or identify the person who will make DNS changes.`,
    },
    {
      access: "Cloudflare",
      status: plainCloudflareStatus(scan),
      needed: cloudflareNeeded
        ? "Get Cloudflare account access, delegated admin invite, or owner contact. Confirm redirects, SSL, WAF, page rules, workers, and DNS records."
        : "No obvious Cloudflare login is required from public records. Still ask if any private Cloudflare account or host-managed CDN exists.",
    },
    {
      access: "Hosting",
      status: hosting,
      needed: hosting !== "Unknown" && hosting !== "Hidden behind Cloudflare"
        ? `Get ${hosting} hosting access, backups, deployment notes, SFTP/SSH or dashboard access, and billing owner.`
        : "Find the actual host, backup owner, deployment process, and emergency restore contact.",
    },
    {
      access: "Website admin / CMS",
      status: cms,
      needed: cms !== "Unknown"
        ? `Get ${cms} administrator access and confirm plugin/theme/update/form ownership.`
        : "Confirm CMS, admin login, staging access, and who last managed the website.",
    },
    {
      access: "Email",
      status: email,
      needed: email === "No mail configured"
        ? "Confirm the domain truly does not send or receive email, and preserve intentional Null MX or no-mail DNS records."
        : email !== "Unknown"
        ? `Confirm ${email} admin owner and preserve MX, SPF, DKIM, and DMARC records.`
        : "Identify the email provider before touching DNS.",
    },
    {
      access: "Analytics / Search / Marketing",
      status: formatFound(analysis.marketing?.found),
      needed: "Get GA4, Search Console, Tag Manager, ads, pixels, call tracking, form, and reporting access where applicable.",
    },
    {
      access: "CRM / Booking / Operations",
      status: formatFound(analysis.operations?.found),
      needed: "Get CRM, booking, field-service, call-routing, form-routing, pipeline, and notification owner access where applicable.",
    },
    {
      access: "Previous developer",
      status: "Not publicly identifiable",
      needed: "Ask who last managed domain, DNS, hosting, Cloudflare, WordPress/CMS, forms, tracking, and launch notes.",
    },
  ];

  return rows;
}

export function buildConfidenceExplanations(scan) {
  const analysis = scan.analysis || {};
  const dns = scan.dns || {};
  const rdap = scan.rdap || {};
  const http = scan.http || {};
  const hosting = analysis.hosting || {};

  return [
    {
      area: "Registrar",
      finding: analysis.registrar || "Unknown",
      confidence: analysis.registrarDetails?.confidence || confidenceForValue(analysis.registrar),
      evidence: analysis.registrar === "Unknown"
        ? "RDAP/WHOIS-style lookup did not return a usable registrar."
        : analysis.registrarDetails?.note || `Public domain records identify ${analysis.registrar}.`,
      clientFollowUp: analysis.registrar === "Unknown"
        ? "Ask the client who pays for the domain renewal or who can log in to the registrar."
        : `Ask for ${stripLikely(analysis.registrar)} owner/admin access or a delegated invite.`,
    },
    {
      area: "DNS",
      finding: analysis.dnsProvider || "Unknown",
      confidence: confidenceForValue(analysis.dnsProvider),
      evidence: dns.nameservers?.length
        ? `Nameservers: ${dns.nameservers.join(", ")}.`
        : "No nameservers were detected in the public DNS pass.",
      clientFollowUp: "Confirm who can export and edit the full DNS zone before launch planning.",
    },
    {
      area: "Cloudflare",
      finding: plainCloudflareStatus(scan),
      confidence: analysis.cloudflare?.confidence || "Manual",
      evidence: formatFound(analysis.cloudflare?.signals),
      clientFollowUp: cloudflareClientNeed(scan),
    },
    {
      area: "Hosting",
      finding: hosting.provider || "Unknown",
      confidence: hosting.confidence || confidenceForValue(hosting.provider),
      evidence: formatFound(hosting.evidence),
      clientFollowUp: hosting.provider && hosting.provider !== "Unknown" && hosting.provider !== "Hidden behind Cloudflare"
        ? `Confirm ${hosting.provider} account ownership, backups, deployment process, and billing owner.`
        : "Ask the client or previous developer where the origin site files, backups, and deployment process live.",
    },
    {
      area: "Launch URL",
      finding: analysis.urlStructure?.canonicalStyle || "Unknown",
      confidence: analysis.urlStructure?.canonicalStyle === "Unknown" ? "Manual" : "Medium",
      evidence: http.finalUrl ? `Final reachable URL: ${http.finalUrl}.` : "No reachable canonical URL was detected.",
      clientFollowUp: analysis.urlStructure?.recommendation || "Confirm whether launch should use www or apex/non-www.",
    },
    {
      area: "CMS",
      finding: analysis.cms?.platform || "Unknown",
      confidence: analysis.cms?.confidence || confidenceForValue(analysis.cms?.platform),
      evidence: formatFound(analysis.cms?.signals),
      clientFollowUp: analysis.cms?.platform && analysis.cms.platform !== "Unknown"
        ? `Get ${analysis.cms.platform} admin access and confirm update, plugin, forms, and backup ownership.`
        : "Confirm whether there is a CMS, staging environment, or developer-managed admin account.",
    },
    {
      area: "Email",
      finding: analysis.email?.provider || "Unknown",
      confidence: analysis.email?.provider && analysis.email.provider !== "Unknown" ? "Medium" : "Manual",
      evidence: dns.mx?.length
        ? `MX records: ${dns.mx.map((record) => `${record.priority} ${record.exchange}`).join(", ")}.`
        : "No MX records were detected.",
      clientFollowUp: "Confirm email admin owner and preserve MX, SPF, DKIM, and DMARC before DNS changes.",
    },
    {
      area: "Previous Developer",
      finding: "Not publicly identifiable",
      confidence: "Manual",
      evidence: rdap.entities?.length ? "RDAP may list registrar/registry entities, but not the prior web developer." : "Public records generally do not expose the prior developer.",
      clientFollowUp: "Ask the client who last managed domain, DNS, hosting, CMS, forms, tracking, and launch notes.",
    },
  ];
}

export function buildClientAccessRequests(scan) {
  return buildLoginChecklist(scan).map((item) => ({
    access: item.access,
    status: item.status,
    request: item.needed,
  }));
}

export function buildDoNotTouchWarnings(scan) {
  const analysis = scan.analysis || {};
  const dns = scan.dns || {};
  const warnings = [
    {
      area: "DNS zone",
      warning: "Do not change nameservers or delete records until the full DNS zone is documented.",
      reason: "Website, email, verification, tracking, booking, and CRM services may depend on records that are easy to miss.",
    },
    {
      area: "Email",
      warning: "Do not change MX, SPF, DKIM, or DMARC until the email provider and sender platforms are confirmed.",
      reason: analysis.emailSafety?.summary || "Email continuity depends on DNS records that may not be obvious to the client.",
    },
    {
      area: "Lead tracking",
      warning: "Do not remove call tracking, forms, booking widgets, thank-you pages, or tracking scripts until lead routing is confirmed.",
      reason: "Trades clients often rely on phone attribution, CRM routing, and hidden form notifications.",
    },
    {
      area: "Canonical host",
      warning: "Do not launch on www or apex/non-www until current redirects and Search Console expectations are confirmed.",
      reason: analysis.urlStructure?.recommendation || "Canonical host was not confidently detected.",
    },
  ];

  if (plainCloudflareStatus(scan).startsWith("Yes") || plainCloudflareStatus(scan).startsWith("Likely")) {
    warnings.push({
      area: "Cloudflare / CDN",
      warning: "Do not bypass or disable Cloudflare/CDN settings until redirects, SSL, WAF, workers, and DNS records are reviewed.",
      reason: "Cloudflare can hide origin hosting and contain launch-critical rules.",
    });
  }

  if (analysis.hosting?.provider === "Unknown" || analysis.hosting?.provider === "Hidden behind Cloudflare") {
    warnings.push({
      area: "Hosting origin",
      warning: "Do not migrate or point DNS until the real origin host, backups, and rollback path are known.",
      reason: "Public records did not confidently identify where the website files actually live.",
    });
  }

  if (dns.subdomains?.length) {
    warnings.push({
      area: "Subdomains",
      warning: "Do not remove or overwrite subdomain records until the client confirms what each one does.",
      reason: `${dns.subdomains.length} common subdomain(s) resolved during the scan.`,
    });
  }

  for (const warning of scan.wayback?.warnings || []) {
    warnings.push({
      area: "Archived site changes",
      warning: "Do not assume the current homepage preserved the previous lead/tracking setup.",
      reason: warning,
    });
  }

  return warnings;
}

export function plainCloudflareStatus(scan) {
  const analysis = scan.analysis || {};
  const cloudflare = analysis.cloudflare || {};

  if (cloudflare.status === "Yes" || analysis.dnsProvider === "Cloudflare") {
    return "Yes - Cloudflare is in use";
  }

  if (cloudflare.status === "Likely") {
    return "Likely - Cloudflare/CDN headers detected";
  }

  return "No - no obvious Cloudflare";
}

function cloudflareClientNeed(scan) {
  const status = plainCloudflareStatus(scan);
  if (status.startsWith("Yes")) {
    return "Client must provide Cloudflare owner/admin access or a delegated invite before DNS, SSL, redirect, WAF, worker, or launch changes.";
  }

  if (status.startsWith("Likely")) {
    return "Client must confirm whether this is a real Cloudflare account or host-managed CDN before requesting a login.";
  }

  return "No Cloudflare login is obvious from public records. Ask once, but prioritize registrar, DNS, and hosting access.";
}

function isCloudflareInUse(scan) {
  const analysis = scan.analysis || {};
  return analysis.dnsProvider === "Cloudflare" || ["Yes", "Likely"].includes(analysis.cloudflare?.status);
}

function confidenceForValue(value) {
  return value && value !== "Unknown" ? "Medium" : "Manual";
}

function stripLikely(value) {
  return String(value || "").replace(/^Likely\s+/i, "");
}

function formatFound(values) {
  return values?.length ? values.join(", ") : "None detected";
}
