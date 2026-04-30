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
    owner: ownerForAccess(item.access, item.status),
  }));
}

export function buildUnknownBlockers(scan) {
  const analysis = scan.analysis || {};
  const dns = scan.dns || {};
  const blockers = [];

  if (!analysis.registrar || analysis.registrar === "Unknown") {
    blockers.push(blocker("Domain ownership", "High", "Client", "Registrar is unknown.", "Find the registrar login, billing owner, or prior developer who controls the domain."));
  }

  if (!analysis.dnsProvider || analysis.dnsProvider === "Unknown") {
    blockers.push(blocker("DNS control", "High", "Client / Previous Developer", "DNS owner is unknown.", "Identify who can export and edit DNS before website, email, or launch work."));
  }

  if (isCloudflareInUse(scan)) {
    blockers.push(blocker("Cloudflare account", "High", "Client / Previous Developer", plainCloudflareStatus(scan), "Get Cloudflare owner/admin access or confirm it is host-managed only."));
  }

  if (!analysis.hosting?.provider || analysis.hosting.provider === "Unknown" || analysis.hosting.provider === "Hidden behind Cloudflare") {
    blockers.push(blocker("Origin hosting", "High", "Client / Previous Developer", analysis.hosting?.provider || "Hosting is unknown.", "Confirm where files, backups, deployment, and emergency restore access live."));
  }

  if (!analysis.urlStructure?.canonicalStyle || analysis.urlStructure.canonicalStyle === "Unknown") {
    blockers.push(blocker("Canonical launch URL", "Medium", "Us + Client", "FITFO could not confirm www vs apex/non-www.", "Confirm the intended launch host before redirects, Search Console, sitemap, and analytics setup."));
  }

  if (analysis.email?.provider === "Unknown" || analysis.emailSafety?.riskLevel === "High") {
    blockers.push(blocker("Email safety", "High", "Client", analysis.emailSafety?.summary || "Email provider is unclear.", "Confirm email provider and preserve MX, SPF, DKIM, and DMARC before DNS changes."));
  }

  if (analysis.cms?.platform === "Unknown") {
    blockers.push(blocker("Website admin", "Medium", "Client / Previous Developer", "CMS/admin system is unknown.", "Confirm CMS, admin login, staging access, and who last managed the website."));
  }

  if (!(analysis.marketing?.found || []).length) {
    blockers.push(blocker("Measurement access", "Medium", "Client", "No analytics or marketing tags were detected publicly.", "Confirm GA4, GTM, Search Console, ads, pixels, call tracking, and reporting access."));
  }

  if (!(analysis.operations?.found || []).length) {
    blockers.push(blocker("Lead routing / CRM", "Medium", "Client", "No CRM, booking, or field-service tool was detected publicly.", "Confirm where form fills, calls, bookings, estimates, and notifications go."));
  }

  if (dns.subdomains?.length) {
    blockers.push(blocker("Subdomain inventory", "Medium", "Client / Previous Developer", `${dns.subdomains.length} common subdomain(s) resolved.`, "Confirm whether staging, portals, booking, mail, app, shop, or CRM subdomains are active."));
  }

  for (const warning of scan.wayback?.warnings || []) {
    blockers.push(blocker("Recent site changes", "Medium", "Us + Client", warning, "Compare current lead capture, phone visibility, tracking, and homepage messaging against recent archived versions."));
  }

  return blockers.slice(0, 10);
}

