import { createTheme } from "../theme.js";
import { kv, numbered, panel, renderAppHeader, renderSurface } from "../ui.js";

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
      verdictRow(theme, "Launch URL", confidenceChip(theme, analysis.urlStructure?.canonicalStyle === "Unknown" ? "MANUAL" : "FOUND"), analysis.urlStructure?.canonicalStyle || "Unknown"),
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
      `${theme.bullet("›")} Launch URL guidance: ${theme.label(analysis.urlStructure?.canonicalStyle || "Unknown")}. ${analysis.urlStructure?.recommendation || "Confirm canonical host manually."}`,
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
      analysis.urlStructure ? kv(theme, "Launch URL", `${analysis.urlStructure.preferredProtocol} ${analysis.urlStructure.preferredHost} (${analysis.urlStructure.canonicalStyle})`) : null,
      http.status ? kv(theme, "HTTP", String(http.status)) : null,
      http.title ? kv(theme, "Title", http.title) : null,
      http.metaGenerator ? kv(theme, "Generator", http.metaGenerator) : null,
      formatSsl(theme, http.ssl),
      formatRedirects(theme, http.redirects),
      formatUrlStructure(theme, http.urlStructure),
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
    panel(theme, "CRM / Operations Access", [
      formatList(theme, "Detected", analysis.operations?.found || []),
      "",
      ...((analysis.operations?.requiredAccess || []).map((item) => `${theme.bullet("›")} ${item}`)),
    ]),
    "",
    panel(theme, "Dev Pre-Launch Checklist", (analysis.launchChecklist || []).flatMap((item, index) => numbered(theme, index + 1, item.item, item.detail))),
    "",
    panel(theme, "Risks / Manual Checks", analysis.risks.length
      ? analysis.risks.map((risk) => `${theme.bullet("›")} ${theme.warn(risk)}`)
      : [`${theme.bullet("›")} ${theme.ok("No major risks detected by this first-pass scan.")}`]),
    "",
    panel(theme, "Previous Developer Request", renderDeveloperRequest(scan).split("\n").map((line) => theme.dim(line))),
  ];

  return renderSurface(theme, lines.filter((line) => line !== null && line !== undefined).join("\n"));
}

