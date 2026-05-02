import { createTheme } from "../theme.js";
import { buildCallOneWorkflow, buildClientAccessRequests, buildConfidenceExplanations, buildDoNotTouchWarnings, buildPreviousDeveloperRequestItems, buildUnknownBlockers, plainCloudflareStatus } from "../handoff.js";
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
      analysis.inputStatus ? kv(theme, "Input Check", `${analysis.inputStatus.status} (${analysis.inputStatus.confidence})`) : null,
    ]),
    "",
    panel(theme, "Verdict", [
      analysis.inputStatus ? verdictRow(theme, "Input", confidenceChip(theme, analysis.inputStatus.status === "Unresolved" ? "MANUAL" : "FOUND"), analysis.inputStatus.status) : null,
      verdictRow(theme, "Registrar", confidenceChip(theme, rdap.registrar?.name ? "FOUND" : "MANUAL"), analysis.registrar),
      verdictRow(theme, "DNS", confidenceChip(theme, analysis.dnsProvider === "Unknown" ? "MANUAL" : "FOUND"), analysis.dnsProvider),
      verdictRow(theme, "Cloudflare", confidenceChip(theme, analysis.cloudflare.confidence.toUpperCase()), plainCloudflareStatus(scan)),
      verdictRow(theme, "Hosting", confidenceChip(theme, analysis.hosting.confidence.toUpperCase()), analysis.hosting.provider),
      verdictRow(theme, "Launch URL", confidenceChip(theme, analysis.urlStructure?.canonicalStyle === "Unknown" ? "MANUAL" : "FOUND"), analysis.urlStructure?.canonicalStyle || "Unknown"),
      verdictRow(theme, "Prev Dev", confidenceChip(theme, "MANUAL"), analysis.previousDeveloper.contact),
      verdictRow(theme, "CMS", confidenceChip(theme, analysis.cms.confidence.toUpperCase()), analysis.cms.platform),
      verdictRow(theme, "Email", confidenceChip(theme, analysis.email.provider === "Unknown" ? "MANUAL" : "FOUND"), analysis.email.provider),
      analysis.emailSafety ? verdictRow(theme, "Mail Risk", riskChip(theme, analysis.emailSafety.riskLevel), analysis.emailSafety.riskLevel) : null,
      verdictRow(
        theme,
        "Services",
        confidenceChip(theme, connectedServices.length ? "FOUND" : "MANUAL"),
        connectedServices.length ? connectedServices.join(", ") : "No extra DNS service hints found",
      ),
    ]),
    "",
    panel(theme, "Plain English", [
      analysis.inputStatus?.status === "Unresolved" ? `${theme.bullet("›")} ${theme.warn(analysis.inputStatus.summary)}` : null,
      `${theme.bullet("›")} Registrar is ${theme.label(analysis.registrar)}.`,
      `${theme.bullet("›")} Hosting is ${theme.label(analysis.hosting.provider)}. ${analysis.hosting.note}`,
      `${theme.bullet("›")} Launch URL guidance: ${theme.label(analysis.urlStructure?.canonicalStyle || "Unknown")}. ${analysis.urlStructure?.recommendation || "Confirm canonical host manually."}`,
      plainEmailLine(theme, analysis),
      analysis.emailSafety?.summary ? `${theme.bullet("›")} Mail safety: ${analysis.emailSafety.summary}` : null,
      `${theme.bullet("›")} Previous developer contact is ${theme.label("not discoverable from public records")}. Ask the client who last managed the site, DNS, hosting, or WordPress account.`,
    ]),
    "",
    panel(theme, "Client Handoff Summary", formatClientHandoffSummary(theme, scan)),
    "",
    panel(theme, "Unknowns Blocking Work", formatUnknownBlockers(theme, scan)),
    "",
    panel(theme, "Call One Workflow", formatCallOneWorkflow(theme, scan)),
    "",
    panel(theme, "Why FITFO Thinks This", formatConfidenceExplanations(theme, scan)),
    "",
    panel(theme, "Go Get These Logins", formatClientAccessRequests(theme, scan)),
    "",
    panel(theme, "Do Not Touch Until Confirmed", formatDoNotTouchWarnings(theme, scan)),
    "",
    panel(theme, "Previous Developer Request List", formatPreviousDeveloperRequestItems(theme, scan)),
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
    panel(theme, "Email Safety", formatEmailSafety(theme, analysis.emailSafety, analysis.email)),
    "",
    panel(theme, "Common Subdomains", formatSubdomains(theme, dns.subdomains || [])),
    "",
    panel(theme, "Website Fingerprint", [
      kv(theme, "Reachable", http.reachable ? theme.ok("Yes") : theme.bad("No")),
      http.finalUrl ? kv(theme, "Final URL", http.finalUrl) : null,
      analysis.urlStructure ? kv(theme, "Launch URL", formatLaunchUrl(analysis.urlStructure)) : null,
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
      formatList(theme, "Hosting evidence", analysis.hosting.evidence || []),
      kv(theme, "Prev Dev", analysis.previousDeveloper.note),
    ]),
    "",
    panel(theme, "Access Needed", analysis.accessNeeded.flatMap((access) => [
      `${theme.bullet("›")} ${theme.label(access.item)}`,
      `  ${theme.dim(access.reason)}`,
    ])),
    "",
    panel(theme, "Handoff Packet", formatHandoffPacket(theme, scan)),
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
    `input_status: "${yamlString(analysis.inputStatus?.status || "Unknown")}"`,
    `cms: "${yamlString(analysis.cms.platform)}"`,
    `email_provider: "${yamlString(analysis.email.provider)}"`,
    `email_risk: "${yamlString(analysis.emailSafety?.riskLevel || "Unknown")}"`,
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
      ["Input Check", analysis.inputStatus ? `${analysis.inputStatus.status} (${analysis.inputStatus.confidence})` : "Unknown"],
      ["Registrar", analysis.registrar],
      ["DNS Provider", analysis.dnsProvider],
      ["Cloudflare", `${plainCloudflareStatus(scan)} (${analysis.cloudflare.confidence})`],
      ["Hosting", `${analysis.hosting.provider} (${analysis.hosting.confidence})`],
      ["Launch URL", analysis.urlStructure ? formatLaunchUrl(analysis.urlStructure) : "Unknown"],
      ["CMS", `${analysis.cms.platform} (${analysis.cms.confidence})`],
      ["Email", analysis.email.provider],
      ["Email Safety", analysis.emailSafety ? `${analysis.emailSafety.riskLevel}: ${analysis.emailSafety.summary}` : "Unknown"],
      ["Connected Services", connectedServices.length ? connectedServices.join(", ") : "None detected"],
    ]),
    "",
    "## Plain English",
    "",
    ...(analysis.inputStatus?.status === "Unresolved" ? [`- **Input check:** ${analysis.inputStatus.summary}`] : []),
    `- Registrar is **${analysis.registrar}**.`,
    `- Hosting is **${analysis.hosting.provider}**. ${analysis.hosting.note}`,
    markdownEmailLine(analysis),
    ...(analysis.emailSafety?.summary ? [`- Mail safety: **${analysis.emailSafety.riskLevel} risk.** ${analysis.emailSafety.summary}`] : []),
    "- Previous developer contact is **not discoverable from public records**. Ask the client who last managed the site, DNS, hosting, or WordPress account.",
    "",
    "## Client Handoff Summary",
    "",
    markdownClientHandoffSummary(scan),
    "",
    "## Unknowns Blocking Work",
    "",
    markdownUnknownBlockers(scan),
    "",
    "## Call One Workflow",
    "",
    markdownCallOneWorkflow(scan),
    "",
    "## Why FITFO Thinks This",
    "",
    markdownConfidenceExplanations(scan),
    "",
    "## Go Get These Logins",
    "",
    markdownClientAccessRequests(scan),
    "",
    "## Do Not Touch Until Confirmed",
    "",
    markdownDoNotTouchWarnings(scan),
    "",
    "## Previous Developer Request List",
    "",
    ...buildPreviousDeveloperRequestItems(scan).map((item) => `- [ ] ${item}`),
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
    "## Handoff Packet",
    "",
    markdownHandoffPacket(scan),
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
    "## Email Safety",
    "",
    markdownEmailSafety(analysis.emailSafety, analysis.email),
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
      ["Launch URL", analysis.urlStructure ? formatLaunchUrl(analysis.urlStructure) : "Unknown"],
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
    markdownListSection("Hosting evidence", analysis.hosting.evidence || []),
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

