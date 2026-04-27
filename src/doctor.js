import { APP_LICENSE, APP_NAME, APP_PRIVATE, APP_VERSION } from "./meta.js";
import { createTheme } from "./theme.js";
import { kv, panel, renderAppHeader, renderSurface } from "./ui.js";

export function renderDoctor(options = {}) {
  const theme = createTheme(options.color !== false);
  const checks = getChecks();

  return renderSurface(theme, [
    renderAppHeader(theme, {
      mode: "doctor",
      scope: "local environment and project readiness",
      version: APP_VERSION,
    }),
    "",
    panel(theme, "Doctor", [
      kv(theme, "Node", process.version),
      kv(theme, "Platform", `${process.platform} ${process.arch}`),
      kv(theme, "License", APP_LICENSE),
      kv(theme, "Private", APP_PRIVATE ? "true" : "false"),
    ]),
    "",
    panel(theme, "Checks", checks.map((check) => `${statusIcon(theme, check.ok)} ${theme.label(check.label)} ${theme.dim(check.detail)}`)),
    "",
    panel(theme, "Next", [
      `${theme.bullet("›")} ${theme.value("fitfo clientdomain.com")} ${theme.dim("run a scan")}`,
      `${theme.bullet("›")} ${theme.value("fitfo --help")} ${theme.dim("view commands")}`,
      `${theme.bullet("›")} ${theme.value("npm run check")} ${theme.dim("syntax-check the project")}`,
    ]),
  ].join("\n"));
}

function getChecks() {
  const major = Number(process.versions.node.split(".")[0]);

  return [
    {
      label: "Node >=20",
      ok: major >= 20,
      detail: major >= 20 ? "runtime supports built-in fetch and ESM" : "upgrade Node before running FITFO",
    },
    {
      label: "fetch available",
      ok: typeof globalThis.fetch === "function",
      detail: typeof globalThis.fetch === "function" ? "network lookups can use built-in fetch" : "fetch is missing",
    },
    {
      label: "private package",
      ok: APP_PRIVATE,
      detail: APP_PRIVATE ? "npm publish is blocked for now" : "package can be published",
    },
    {
      label: `${APP_NAME} version`,
      ok: true,
      detail: APP_VERSION,
    },
  ];
}

function statusIcon(theme, ok) {
  return ok ? theme.ok("[ok]") : theme.bad("[fail]");
}
