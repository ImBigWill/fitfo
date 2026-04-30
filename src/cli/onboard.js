import { absoluteOutputPath, resolveOutputPath } from "./reports.js";
import { createTheme } from "../theme.js";
import { kv, panel, renderSurface } from "../ui.js";

export function shouldAskForOnboardLocation(options = {}) {
  return Boolean(options.command === "onboard" && options.search && !options.location);
}

export function shouldAskForOnboardVault(options = {}) {
  return Boolean(
    options.command === "onboard"
    && !options.out
    && !options.vault
    && !options.noSave
    && (options.onboardFileFormat || "obsidian") === "obsidian"
  );
}

export function shouldPromptForOnboardDetails(options = {}, io = {}) {
  return Boolean(
    options.command === "onboard"
    && !options.quiet
    && io.inputIsTTY === true
    && io.outputIsTTY === true
    && (shouldAskForOnboardLocation(options) || shouldAskForOnboardVault(options))
  );
}

export function applyOnboardPromptAnswers(options = {}, answers = {}) {
  const next = { ...options };
  preserveProvided(options, next);

  const location = cleanAnswer(answers.location);
  const vault = cleanAnswer(answers.vault);

  if (location) {
    next.location = location;
  }

  if (vault) {
    next.vault = vault;
  }

  return next;
}

export function defaultOnboardVault(options = {}) {
  return options.vault || "fitfo-reports";
}

export function applyOnboardRuntimeDefaults(options = {}) {
  if (options.command !== "onboard") {
    return options;
  }

  const explicitFormat = provided(options, "format");
  const next = {
    ...options,
    deep: true,
    search: true,
    wayback: true,
    save: !options.noSave,
    onboard: true,
    onboardFileFormat: explicitFormat ? options.format : "obsidian",
  };
  preserveProvided(options, next);

  if (next.noSave) {
    next.exportTables = null;
    return next;
  }

  if (!next.exportTables) {
    next.exportTables = "fitfo-exports";
  }

  return next;
}

export function renderOnboardSummary(domain, options = {}, display = {}) {
  const theme = createTheme(display.color !== false);
  const outputPath = options.noSave
    ? "Terminal only"
    : absoluteOutputPath(resolveOutputPath({ domain: { apex: domain }, finishedAt: new Date(0).toISOString() }, options));
  const tablePath = options.exportTables ? absoluteOutputPath(options.exportTables) : "Disabled";
  const mode = options.preview ? "preview only; no scan will run" : "full scan will run";

  return renderSurface(theme, [
    panel(theme, options.preview ? "Onboard Preview" : "Onboard Run", [
      kv(theme, "Domain", theme.value(domain || "Unknown")),
      kv(theme, "Mode", theme.dim(mode)),
      kv(theme, "Location", options.location ? theme.value(options.location) : theme.dim("Not set")),
      kv(theme, "Report", theme.value(outputPath)),
      kv(theme, "Tables", options.noSave ? theme.dim("Disabled by --no-save") : theme.value(tablePath)),
      kv(theme, "Deep", options.deep ? theme.ok("Enabled") : theme.dim("Disabled")),
      kv(theme, "Search", options.search ? theme.ok("Enabled") : theme.dim("Disabled")),
      kv(theme, "Wayback", options.wayback ? theme.ok("Enabled") : theme.dim("Disabled")),
    ]),
  ].join("\n"));
}

function cleanAnswer(value) {
  return String(value || "").trim();
}

function provided(options, key) {
  return options.provided instanceof Set && options.provided.has(key);
}

function preserveProvided(source, target) {
  if (source.provided instanceof Set) {
    Object.defineProperty(target, "provided", {
      value: new Set(source.provided),
      enumerable: false,
    });
  }
}
