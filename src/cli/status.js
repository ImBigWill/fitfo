import { createTheme } from "../theme.js";
import { commandHint, kv, panel, renderSurface } from "../ui.js";

export function renderRunStart(domain, options = {}) {
  const theme = createTheme(options.color !== false);
  const report = options.report === "brief" ? "First-call brief" : "Domain scan";
  const output = options.format === "text" ? "Styled terminal" : options.format;
  const depth = options.deep ? `Deep crawl, max ${options.crawlLimit || 8} pages` : "Public records + homepage";

  return renderSurface(theme, [
    panel(theme, "FITFO IS WORKING", [
      kv(theme, "Target", domain),
      kv(theme, "Report", report),
      kv(theme, "Output", output),
      kv(theme, "Depth", depth),
      "",
      commandHint(theme, "RDAP", "registrar and domain status"),
      commandHint(theme, "DNS", "nameservers, email, services, subdomains"),
      commandHint(theme, "WEB", "hosting, CMS, TLS, redirects, marketing tags"),
    ]),
  ].join("\n"));
}

export function renderSavedMessage(outputPath, options = {}) {
  const theme = createTheme(options.color !== false);
  return theme.surface(`${theme.blue("saved")} ${theme.value(outputPath)}`);
}
