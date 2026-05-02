#!/usr/bin/env node

import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { applyConfigDefaults, handleConfigCommand, loadConfig } from "../src/cli/config.js";
import { applyOnboardPromptAnswers, applyOnboardRuntimeDefaults, defaultOnboardVault, renderOnboardSummary, shouldAskForOnboardLocation, shouldAskForOnboardVault, shouldPromptForOnboardDetails } from "../src/cli/onboard.js";
import { renderOutput } from "../src/cli/output.js";
import { hasProvidedOption, parseArgs } from "../src/cli/options.js";
import { defaultDesktopReportPath, normalizeSaveDestination, normalizeSaveFormat, promptedReportFileName, resolvePromptedOutputPath, shouldPromptForReportSave } from "../src/cli/post-scan.js";
import { absoluteOutputPath, resolveOutputPath, writeReport } from "../src/cli/reports.js";
import { renderRunRecap, renderRunStart, renderSavedMessage } from "../src/cli/status.js";
import { applyWizardIntent, normalizeWizardIntent, shouldAskForWizardLocation, WIZARD_INTENTS } from "../src/cli/wizard.js";
import { renderDoctor } from "../src/doctor.js";
import { writeTableExports } from "../src/exports/tables.js";
import { scanDomain } from "../src/index.js";
import { renderHelp, renderPromptIntro } from "../src/help.js";
import { APP_VERSION } from "../src/meta.js";
import { createTheme } from "../src/theme.js";

const args = process.argv.slice(2);
let options;
try {
  options = parseArgs(args);
} catch (error) {
  console.error(`FITFO failed: ${error.message}`);
  process.exit(1);
}
options.vault ||= process.env.FITFO_OBSIDIAN_DIR || null;
const noColor = options.noColor || process.env.NO_COLOR;
let domainArg = options.domain;

if (options.help) {
  console.log(renderHelp({ color: !noColor, version: APP_VERSION }));
  process.exit(0);
}

if (options.version) {
  console.log(APP_VERSION);
  process.exit(0);
}

if (options.command === "doctor") {
  console.log(renderDoctor({ color: !noColor }));
  process.exit(0);
}

try {
  if (options.command === "config") {
    process.stdout.write(await handleConfigCommand(options.configArgs));
    process.exit(0);
  }

  options = applyConfigDefaults(options, await loadConfig());
  options.vault ||= process.env.FITFO_OBSIDIAN_DIR || null;
  options = applyOnboardRuntimeDefaults(options);
  domainArg = options.domain;

  if (!domainArg) {
    const wizard = await promptForWizard(options, { color: !noColor, version: APP_VERSION });
    domainArg = wizard.domain;
    options = wizard.options;
  }

  if (shouldPromptForOnboardDetails(options, { inputIsTTY: input.isTTY, outputIsTTY: output.isTTY })) {
    options = await promptForOnboardDetails(options, { color: !noColor });
  }

  if (options.command === "onboard" && !options.quiet) {
    console.log(renderOnboardSummary(domainArg, options, { color: !noColor }));
    console.log("");
  }

  if (options.preview) {
    process.exit(0);
  }

  if (shouldRenderRunStart(options)) {
    console.log(renderRunStart(domainArg, {
      color: !noColor,
      format: options.format,
      report: options.command,
      deep: options.deep,
      crawlLimit: options.crawlLimit,
      search: options.search,
      wayback: options.wayback,
    }));
    console.log("");
  }

  const scan = await scanDomain(domainArg, {
    deep: options.deep,
    crawlLimit: options.crawlLimit,
    search: options.search,
    researchProvider: options.researchProvider,
    searchLimit: options.searchLimit,
    location: options.location,
    country: options.country,
    wayback: options.wayback,
    waybackLimit: options.waybackLimit,
    waybackVersions: options.waybackVersions,
    vertical: options.vertical,
  });
  const terminalOutput = renderOutput(scan, terminalRenderOptions(options, !noColor));

  if (!options.quiet) {
    console.log(terminalOutput);
  }

  const outputPath = resolveOutputPath(scan, options);
  let savedReportPath = null;
  let tableExportPath = null;
  if (outputPath) {
    const savedPath = await saveReport(scan, outputPath, options);
    savedReportPath = savedPath;
    console.log(options.quiet ? `Saved FITFO report to ${savedPath}` : `\n${renderSavedMessage(savedPath, { color: !noColor })}`);
  } else if (shouldPromptForReportSave(options)) {
    savedReportPath = await promptForReportSave(scan, options, { color: !noColor });
  }

  if (options.exportTables) {
    const exportResult = await writeTableExports(scan, {
      dir: options.exportTables,
      report: options.command,
    });
    tableExportPath = exportResult.directory;
    console.log(options.quiet ? `Saved FITFO table exports to ${exportResult.directory}` : renderSavedMessage(exportResult.directory, { color: !noColor }));
  }

  if (!options.quiet) {
    console.log("");
    console.log(renderRunRecap(scan, {
      reportPath: savedReportPath,
      tablePath: tableExportPath,
    }, { color: !noColor }));
  }
} catch (error) {
  console.error(`\nFITFO failed: ${error.message}`);
  process.exit(1);
}

