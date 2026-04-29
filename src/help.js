import { createTheme } from "./theme.js";
import { commandHint, kv, panel, renderAppHeader, renderLaunchScreen, renderSurface } from "./ui.js";

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
      kv(theme, "Guided", `${theme.value("fitfo")} ${theme.dim("- choose scan, handoff, kickoff brief, or plan")}`),
      kv(theme, "Full", `${theme.value("fitfo onboard <domain>")} ${theme.dim("- full intake + action plan")}`),
      kv(theme, "Options", theme.dim("--json  --markdown  --obsidian")),
      kv(theme, "", theme.dim("--deep  --search  --location city  --crawl-limit n")),
      kv(theme, "", theme.dim("--search-limit n  --no-color")),
      kv(theme, "", theme.dim("--save  --quiet  --vault dir  --out file")),
      kv(theme, "", theme.dim("--export-tables dir")),
    ]),
    "",
    panel(theme, "Commands", [
      kv(theme, "scan", `${theme.value("fitfo lght.co")} ${theme.dim("- styled Domain Brief")}`),
      kv(theme, "brief", `${theme.value("fitfo brief lght.co")} ${theme.dim("- first-call prep")}`),
      kv(theme, "plan", `${theme.value("fitfo plan lght.co --deep")} ${theme.dim("- build plan")}`),
      kv(theme, "onboard", `${theme.value("fitfo onboard lght.co")} ${theme.dim("- full intake note + tables")}`),
      kv(theme, "config", `${theme.value("fitfo config")} ${theme.dim("- show defaults")}`),
      kv(theme, "deep", `${theme.value("fitfo brief lght.co --deep")} ${theme.dim("- crawl site")}`),
      kv(theme, "search", `${theme.value("fitfo brief lght.co --search")} ${theme.dim("- Firecrawl research")}`),
      kv(theme, "prompt", `${theme.value("fitfo")} ${theme.dim("- guided wizard")}`),
      kv(theme, "help", `${theme.value("fitfo help")} ${theme.dim("- show this screen")}`),
      kv(theme, "doctor", `${theme.value("fitfo doctor")} ${theme.dim("- check local setup")}`),
      kv(theme, "version", `${theme.value("fitfo --version")} ${theme.dim("- print CLI version")}`),
      kv(theme, "save", `${theme.value("fitfo lght.co --save")} ${theme.dim("- timestamped report")}`),
      kv(theme, "out", `${theme.value("fitfo lght.co -o report.txt")} ${theme.dim("- specific file")}`),
      kv(theme, "quiet", `${theme.value("fitfo lght.co --out report.md --quiet")} ${theme.dim("- save only")}`),
      kv(theme, "vault", `${theme.value("fitfo brief lght.co --vault ~/Notes")} ${theme.dim("- vault note")}`),
      kv(theme, "tables", `${theme.value("fitfo brief lght.co --export-tables exports")} ${theme.dim("- CSV/JSON sidecars")}`),
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
    renderLaunchScreen(theme, { version }),
    "",
    panel(theme, "Kickstart Intake", [
      `${theme.label("Drop in the domain. FITFO will map the handoff.")}`,
      "",
      commandHint(theme, "DOMAIN", "clientdomain.com is best"),
      commandHint(theme, "URL OK", "https:// and paths are accepted"),
      commandHint(theme, "OUTPUT", "terminal report, Markdown, JSON, or Obsidian note"),
    ]),
  ].join("\n"));
}
