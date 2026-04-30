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
      needed: email !== "Unknown"
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