function terminalRenderOptions(options, color) {
  if (options.command !== "onboard") {
    return {
      color,
      format: options.format,
      obsidian: options.obsidian,
      report: options.command,
      clientSafe: options.clientSafe,
      agentReady: options.agentReady,
    };
  }

  if (hasProvidedOption(options, "format") && options.format === "json") {
    return {
      color,
      format: options.format,
      obsidian: options.obsidian,
      report: options.command,
      clientSafe: options.clientSafe,
      agentReady: options.agentReady,
    };
  }

  return {
    color,
    format: "text",
    obsidian: false,
    report: "plan",
    clientSafe: options.clientSafe,
    agentReady: options.agentReady,
  };
}

async function saveReport(scan, outputPath, options) {
  const onboardFileFormat = options.command === "onboard" ? options.onboardFileFormat : null;
  const fileOptions = onboardFileFormat
    ? { ...options, command: "plan", format: onboardFileFormat, obsidian: onboardFileFormat === "obsidian" }
    : options;
  const fileOutput = renderOutput(scan, {
    color: false,
    format: fileOptions.format,
    obsidian: fileOptions.obsidian,
    report: fileOptions.command,
    clientSafe: fileOptions.clientSafe,
    agentReady: fileOptions.agentReady,
  });
  return writeReport(outputPath, fileOutput);
}

function shouldRenderRunStart(options) {
  if (options.command === "onboard" && !(hasProvidedOption(options, "format") && options.format === "json")) {
    return !options.quiet;
  }

  return !options.quiet && options.format === "text";
}

async function promptForWizard(baseOptions = {}, display = {}) {
  const color = display.color !== false;
  const themed = createTheme(color);
  const rl = readline.createInterface({ input, output });

  console.log(renderPromptIntro({ color, version: display.version }));
  console.log("");

  try {
    const domainAnswer = await rl.question(themed.surface(`${themed.hotChip("DOMAIN")} ${themed.prompt("client domain?")} `));
    const domain = domainAnswer.trim();
    if (!domain) {
      throw new Error("A domain is required.");
    }

    console.log("");
    console.log(formatWizardChoices(themed));
    const intentAnswer = await rl.question(themed.surface(`${themed.hotChip("MODE")} ${themed.prompt("what are we making?")} ${themed.dim("[3]")} `));
    const intent = normalizeWizardIntent(intentAnswer || "3");
    let nextOptions = applyWizardIntent(baseOptions, intent);

    if (shouldAskForWizardLocation(nextOptions)) {
      const locationAnswer = await rl.question(themed.surface(`${themed.blueChip("LOCAL")} ${themed.prompt("market/location?")} ${themed.dim("[skip]")} `));
      nextOptions = {
        ...nextOptions,
        location: locationAnswer.trim() || nextOptions.location,
      };
    }

    return {
      domain,
      options: nextOptions,
    };
  } catch (error) {
    if (error.code === "ABORT_ERR") {
      console.log(`\n${themed.dim("FITFO cancelled.")}`);
      process.exit(130);
    }
    throw error;
  } finally {
    rl.close();
  }
}

