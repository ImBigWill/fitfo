import { createTheme } from "./theme.js";
import { kv, numbered, panel, renderAppHeader, renderSurface } from "./ui.js";

export function renderTextReport(scan, options = {}) {
  const theme = createTheme(options.color !== false);
  const { domain, rdap, dns, http, analysis } = scan;
  const connectedServices = analysis.connectedServices || [];

  const lines = [
    renderAppHeader(theme, {
      mode: "domain records",
      scope: "WHOIS-style RDAP + DNS + HTTP fingerprinting",
      motto: "Kickstarting onboarding.",
    }),
    "",
    panel(theme, "Domain Brief", [
      kv(theme, "Target", targetLabel(domain)),
      kv(theme, "Scanned", scan.finishedAt),
      kv(theme, "Lookup", "WHOIS-style records + DNS + website fingerprints"),
    ]),
    "",
    panel(theme, "Verdict", [
      verdictRow(theme, "Registrar", confidenceChip(theme, rdap.registrar?.name ? "FOUND" : "MANUAL"), analysis.registrar),
      verdictRow(theme, "DNS", confidenceChip(theme, analysis.dnsProvider === "Unknown" ? "MANUAL" : "FOUND"), analysis.dnsProvider),
      verdictRow(theme, "Cloudflare", confidenceChip(theme, analysis.cloudflare.confidence.toUpperCase()), analysis.cloudflare.status),
      verdictRow(theme, "Hosting", confidenceChip(theme, analysis.hosting.confidence.toUpperCase()), analysis.hosting.provider),
      verdictRow(theme, "Prev Dev", confidenceChip(theme, "MANUAL"), analysis.previousDeveloper.contact),
      verdictRow(theme, "CMS", confidenceChip(theme, analysis.cms.confidence.toUpperCase()), analysis.cms.platform),
      verdictRow(theme, "Email", confidenceChip(theme, analysis.email.provider === "Unknown" ? "MANUAL" : "FOUND"), analysis.email.provider),
      verdictRow(
        theme,
        "Services",
        confidenceChip(theme, connectedServices.length ? "FOUND" : "MANUAL"),
        connectedServices.length ? connectedServices.join(", ") : "No extra DNS service hints found",
      ),
    ]),
    "",
    panel(theme, "Plain English", [
      `${theme.bullet("›")} Registrar is ${theme.label(analysis.registrar)}.`,
      `${theme.bullet("›")} Hosting is ${theme.label(analysis.hosting.provider)}. ${analysis.hosting.note}`,
      plainEmailLine(theme, analysis),
      `${theme.bullet("›")} Previous developer contact is ${theme.label("not discoverable from public records")}. Ask the client who last managed the site, DNS, hosting, or WordPress account.`,
    ]),
    "",
    panel(theme, "Track This Down", analysis.actionPlan.flatMap((action, index) => numbered(theme, index + 1, action.label, action.detail))),
    "",
    panel(theme, "Registrar / Domain Records", [
      kv(theme, "Registrar", rdap.registrar?.name || "Unknown"),
      rdap.dates.registration ? kv(theme, "Registered", rdap.dates.registration) : null,
      rdap.dates.expiration ? kv(theme, "Expires", rdap.dates.expiration) : null,
      rdap.statuses?.length ? kv(theme, "Status", rdap.statuses.join(", ")) : null,
    ]),
    "",
    panel(theme, "DNS Records", [
      formatList(theme, "Nameservers", dns.nameservers),
      formatList(theme, "A records", dns.addresses),
      formatList(theme, "AAAA records", dns.ipv6Addresses),
      formatList(theme, "CNAME records", dns.cnames),
      formatMx(theme, dns.mx),
      kv(theme, "SPF", dns.spf || theme.warn("Not detected")),
      kv(theme, "DMARC", dns.dmarc || theme.warn("Not detected")),
      kv(theme, "DNSSEC", dns.dnssec ? theme.ok("DS record detected") : theme.warn("No DS record detected")),
      formatList(theme, "Services", connectedServices),
    ]),
    "",
    panel(theme, "Common Subdomains", formatSubdomains(theme, dns.subdomains || [])),
    "",
    panel(theme, "Website Fingerprint", [
      kv(theme, "Reachable", http.reachable ? theme.ok("Yes") : theme.bad("No")),
      http.finalUrl ? kv(theme, "Final URL", http.finalUrl) : null,
      http.status ? kv(theme, "HTTP", String(http.status)) : null,
      http.title ? kv(theme, "Title", http.title) : null,
      http.metaGenerator ? kv(theme, "Generator", http.metaGenerator) : null,
      formatObject(theme, "Headers", http.headers),
    ]),
    "",
    panel(theme, "Signals", [
      formatList(theme, "Cloudflare", analysis.cloudflare.signals),
      formatList(theme, "CMS", analysis.cms.signals),
      analysis.hosting.note ? kv(theme, "Hosting", analysis.hosting.note) : null,
      kv(theme, "Prev Dev", analysis.previousDeveloper.note),
    ]),
    "",
    panel(theme, "Access Needed", analysis.accessNeeded.flatMap((access) => [
      `${theme.bullet("›")} ${theme.label(access.item)}`,
      `  ${theme.dim(access.reason)}`,
    ])),
    "",
    panel(theme, "Analytics / Marketing Access", [
      formatList(theme, "Detected", analysis.marketing?.found || []),
      "",
      ...((analysis.marketing?.requiredAccess || []).map((item) => `${theme.bullet("›")} ${item}`)),
    ]),
    "",
    panel(theme, "Risks / Manual Checks", analysis.risks.length
      ? analysis.risks.map((risk) => `${theme.bullet("›")} ${theme.warn(risk)}`)
      : [`${theme.bullet("›")} ${theme.ok("No major risks detected by this first-pass scan.")}`]),
    "",
    panel(theme, "Previous Developer Request", renderDeveloperRequest(scan).split("\n").map((line) => theme.dim(line))),
  ];

  return renderSurface(theme, lines.filter((line) => line !== null && line !== undefined).join("\n"));
}