export function buildCallOneWorkflow(scan) {
  const analysis = scan.analysis || {};
  const accessRequests = buildClientAccessRequests(scan);
  const warnings = buildDoNotTouchWarnings(scan);

  return [
    workflowRow({
      area: "Domain",
      found: analysis.registrar || "Unknown",
      need: accessRequests.find((item) => item.access === "Domain registrar")?.request,
      risk: "No ownership, renewal, transfer lock, or nameserver changes without registrar access.",
      ask: analysis.registrar === "Unknown" ? "Who pays for the domain renewal?" : `Who owns the ${stripLikely(analysis.registrar)} account?`,
      owner: "Client",
      audience: "Client-facing",
    }),
    workflowRow({
      area: "DNS",
      found: analysis.dnsProvider || "Unknown",
      need: accessRequests.find((item) => item.access === "DNS / nameserver control")?.request,
      risk: warnings.find((item) => item.area === "DNS zone")?.warning,
      ask: "Who can export and safely edit the full DNS zone?",
      owner: analysis.dnsProvider === "Unknown" ? "Client / Previous Developer" : "Client",
      audience: "Client-facing",
    }),
    workflowRow({
      area: "Cloudflare / CDN",
      found: plainCloudflareStatus(scan),
      need: accessRequests.find((item) => item.access === "Cloudflare")?.request,
      risk: warnings.find((item) => item.area === "Cloudflare / CDN")?.warning || "Hidden CDN settings may exist even when Cloudflare is not obvious.",
      ask: "Is there any Cloudflare, host-managed CDN, page rule, redirect, worker, WAF, or SSL setting in use?",
      owner: isCloudflareInUse(scan) ? "Client / Previous Developer" : "Client",
      audience: "Client-facing",
    }),
    workflowRow({
      area: "Hosting",
      found: analysis.hosting?.provider || "Unknown",
      need: accessRequests.find((item) => item.access === "Hosting")?.request,
      risk: warnings.find((item) => item.area === "Hosting origin")?.warning || "Launch and rollback planning need confirmed hosting/backups.",
      ask: "Where are the live files, backups, deployment path, and emergency restore access?",
      owner: "Client / Previous Developer",
      audience: "Client-facing",
    }),
    workflowRow({
      area: "Website admin / CMS",
      found: analysis.cms?.platform || "Unknown",
      need: accessRequests.find((item) => item.access === "Website admin / CMS")?.request,
      risk: "Without admin access we cannot verify users, forms, plugins, theme, backups, or update ownership.",
      ask: "Can we get a fresh admin account and confirm who last managed the site?",
      owner: "Client / Previous Developer",
      audience: "Client-facing",
    }),
    workflowRow({
      area: "Email",
      found: analysis.email?.provider || "Unknown",
      need: accessRequests.find((item) => item.access === "Email")?.request,
      risk: warnings.find((item) => item.area === "Email")?.warning,
      ask: "Who owns email admin access and which sender platforms are approved?",
      owner: "Client",
      audience: "Client-facing",
    }),
    workflowRow({
      area: "Tracking / analytics",
      found: formatFound(analysis.marketing?.found),
      need: accessRequests.find((item) => item.access === "Analytics / Search / Marketing")?.request,
      risk: "Lead attribution and launch validation are weak without GA4, GTM, Search Console, ads, pixels, and call tracking access.",
      ask: "Who can invite us to GA4, GTM, Search Console, ads, call tracking, and reporting?",
      owner: "Client",
      audience: "Client-facing",
    }),
    workflowRow({
      area: "CRM / lead routing",
      found: formatFound(analysis.operations?.found),
      need: accessRequests.find((item) => item.access === "CRM / Booking / Operations")?.request,
      risk: "Forms, calls, bookings, and quote requests can break silently if routing is not mapped.",
      ask: "Where do leads go today after calls, forms, booking widgets, and quote requests?",
      owner: "Client",
      audience: "Client-facing",
    }),
    workflowRow({
      area: "Internal next step",
      found: "Public scan complete",
      need: "Turn unknowns into assigned follow-up tasks before proposal, sitemap, or launch planning.",
      risk: "Planning based on assumptions can miss DNS/email/lead-routing dependencies.",
      ask: "Which items block our next milestone, and who is responsible for chasing them?",
      owner: "Us",
      audience: "Internal",
    }),
  ];
}

export function buildPreviousDeveloperRequestItems(scan) {
  const analysis = scan.analysis || {};
  const items = [
    "Full DNS zone export, including MX, SPF, DKIM, DMARC, verification TXT records, CNAMEs, redirects, and service records.",
    "Current hosting account, server/dashboard access, SFTP/SSH details where applicable, deployment process, backups, and rollback path.",
    "CMS administrator access, staging URL, plugin/theme ownership, form routing, users, update history, and backup schedule.",
    "Analytics, Search Console, Tag Manager, pixels, call tracking, form notifications, CRM/booking widgets, and reporting access.",
    "Current redirects, canonical host preference, sitemap/robots notes, launch notes, and known fragile dependencies.",
  ];

  if (analysis.registrar === "Unknown") {
    items.unshift("Registrar/domain account owner, renewal/billing owner, transfer-lock status, and any delegated access path.");
  }

  if (isCloudflareInUse(scan)) {
    items.push("Cloudflare account owner/admin access, DNS export, proxy status, SSL/TLS settings, page rules, redirects, workers, WAF rules, and origin details.");
  }

  if (analysis.hosting?.provider === "Unknown" || analysis.hosting?.provider === "Hidden behind Cloudflare") {
    items.push("The real origin hosting provider, origin IP/hostname if shareable, and who can grant access without disrupting the live site.");
  }

  if (scan.dns?.subdomains?.length) {
    items.push("Purpose and owner for active subdomains, especially staging, portal, booking, mail, app, shop, CRM, or admin records.");
  }

  return items;
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

function ownerForAccess(access, status) {
  if (access === "Previous developer") return "Client";
  if (status === "Unknown" || status === "Hidden behind Cloudflare" || status === "Not publicly identifiable") return "Client / Previous Developer";
  if (access.includes("Analytics") || access.includes("CRM") || access === "Email") return "Client";
  if (access === "Hosting" || access.includes("Website admin")) return "Client / Previous Developer";
  return "Client";
}

function blocker(area, severity, owner, evidence, ask) {
  return {
    area,
    severity,
    owner,
    evidence,
    ask,
  };
}

function workflowRow(row) {
  return {
    area: row.area,
    found: row.found || "Unknown",
    need: row.need || "Confirm manually.",
    risk: row.risk || "Risk needs manual review.",
    ask: row.ask || "Confirm on the client call.",
    owner: row.owner || "Client",
    audience: row.audience || "Client-facing",
  };
}