function formatLaunchUrl(urlStructure) {
  if (!urlStructure || urlStructure.preferredHost === "Unknown") return "Unknown";
  return `${urlStructure.preferredProtocol} ${urlStructure.preferredHost} (${urlStructure.canonicalStyle})`;
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

function riskChip(theme, value) {
  const normalized = String(value || "Manual").toUpperCase();
  if (normalized === "HIGH") return theme.bad(`[${normalized}]`);
  if (normalized === "MEDIUM") return theme.warn(`[${normalized}]`);
  if (normalized === "LOW") return theme.ok(`[${normalized}]`);
  return theme.dim(`[${normalized}]`);
}

function formatList(theme, label, values) {
  if (!values || values.length === 0) return kv(theme, label, theme.dim("None detected"));
  return [kv(theme, label, ""), ...values.map((value) => `  ${theme.bullet("›")} ${value}`)].join("\n");
}

function formatMx(theme, records) {
  if (!records || records.length === 0) return kv(theme, "MX records", theme.dim("None detected"));
  return [kv(theme, "MX records", ""), ...records.map((record) => `  ${theme.bullet("›")} ${record.priority} ${record.exchange}`)].join("\n");
}

function formatEmailSafety(theme, safety, email) {
  if (!safety) {
    return [
      kv(theme, "Provider", email?.provider || "Unknown"),
      kv(theme, "Risk", theme.dim("Unknown")),
      kv(theme, "Checklist", theme.dim("Run a fresh scan to generate email safety guidance.")),
    ];
  }

  const risk = safety.riskLevel === "High"
    ? theme.bad(safety.riskLevel)
    : safety.riskLevel === "Medium"
      ? theme.warn(safety.riskLevel)
      : safety.riskLevel === "Low"
        ? theme.ok(safety.riskLevel)
        : theme.dim(safety.riskLevel);

  return [
    kv(theme, "Provider", safety.provider || email?.provider || "Unknown"),
    kv(theme, "Risk", risk),
    kv(theme, "SPF", safety.spf?.summary || theme.dim("Unknown")),
    kv(theme, "DMARC", safety.dmarc?.summary || theme.dim("Unknown")),
    kv(theme, "DKIM", safety.dkim?.summary || theme.dim("Confirm manually")),
    formatList(theme, "Senders", safety.senderServices || []),
    safety.summary ? kv(theme, "Summary", safety.summary) : null,
    "",
    ...((safety.checklist || []).map((item) => `${theme.bullet("›")} ${item}`)),
  ].filter(Boolean);
}

function formatHandoffPacket(theme, scan) {
  const packet = buildHandoffPacket(scan);
  return [
    `${theme.label("What FITFO Found")}`,
    ...packet.found.map((item) => `  ${theme.bullet("›")} ${item}`),
    "",
    `${theme.label("What We Need")}`,
    ...packet.needs.map((item) => `  ${theme.bullet("›")} ${item}`),
    "",
    `${theme.label("Ask Previous Developer")}`,
    ...packet.previousDeveloper.map((item) => `  ${theme.bullet("›")} ${item}`),
    "",
    `${theme.label("Before Launch")}`,
    ...packet.beforeLaunch.map((item) => `  ${theme.bullet("›")} ${item}`),
  ];
}

function formatClientHandoffSummary(theme, scan) {
  return buildClientHandoffSummary(scan).flatMap((item) => [
    `${theme.bullet("›")} ${theme.label(item.area)} ${theme.chip(`[${item.confidence}]`)}`,
    `  ${theme.dim(`Found: ${item.found}`)}`,
    `  ${theme.dim(`Need: ${item.need}`)}`,
  ]);
}

function formatUnknownBlockers(theme, scan) {
  const blockers = buildUnknownBlockers(scan);
  if (!blockers.length) return [`${theme.bullet("›")} ${theme.ok("No major onboarding blockers generated from the public scan.")}`];
  return blockers.flatMap((item) => [
    `${theme.bullet("›")} ${theme.label(item.area)} ${theme.chip(`[${item.severity}]`)} ${theme.dim(item.owner)}`,
    `  ${theme.dim(`Evidence: ${item.evidence}`)}`,
    `  ${theme.dim(`Ask: ${item.ask}`)}`,
  ]);
}

function formatCallOneWorkflow(theme, scan) {
  return buildCallOneWorkflow(scan).flatMap((item) => [
    `${theme.bullet("›")} ${theme.label(item.area)} ${theme.chip(`[${item.owner}]`)} ${theme.dim(item.audience)}`,
    `  ${theme.dim(`Found: ${item.found}`)}`,
    `  ${theme.dim(`Need: ${item.need}`)}`,
    `  ${theme.dim(`Risk: ${item.risk}`)}`,
    `  ${theme.dim(`Ask: ${item.ask}`)}`,
  ]);
}

function formatConfidenceExplanations(theme, scan) {
  return buildConfidenceExplanations(scan).flatMap((item) => [
    `${theme.bullet("›")} ${theme.label(item.area)} ${theme.chip(`[${item.confidence}]`)} ${theme.value(item.finding)}`,
    `  ${theme.dim(`Why: ${item.evidence}`)}`,
    `  ${theme.dim(`Next: ${item.clientFollowUp}`)}`,
  ]);
}

function formatClientAccessRequests(theme, scan) {
  return buildClientAccessRequests(scan).map((item) => `${theme.bullet("›")} ${theme.label(item.access)} ${theme.chip(`[${item.owner}]`)} ${theme.dim(`${item.status}: ${item.request}`)}`);
}

function formatDoNotTouchWarnings(theme, scan) {
  return buildDoNotTouchWarnings(scan).flatMap((item) => [
    `${theme.bullet("›")} ${theme.label(item.area)} ${theme.warn(item.warning)}`,
    `  ${theme.dim(item.reason)}`,
  ]);
}

function formatPreviousDeveloperRequestItems(theme, scan) {
  return buildPreviousDeveloperRequestItems(scan).map((item) => `${theme.bullet("›")} ${theme.dim(item)}`);
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
  }), ...formatUrlStructureIssues(theme, urlStructure.issues || [])].join("\n");
}

