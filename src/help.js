import { createTheme } from "./theme.js";
import { kv, panel, renderAppHeader, renderSurface } from "./ui.js";

export function renderHelp(options = {}) {
  const theme = createTheme(options.color !== false);
  const version = options.version || "0.1.0";

  return renderSurface(theme, [
    renderAppHeader(theme, { mode: "onboarding intelligence", motto: "Kickstarting onboarding.", version }),
    "",
    panel(theme, "Run FITFO", [
      `${theme.label("Figure It The Fuck Out")}`,
      theme.dim("Find Infrastructure, Tech & Footprint Overview"),
      theme.tagline("Kickstarting onboarding."),
      "",
      kv(theme, "Usage", `${theme.value("fitfo <domain>")} ${theme.dim("[options]")}`),
      kv(theme, "Options", theme.dim("--json  --markdown  --obsidian")),
      kv(theme, "", theme.dim("--no-color  --save  --out file")),
    ]),
    "",
    panel(theme, "Commands", [
      kv(theme, "scan", `${theme.value("fitfo lght.co")} ${theme.dim("- styled Domain Brief")}`),
      kv(theme, "brief", `${theme.value("fitfo brief lght.co")} ${theme.dim("- first-call prep")}`),
      kv(theme, "prompt", `${theme.value("fitfo")} ${theme.dim("- ask for the domain")}`),
      kv(theme, "doctor", `${theme.value("fitfo doctor")} ${theme.dim("- check local setup")}`),
      kv(theme, "version", `${theme.value("fitfo --version")} ${theme.dim("- print CLI version")}`),
      kv(theme, "save", `${theme.value("fitfo lght.co --save")} ${theme.dim("- timestamped report")}`),
      kv(theme, "out", `${theme.value("fitfo lght.co -o report.txt")} ${theme.dim("- specific file")}`),
      kv(theme, "markdown", `${theme.value("fitfo lght.co --markdown")} ${theme.dim("- Markdown report")}`),
      kv(theme, "obsidian", `${theme.value("fitfo lght.co --obsidian")} ${theme.dim("- Obsidian note")}`),
      kv(theme, "json", `${theme.value("fitfo lght.co --json")} ${theme.dim("- machine-readable data")}`),
    ]),
    "",
    panel(theme, "Checks", [
      `${theme.bullet("›")} Registrar and RDAP`,
      `${theme.bullet("›")} Nameservers, DNS, MX, SPF, DMARC, DNSSEC`,
      `${theme.bullet("›")} Cloudflare, hosting, CMS, and email hints`,
      `${theme.bullet("›")} First-call brief scaffold for research and client questions`,
      `${theme.bullet("›")} Client access checklist and previous-developer request`,
    ]),
  ].join("\n"));
}

export function renderPromptIntro(options = {}) {
  const theme = createTheme(options.color !== false);
  const version = options.version || "0.1.0";

  return renderSurface(theme, [
    renderAppHeader(theme, { mode: "interactive intake", motto: "Kickstarting onboarding.", version }),
    "",
    panel(theme, "Kickstart Intake", [
      `${theme.label("Paste a client domain.")}`,
      "",
      `${theme.bullet("›")} ${theme.value("clientdomain.com")} is best`,
      `${theme.bullet("›")} ${theme.dim("https:// and paths are accepted, but not required")}`,
      `${theme.bullet("›")} ${theme.dim("FITFO checks domain records, DNS, hosting, CMS, and email clues")}`,
    ]),
  ].join("\n"));
}