async function promptForOnboardDetails(baseOptions = {}, display = {}) {
  const theme = createTheme(display.color !== false);
  const rl = readline.createInterface({ input, output });
  const answers = {};

  try {
    if (shouldAskForOnboardLocation(baseOptions)) {
      answers.location = await rl.question(theme.surface(`${theme.blueChip("LOCAL")} ${theme.prompt("market/location?")} ${theme.dim("[skip]")} `));
    }

    if (shouldAskForOnboardVault(baseOptions)) {
      const defaultVault = defaultOnboardVault(baseOptions);
      answers.vault = await rl.question(theme.surface(`${theme.hotChip("VAULT")} ${theme.prompt("Obsidian vault/folder?")} ${theme.dim(`[${absoluteOutputPath(defaultVault)}]`)} `));
      answers.vault = answers.vault.trim() || defaultVault;
    }

    return applyOnboardPromptAnswers(baseOptions, answers);
  } catch (error) {
    if (error.code === "ABORT_ERR") {
      console.log(`\n${theme.dim("FITFO onboard prompt cancelled.")}`);
      process.exit(130);
    }
    throw error;
  } finally {
    rl.close();
  }
}

function formatWizardChoices(theme) {
  return WIZARD_INTENTS.map((intent) => (
    theme.surface(`${theme.prompt(`${intent.choice}.`)} ${theme.label(intent.label)}\n   ${theme.dim(intent.description)}`)
  )).join("\n");
}

async function promptForReportSave(scan, options = {}, display = {}) {
  const theme = createTheme(display.color !== false);
  const rl = readline.createInterface({ input, output });

  try {
    const shouldSave = await rl.question(theme.surface(`${theme.hotChip("SAVE")} ${theme.prompt("Save findings?")} ${theme.dim("[y/N]")} `));
    if (!/^y(es)?$/i.test(shouldSave.trim())) {
      return;
    }

    const destinationAnswer = await rl.question(theme.surface(`${theme.blueChip("WHERE")} ${theme.prompt("desktop, obsidian, or custom?")} ${theme.dim("[desktop]")} `));
    const destination = normalizeSaveDestination(destinationAnswer || "desktop");

    const saveOptions = {
      ...options,
      format: "markdown",
      obsidian: destination === "obsidian",
      save: true,
      out: null,
    };
    let suggestedPath = defaultDesktopReportPath(scan);

    if (destination === "obsidian") {
      const defaultVault = saveOptions.vault || "fitfo-reports";
      const vaultAnswer = await rl.question(theme.surface(`${theme.blueChip("OBSIDIAN")} ${theme.prompt("vault/folder?")} ${theme.dim(`[${absoluteOutputPath(defaultVault)}]`)} `));
      saveOptions.vault = vaultAnswer.trim() || defaultVault;
      suggestedPath = absoluteOutputPath(resolveOutputPath(scan, saveOptions));
    } else if (destination === "custom") {
      const formatAnswer = await rl.question(theme.surface(`${theme.blueChip("FORMAT")} ${theme.prompt("text or markdown?")} ${theme.dim("[markdown]")} `));
      const format = normalizeSaveFormat(formatAnswer || "markdown");
      saveOptions.format = format === "obsidian" ? "markdown" : format;
      saveOptions.obsidian = false;
      suggestedPath = absoluteOutputPath(promptedReportFileName(scan, saveOptions.format));
    }

    const pathAnswer = await rl.question(theme.surface(`${theme.hotChip("FILE")} ${theme.prompt("file path?")} ${theme.dim(`[Enter = ${suggestedPath}]`)} `));
    const outputPath = resolvePromptedOutputPath(pathAnswer, suggestedPath);
    if (!outputPath) {
      console.log(theme.dim("FITFO save skipped."));
      return;
    }

    const savedPath = await saveReport(scan, outputPath, saveOptions);
    console.log(`\n${renderSavedMessage(savedPath, { color: display.color !== false })}`);
    return savedPath;
  } catch (error) {
    if (error.code === "ABORT_ERR") {
      console.log(`\n${theme.dim("FITFO save prompt cancelled.")}`);
      return null;
    }
    throw error;
  } finally {
    rl.close();
  }
}