function formatUrlStructureIssues(theme, issues) {
  if (!issues.length) return [`  ${theme.bullet("›")} ${theme.ok("Apex/www variants look consistent in first-pass checks.")}`];

  return [
    `  ${theme.bullet("›")} ${theme.label("Redirect QA")}`,
    ...issues.map((issue) => `    ${issue.severity === "High" ? theme.warn("[High]") : theme.chip(`[${issue.severity}]`)} ${theme.dim(`${issue.summary} ${issue.detail}`)}`),
  ];
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
  const specificRequests = buildPreviousDeveloperRequestItems(scan).map((item) => `- ${item}`).join("\n");
  return `Hi,

We're onboarding ${scan.domain.apex} and need to confirm the current domain, DNS, hosting, CMS, and email setup.

Could you please provide or delegate access for:
${needs}

Could you also send or confirm:
${specificRequests}

If any of these are managed under your account, please let us know the best handoff path so we can avoid downtime or email disruption.`;
}

function markdownTable(rows) {
  return [
    "| Field | Value |",
    "| --- | --- |",
    ...rows.map(([key, value]) => `| ${escapeTable(key)} | ${escapeTable(value)} |`),
  ].join("\n");
}

function markdownTableWithHeaders(headers, rows) {
  return [
    `| ${headers.map(escapeTable).join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map(escapeTable).join(" | ")} |`),
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

function markdownEmailSafety(safety, email) {
  if (!safety) {
    return markdownTable([
      ["Provider", email?.provider || "Unknown"],
      ["Risk", "Unknown"],
      ["Checklist", "Run a fresh scan to generate email safety guidance."],
    ]);
  }

  return [
    markdownTable([
      ["Provider", safety.provider || email?.provider || "Unknown"],
      ["Risk", safety.riskLevel],
      ["SPF", safety.spf?.summary || "Unknown"],
      ["DMARC", safety.dmarc?.summary || "Unknown"],
      ["DKIM", safety.dkim?.summary || "Confirm manually"],
      ["Sender Services", safety.senderServices?.length ? safety.senderServices.join(", ") : "None detected"],
      ["Summary", safety.summary || "Unknown"],
    ]),
    "",
    ...(safety.checklist || []).map((item) => `- [ ] ${item}`),
  ].join("\n");
}

function markdownHandoffPacket(scan) {
  const packet = buildHandoffPacket(scan);
  return [
    "### What FITFO Found",
    "",
    ...packet.found.map((item) => `- ${item}`),
    "",
    "### What We Need",
    "",
    ...packet.needs.map((item) => `- [ ] ${item}`),
    "",
    "### Ask Previous Developer",
    "",
    ...packet.previousDeveloper.map((item) => `- [ ] ${item}`),
    "",
    "### Before Launch",
    "",
    ...packet.beforeLaunch.map((item) => `- [ ] ${item}`),
  ].join("\n");
}

function markdownClientHandoffSummary(scan) {
  return markdownTableWithHeaders(["Area", "Confidence", "Public Signal", "Client Needs To Provide / Confirm"], buildClientHandoffSummary(scan).map((item) => [
    item.area,
    item.confidence,
    item.found,
    item.need,
  ]));
}

function markdownUnknownBlockers(scan) {
  const blockers = buildUnknownBlockers(scan);
  if (!blockers.length) return "- No major onboarding blockers generated from the public scan.";
  return markdownTableWithHeaders(["Blocker", "Severity", "Owner", "Evidence", "Ask"], blockers.map((item) => [
    item.area,
    item.severity,
    item.owner,
    item.evidence,
    item.ask,
  ]));
}

function markdownCallOneWorkflow(scan) {
  return markdownTableWithHeaders(["Area", "Found", "Need", "Risk", "Ask", "Owner", "Audience"], buildCallOneWorkflow(scan).map((item) => [
    item.area,
    item.found,
    item.need,
    item.risk,
    item.ask,
    item.owner,
    item.audience,
  ]));
}

function markdownConfidenceExplanations(scan) {
  return markdownTableWithHeaders(["Area", "Finding", "Confidence", "Why FITFO Thinks This", "Client Follow-Up"], buildConfidenceExplanations(scan).map((item) => [
    item.area,
    item.finding,
    item.confidence,
    item.evidence,
    item.clientFollowUp,
  ]));
}

function markdownClientAccessRequests(scan) {
  return markdownTableWithHeaders(["Login / Access", "Current Public Status", "Owner", "What Client Needs To Get"], buildClientAccessRequests(scan).map((item) => [
    item.access,
    item.status,
    item.owner,
    item.request,
  ]));
}

function markdownDoNotTouchWarnings(scan) {
  return markdownTableWithHeaders(["Area", "Do Not Touch", "Why It Matters"], buildDoNotTouchWarnings(scan).map((item) => [
    item.area,
    item.warning,
    item.reason,
  ]));
}

function buildClientHandoffSummary(scan) {
  const { analysis, dns, rdap } = scan;
  const registrar = analysis.registrarDetails || {
    name: analysis.registrar || "Unknown",
    confidence: analysis.registrar === "Unknown" ? "Manual" : "High",
    source: rdap.registrar?.name ? "RDAP" : "Public scan",
    note: analysis.registrar === "Unknown" ? "Registrar was not publicly identified." : "Registrar found from public records.",
  };
  const nameservers = dns.nameservers?.length ? dns.nameservers.join(", ") : "No nameservers detected";
  const mxRecords = dns.mx?.length ? dns.mx.map((record) => `${record.priority} ${record.exchange}`).join(", ") : "No MX records detected";
  const services = analysis.connectedServices?.length ? analysis.connectedServices.join(", ") : "No extra DNS service hints found";
  const subdomains = dns.subdomains?.length ? `${dns.subdomains.length} common subdomain(s) resolved` : "No common subdomains resolved";

  return [
    {
      area: "Domain / Registrar",
      confidence: registrar.confidence || "Manual",
      found: `${registrar.name}. ${registrar.note || registrar.source || ""}`.trim(),
      need: "Client must provide registrar login, billing owner, delegated access, or confirm who owns the domain account.",
    },
    {
      area: "DNS / Nameservers",
      confidence: analysis.dnsProvider === "Unknown" ? "Manual" : "High",
      found: `${analysis.dnsProvider}. Nameservers: ${nameservers}.`,
      need: "Client or previous developer must confirm who controls DNS before any website, email, or launch changes.",
    },
    {
      area: "Hosting / Website Files",
      confidence: analysis.hosting.confidence || "Manual",
      found: `${analysis.hosting.provider}. ${analysis.hosting.note || ""}`.trim(),
      need: "Client must confirm hosting account, collaborator access, backups, deployment path, and emergency restore contact.",
    },
    {
      area: "CMS / Website Admin",
      confidence: analysis.cms.confidence || "Manual",
      found: analysis.cms.platform,
      need: analysis.cms.platform === "WordPress"
        ? "Client should provide a new WordPress administrator user and confirm who manages plugins, theme, backups, and updates."
        : "Client should confirm CMS/admin access and who can edit or deploy the website.",
    },
    {
      area: "Email / DNS Safety",
      confidence: analysis.email.provider === "Unknown" ? "Manual" : "High",
      found: `${analysis.email.provider}. MX: ${mxRecords}.`,
      need: "Client must confirm email provider and preserve MX, SPF, DKIM, and DMARC before DNS or nameserver changes.",
    },
    {
      area: "Analytics / CRM / Services",
      confidence: [...(analysis.marketing?.found || []), ...(analysis.operations?.found || []), ...(analysis.connectedServices || [])].length ? "Found" : "Manual",
      found: [
        analysis.marketing?.found?.length ? `Marketing: ${analysis.marketing.found.join(", ")}` : "Marketing: none detected",
        analysis.operations?.found?.length ? `CRM/ops: ${analysis.operations.found.join(", ")}` : "CRM/ops: none detected",
        `DNS services: ${services}`,
      ].join(". "),
      need: "Client should provide GA4, Search Console, Tag Manager, ads/pixels, call tracking, CRM/booking, forms, and reporting access where applicable.",
    },
    {
      area: "Subdomains / Hidden Tools",
      confidence: dns.subdomains?.length ? "Found" : "Manual",
      found: subdomains,
      need: "Client or previous developer should confirm whether any staging, portal, booking, mail, app, or shop subdomains are active.",
    },
  ];
}

function buildHandoffPacket(scan) {
  const { analysis, dns } = scan;
  const accessItems = (analysis.accessNeeded || []).map((access) => access.item);
  const launchItems = (analysis.launchChecklist || []).map((item) => `${item.item}: ${item.detail}`);
  const found = [
    `Registrar: ${analysis.registrar}.`,
    `DNS provider: ${analysis.dnsProvider}.`,
    `Hosting: ${analysis.hosting.provider}.`,
    `Launch URL: ${analysis.urlStructure?.canonicalStyle || "Unknown"}${analysis.urlStructure?.preferredHost && analysis.urlStructure.preferredHost !== "Unknown" ? ` (${analysis.urlStructure.preferredHost})` : ""}.`,
    `CMS: ${analysis.cms.platform}.`,
    `Email: ${analysis.email.provider}${analysis.emailSafety?.riskLevel ? ` (${analysis.emailSafety.riskLevel} risk)` : ""}.`,
  ];

  if ((dns.subdomains || []).length > 0) {
    found.push(`${dns.subdomains.length} common subdomain(s) resolved and need owner confirmation.`);
  }

  const previousDeveloper = [
    "Confirm who last managed domain, DNS, hosting, CMS, redirects, forms, analytics, and launch/deployment.",
    "Ask whether any services live under their account and need transfer, collaborator access, or billing handoff.",
    "Request current backups, deployment notes, DNS zone export, redirect rules, and rollback contacts.",
  ];

  if (analysis.hosting.provider === "Unknown" || analysis.hosting.provider === "Hidden behind Cloudflare") {
    previousDeveloper.unshift("Ask where the origin website is actually hosted and who can grant access.");
  }

  return {
    found,
    needs: accessItems.slice(0, 10),
    previousDeveloper,
    beforeLaunch: launchItems.slice(0, 8),
  };
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

  if (urlStructure.issues?.length) {
    lines.push("- **Redirect QA:**");
    for (const issue of urlStructure.issues) {
      lines.push(`  - **${issue.severity}:** ${issue.summary} ${issue.detail}`);
    }
  } else {
    lines.push("- **Redirect QA:** Apex/www variants look consistent in first-pass checks.");
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
