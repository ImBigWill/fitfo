import { createTheme } from "../theme.js";
import { plainCloudflareStatus } from "../handoff.js";
import { commandHint, kv, panel, renderSurface } from "../ui.js";

export function renderRunStart(domain, options = {}) {
  const theme = createTheme(options.color !== false);
  const report = options.report === "brief" ? "First-call brief" : options.report === "plan" ? "Client build plan" : "Domain scan";
  const output = options.format === "text" ? "Styled terminal" : options.format;
  const depth = options.deep ? `Deep crawl, max ${options.crawlLimit || 8} pages` : "Public records + homepage";
  const research = options.search ? "Firecrawl web research" : "Not enabled";
  const subdomains = options.subdomains ? "Expanded passive checks" : "Common checks";
  const wayback = options.wayback ? "Recent homepage snapshots" : "Not enabled";

  return renderSurface(theme, [
    panel(theme, "FITFO IS WORKING", [
      kv(theme, "Target", domain),
      kv(theme, "Report", report),
      kv(theme, "Output", output),
      kv(theme, "Depth", depth),
      kv(theme, "Research", research),
      kv(theme, "Subdomains", subdomains),
      kv(theme, "Wayback", wayback),
      "",
      commandHint(theme, "RDAP", "registrar and domain status"),
      commandHint(theme, "DNS", "nameservers, email, services, subdomains"),
      commandHint(theme, "WEB", "hosting, CMS, TLS, redirects, marketing tags"),
      options.search ? commandHint(theme, "SEARCH", "market, reviews, service SERP notes") : null,
      options.wayback ? commandHint(theme, "WAYBACK", "recent archived versions and change flags") : null,
    ]),
  ].join("\n"));
}

export function renderSavedMessage(outputPath, options = {}) {
  const theme = createTheme(options.color !== false);
  return theme.surface(`${theme.blue("saved")} ${theme.value(outputPath)}`);
}

export function renderRunRecap(scan, result = {}, options = {}) {
  const theme = createTheme(options.color !== false);
  const analysis = scan.analysis || {};
  const unknowns = [
    analysis.registrar === "Unknown" ? "registrar" : null,
    analysis.dnsProvider === "Unknown" ? "DNS owner" : null,
    !analysis.hosting?.provider || analysis.hosting.provider === "Unknown" || analysis.hosting.provider === "Hidden behind Cloudflare" ? "origin hosting" : null,
    analysis.email?.provider === "Unknown" ? "email provider" : null,
    analysis.urlStructure?.canonicalStyle === "Unknown" ? "canonical launch URL" : null,
  ].filter(Boolean);

  return renderSurface(theme, [
    panel(theme, "Run Recap", [
      kv(theme, "Report", result.reportPath ? theme.value(result.reportPath) : theme.dim("Terminal only")),
      kv(theme, "Tables", result.tablePath ? theme.value(result.tablePath) : theme.dim("Not exported")),
      kv(theme, "Cloudflare", analysis.cloudflare ? `${plainCloudflareStatus(scan)} (${analysis.cloudflare.confidence})` : "Unknown"),
      kv(theme, "Top unknowns", unknowns.length ? unknowns.join(", ") : theme.ok("No major ownership unknowns in public scan")),
      kv(theme, "Next", unknowns.length
        ? "Use the Go Get These Logins and Do Not Touch sections before changing DNS or launch settings."
        : "Confirm access ownership with the client before making changes."),
    ]),
  ].join("\n"));
}