export function renderMarkdownReport(scan, options = {}) {
  const { domain, rdap, dns, http, analysis } = scan;
  const connectedServices = analysis.connectedServices || [];
  const markdownMode = options.obsidian ? "obsidian" : "markdown";

  const lines = [
    "---",
    `title: "${yamlString(`FITFO - ${domain.apex}`)}"`,
    `domain: "${yamlString(domain.apex)}"`,
    `scanned_at: "${yamlString(scan.finishedAt)}"`,
    `fitfo_version: "${yamlString(scan.scanVersion)}"`,
    `report_type: "${markdownMode}"`,
    `registrar: "${yamlString(analysis.registrar)}"`,
    `dns_provider: "${yamlString(analysis.dnsProvider)}"`,
    `hosting_provider: "${yamlString(analysis.hosting.provider)}"`,
    `canonical_host: "${yamlString(analysis.urlStructure?.preferredHost || "Unknown")}"`,
    `cms: "${yamlString(analysis.cms.platform)}"`,
    `email_provider: "${yamlString(analysis.email.provider)}"`,
    `cloudflare: "${yamlString(analysis.cloudflare.status)}"`,
    "tags:",
    "  - fitfo",
    "  - client-onboarding",
    "  - domain-intake",
    "---",
    "",
    `# FITFO - ${domain.apex}`,
    "",
    "**Kickstarting onboarding.**",
    "",
    "## Snapshot",
    "",
    markdownTable([
      ["Target", targetLabel(domain)],
      ["Scanned", scan.finishedAt],
      ["Lookup", "WHOIS-style RDAP + DNS + website fingerprints"],
      ["Registrar", analysis.registrar],
      ["DNS Provider", analysis.dnsProvider],
      ["Cloudflare", `${analysis.cloudflare.status} (${analysis.cloudflare.confidence})`],
      ["Hosting", `${analysis.hosting.provider} (${analysis.hosting.confidence})`],
      ["Launch URL", analysis.urlStructure ? `${analysis.urlStructure.preferredProtocol} ${analysis.urlStructure.preferredHost} (${analysis.urlStructure.canonicalStyle})` : "Unknown"],
      ["CMS", `${analysis.cms.platform} (${analysis.cms.confidence})`],
      ["Email", analysis.email.provider],
      ["Connected Services", connectedServices.length ? connectedServices.join(", ") : "None detected"],
    ]),
    "",
    "## Plain English",
    "",
    `- Registrar is **${analysis.registrar}**.`,
    `- Hosting is **${analysis.hosting.provider}**. ${analysis.hosting.note}`,
    `- Launch URL guidance: **${analysis.urlStructure?.canonicalStyle || "Unknown"}**. ${analysis.urlStructure?.recommendation || "Confirm canonical host manually."}`,
    markdownEmailLine(analysis),
    "- Previous developer contact is **not discoverable from public records**. Ask the client who last managed the site, DNS, hosting, or WordPress account.",
    "",
    "## Track This Down",
    "",
    ...analysis.actionPlan.flatMap((action) => [
      `- [ ] **${action.label}**`,
      `  ${action.detail}`,
    ]),
    "",
    "## Access Needed",
    "",
    ...analysis.accessNeeded.flatMap((access) => [
      `- [ ] **${access.item}**`,
      `  ${access.reason}`,
    ]),
    "",
    "## Questions For The Client Call",
    "",
    ...clientQuestions(scan).map((question) => `- ${question}`),
    "",
    "## Registrar / Domain Records",
    "",
    markdownTable([
      ["Registrar", rdap.registrar?.name || "Unknown"],
      ["Registered", rdap.dates.registration || "Unknown"],
      ["Expires", rdap.dates.expiration || "Unknown"],
      ["Status", rdap.statuses?.length ? rdap.statuses.join(", ") : "Unknown"],
    ]),
    "",
    "## DNS Records",
    "",
    markdownListSection("Nameservers", dns.nameservers),
    markdownListSection("A records", dns.addresses),
    markdownListSection("AAAA records", dns.ipv6Addresses),
    markdownListSection("CNAME records", dns.cnames),
    markdownListSection("MX records", (dns.mx || []).map((record) => `${record.priority} ${record.exchange}`)),
    `- **SPF:** ${dns.spf || "Not detected"}`,
    `- **DMARC:** ${dns.dmarc || "Not detected"}`,
    `- **DNSSEC:** ${dns.dnssec ? "DS record detected" : "No DS record detected"}`,
    markdownListSection("Services", connectedServices),
    "",
    "## Common Subdomains",
    "",
    ...(dns.subdomains?.length ? dns.subdomains.flatMap((subdomain) => [
      `- **${subdomain.name}**`,
      subdomain.cnames.length ? `  - CNAME: ${subdomain.cnames.join(", ")}` : null,
      subdomain.addresses.length ? `  - A: ${subdomain.addresses.join(", ")}` : null,
    ]).filter(Boolean) : ["- None found in common checks"]),
    "",
    "## Website Fingerprint",
    "",
    markdownTable([
      ["Reachable", http.reachable ? "Yes" : "No"],
      ["Final URL", http.finalUrl || "Unknown"],
      ["Launch URL", analysis.urlStructure ? `${analysis.urlStructure.preferredProtocol} ${analysis.urlStructure.preferredHost} (${analysis.urlStructure.canonicalStyle})` : "Unknown"],
      ["HTTP", http.status ? String(http.status) : "Unknown"],
      ["Title", http.title || "Unknown"],
      ["Generator", http.metaGenerator || "Unknown"],
      ["TLS", markdownSslSummary(http.ssl)],
    ]),
    "",
    "### Redirects",
    "",
    markdownRedirects(http.redirects),
    "",
    "### URL Structure",
    "",
    markdownUrlStructure(http.urlStructure),
    "",
    "### Headers",
    "",
    markdownObjectList(http.headers),
    "",
    "## Signals",
    "",
    markdownListSection("Cloudflare", analysis.cloudflare.signals),
    markdownListSection("CMS", analysis.cms.signals),
    `- **Hosting:** ${analysis.hosting.note || "No hosting note"}`,
    `- **Previous developer:** ${analysis.previousDeveloper.note}`,
    "",
    "## Analytics / Marketing Access",
    "",
    markdownListSection("Detected", analysis.marketing?.found || []),
    "",
    ...((analysis.marketing?.requiredAccess || []).map((item) => `- [ ] ${item}`)),
    "",
    "## CRM / Operations Access",
    "",
    markdownListSection("Detected", analysis.operations?.found || []),
    "",
    ...((analysis.operations?.requiredAccess || []).map((item) => `- [ ] ${item}`)),
    "",
    "## Dev Pre-Launch Checklist",
    "",
    ...((analysis.launchChecklist || []).flatMap((item) => [
      `- [ ] **${item.item}**`,
      `  ${item.detail}`,
    ])),
    "",
    "## Risks / Manual Checks",
    "",
    ...(analysis.risks.length ? analysis.risks.map((risk) => `- ${risk}`) : ["- No major risks detected by this first-pass scan."]),
    "",
    "## Previous Developer Request",
    "",
    "```text",
    renderDeveloperRequest(scan),
    "```",
    "",
  ];

  return `${lines.join("\n").replace(/\n{3,}/g, "\n\n")}\n`;
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

function markdownEmailLine(analysis) {
  if (analysis.email.provider === "No mail configured") {
    return "- Email appears to be **not configured for this domain** based on MX records.";
  }

  if (analysis.email.provider === "Unknown") {
    return "- Email provider is **unclear**. Ask before changing DNS because email may depend on hidden or incomplete records.";
  }

  return `- Email appears to use **${analysis.email.provider}**. Document MX, SPF, DKIM, and DMARC before changing DNS.`;
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

function formatSsl(theme, ssl) {
  if (!ssl) return kv(theme, "TLS", theme.dim("Not checked"));
  if (!ssl.available) return kv(theme, "TLS", theme.warn(ssl.error || "Certificate not readable"));

  const parts = [
    ssl.valid ? theme.ok("trusted") : theme.warn("not trusted"),
    ssl.issuer?.O || ssl.issuer?.CN ? `issuer: ${ssl.issuer.O || ssl.issuer.CN}` : null,
    ssl.validTo ? `expires: ${ssl.validTo}` : null,
    typeof ssl.daysRemaining === "number" ? `${ssl.daysRemaining} day(s)` : null,
  ].filter(Boolean);

  return kv(theme, "TLS", parts.join(" | "));
}

function formatRedirects(theme, redirects) {
  if (!redirects || redirects.length === 0) return kv(theme, "Redirects", theme.dim("Not checked"));

  return [kv(theme, "Redirects", ""), ...redirects.flatMap((check) => {
    if (!check.reachable) {
      return [`  ${theme.bullet("›")} ${check.startUrl} ${theme.dim(`failed: ${check.error || "unreachable"}`)}`];
    }

    const summary = [`  ${theme.bullet("›")} ${check.startUrl} -> ${check.finalUrl || "unknown"} (${check.status || "unknown"})`];
    for (const hop of check.hops || []) {
      summary.push(`    ${theme.dim(`${hop.status} ${hop.url} -> ${hop.location}`)}`);
    }
    return summary;
  })].join("\n");
}

function formatUrlStructure(theme, urlStructure) {
  if (!urlStructure?.checkedHosts?.length) return kv(theme, "URL checks", theme.dim("Not checked"));

  return [kv(theme, "URL checks", ""), ...urlStructure.checkedHosts.flatMap((hostCheck) => {
    const lines = [`  ${theme.bullet("›")} ${theme.label(hostCheck.host)}`];
    for (const variant of hostCheck.variants || []) {
      if (!variant.reachable) {
        lines.push(`    ${theme.dim(`${variant.startUrl} failed${variant.error ? `: ${variant.error}` : ""}`)}`);
      } else {
        lines.push(`    ${theme.dim(`${variant.startUrl} -> ${variant.finalUrl || "unknown"} (${variant.status || "unknown"})`)}`);
      }
    }
    return lines;
  })].join("\n");
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

function markdownTable(rows) {
  return [
    "| Field | Value |",
    "| --- | --- |",
    ...rows.map(([key, value]) => `| ${escapeTable(key)} | ${escapeTable(value)} |`),
  ].join("\n");
}

function markdownListSection(label, values) {
  if (!values || values.length === 0) {
    return `- **${label}:** None detected`;
  }

  return [`- **${label}:**`, ...values.map((value) => `  - ${value}`)].join("\n");
}

function markdownObjectList(values) {
  const entries = Object.entries(values || {});
  if (!entries.length) return "- None captured";
  return entries.map(([key, value]) => `- **${key}:** ${value}`).join("\n");
}

function markdownSslSummary(ssl) {
  if (!ssl) return "Not checked";
  if (!ssl.available) return ssl.error ? `Not readable: ${ssl.error}` : "Not readable";

  const trust = ssl.valid ? "trusted" : `not trusted${ssl.authorizationError ? `: ${ssl.authorizationError}` : ""}`;
  const issuer = ssl.issuer?.O || ssl.issuer?.CN ? `issuer ${ssl.issuer.O || ssl.issuer.CN}` : "unknown issuer";
  const expires = ssl.validTo ? `expires ${ssl.validTo}` : "unknown expiration";
  const days = typeof ssl.daysRemaining === "number" ? `${ssl.daysRemaining} day(s)` : "unknown days";
  return `${trust}; ${issuer}; ${expires}; ${days}`;
}

function markdownRedirects(redirects) {
  if (!redirects || redirects.length === 0) return "- Not checked";

  return redirects.flatMap((check) => {
    if (!check.reachable) {
      return [`- **${check.startUrl}:** failed${check.error ? `: ${check.error}` : ""}`];
    }

    const lines = [`- **${check.startUrl}:** ${check.finalUrl || "unknown"} (${check.status || "unknown"})`];
    for (const hop of check.hops || []) {
      lines.push(`  - ${hop.status} ${hop.url} -> ${hop.location}`);
    }
    return lines;
  }).join("\n");
}

function markdownUrlStructure(urlStructure) {
  if (!urlStructure?.checkedHosts?.length) return "- Not checked";

  const lines = [
    `- **Recommendation:** ${urlStructure.recommendation || "Confirm canonical host manually."}`,
  ];

  for (const hostCheck of urlStructure.checkedHosts) {
    lines.push(`- **${hostCheck.host}:**`);
    for (const variant of hostCheck.variants || []) {
      if (!variant.reachable) {
        lines.push(`  - ${variant.startUrl}: failed${variant.error ? `: ${variant.error}` : ""}`);
      } else {
        lines.push(`  - ${variant.startUrl}: ${variant.finalUrl || "unknown"} (${variant.status || "unknown"})`);
      }
    }
  }

  return lines.join("\n");
}

function clientQuestions(scan) {
  const { analysis } = scan;
  const registrarAccount = analysis.registrar === "Unknown" ? "domain registrar" : analysis.registrar;
  const questions = [
    `Who owns the ${registrarAccount} account, and can we get delegated access instead of a shared password?`,
    analysis.dnsProvider === "Cloudflare"
      ? "Who owns the Cloudflare account, and are there any page rules, redirects, workers, WAF rules, or SSL settings we should preserve?"
      : `Who controls DNS${analysis.dnsProvider === "Unknown" ? "" : ` at ${analysis.dnsProvider}`}, and can we review the complete zone before making changes?`,
    analysis.hosting.provider === "Unknown" || analysis.hosting.provider === "Hidden behind Cloudflare"
      ? "Where is the website actually hosted, and who can grant hosting or deployment access?"
      : `Who can grant ${analysis.hosting.provider} hosting access, and are backups already configured?`,
    "Who should be the technical owner for renewals, billing alerts, DNS changes, and emergency access after handoff?",
    "Are there active subdomains, staging sites, portals, booking tools, shops, email tools, or CRMs we should avoid disrupting?",
    "Which analytics, Search Console, Tag Manager, ad accounts, call tracking, forms, CRM, and email marketing tools are currently in use?",
  ];

  if (analysis.cms.platform === "WordPress") {
    questions.push("Can we create a fresh WordPress administrator account and review plugins, theme, users, backups, and update history?");
  }

  if (analysis.email.provider !== "No mail configured") {
    questions.push(`Who administers ${analysis.email.provider === "Unknown" ? "email" : analysis.email.provider}, and are SPF, DKIM, and DMARC records current?`);
  }

  return questions;
}

function yamlString(value) {
  return String(value ?? "").replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function escapeTable(value) {
  return String(value ?? "").replace(/\|/g, "\\|").replace(/\n/g, "<br>");
}