function targetLabel(domain) {
  return domain.hostname === domain.apex ? domain.apex : `${domain.hostname} -> ${domain.apex}`;
}

function verdictRow(theme, label, chip, value) {
  return `${theme.label(label.padEnd(10))} ${chip} ${value}`;
}

function plainEmailLine(theme, analysis) {
  if (analysis.email.provider === "No mail configured") {
    return `${theme.bullet("›")} Email appears to be ${theme.label("not configured for this domain")} based on MX records.`;
  }

  if (analysis.email.provider === "Unknown") {
    return `${theme.bullet("›")} Email provider is ${theme.label("unclear")}. Ask before changing DNS because email may depend on hidden or incomplete records.`;
  }

  return `${theme.bullet("›")} Email appears to use ${theme.label(analysis.email.provider)}. Document MX, SPF, DKIM, and DMARC before changing DNS.`;
}

function confidenceChip(theme, value) {
  if (value === "FOUND" || value === "HIGH") return theme.ok(`[${value}]`);
  if (value === "MEDIUM" || value === "LIKELY") return theme.warn(`[${value}]`);
  if (value === "LOW" || value === "MANUAL") return theme.dim(`[${value}]`);
  return theme.chip(`[${value}]`);
}

function formatList(theme, label, values) {
  if (!values || values.length === 0) return kv(theme, label, theme.dim("None detected"));
  return [kv(theme, label, ""), ...values.map((value) => `  ${theme.bullet("›")} ${value}`)].join("\n");
}

function formatMx(theme, records) {
  if (!records || records.length === 0) return kv(theme, "MX records", theme.dim("None detected"));
  return [kv(theme, "MX records", ""), ...records.map((record) => `  ${theme.bullet("›")} ${record.priority} ${record.exchange}`)].join("\n");
}

function formatObject(theme, label, values) {
  const entries = Object.entries(values || {});
  if (!entries.length) return kv(theme, label, theme.dim("None captured"));
  return [kv(theme, label, ""), ...entries.map(([key, value]) => `  ${theme.bullet("›")} ${key}: ${value}`)].join("\n");
}

function formatSubdomains(theme, subdomains) {
  if (!subdomains.length) {
    return [kv(theme, "Resolved", theme.dim("None found in common checks"))];
  }

  return subdomains.flatMap((subdomain) => [
    `${theme.bullet("›")} ${theme.label(subdomain.name)}`,
    subdomain.cnames.length ? `  ${theme.dim(`CNAME: ${subdomain.cnames.join(", ")}`)}` : null,
    subdomain.addresses.length ? `  ${theme.dim(`A: ${subdomain.addresses.join(", ")}`)}` : null,
  ]).filter(Boolean);
}

function renderDeveloperRequest(scan) {
  const needs = scan.analysis.accessNeeded.map((access) => `- ${access.item}`).join("\n");
  return `Hi,

We're onboarding ${scan.domain.apex} and need to confirm the current domain, DNS, hosting, CMS, and email setup.

Could you please provide or delegate access for:
${needs}

If any of these are managed under your account, please let us know the best handoff path so we can avoid downtime or email disruption.`;
}
