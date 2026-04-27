import { createTheme } from "../theme.js";
import { kv, panel, renderSurface } from "../ui.js";

export function renderRunStart(domain, options = {}) {
  const theme = createTheme(options.color !== false);
  const report = options.report === "brief" ? "First-call brief" : "Domain scan";
  const output = options.format === "text" ? "Styled terminal" : options.format;

  return renderSurface(theme, [
    panel(theme, "FITFO IS WORKING", [
      kv(theme, "Target", domain),
      kv(theme, "Report", report),
      kv(theme, "Output", output),
      "",
      `${theme.bullet("›")} ${theme.dim("Checking RDAP, DNS, website, TLS, redirects, email, CMS, marketing tags, and common subdomains.")}`,
    ]),
  ].join("\n"));
}

export function renderSavedMessage(outputPath, options = {}) {
  const theme = createTheme(options.color !== false);
  return theme.surface(`${theme.blue("saved")} ${theme.value(outputPath)}`);
}
