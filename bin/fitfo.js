#!/usr/bin/env node

import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { applyConfigDefaults, handleConfigCommand, loadConfig } from "../src/cli/config.js";
import { renderOutput } from "../src/cli/output.js";
import { parseArgs } from "../src/cli/options.js";
import { normalizeSaveFormat, shouldPromptForReportSave } from "../src/cli/post-scan.js";
import { resolveOutputPath, writeReport } from "../src/cli/reports.js";
import { renderRunStart, renderSavedMessage } from "../src/cli/status.js";
import { renderDoctor } from "../src/doctor.js";
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
  domainArg = options.domain;

  if (!domainArg) {
    domainArg = await promptForDomain({ color: !noColor, version: APP_VERSION });
  }

  if (shouldRenderRunStart(options)) {
    console.log(renderRunStart(domainArg, {
      color: !noColor,
      format: options.format,
      report: options.command,
      deep: options.deep,
      crawlLimit: options.crawlLimit,
      search: options.search,
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
  });
  const terminalOutput = renderOutput(scan, {
    color: !noColor,
    format: options.format,
    obsidian: options.obsidian,
    report: options.command,
  });

  if (!options.quiet) {
    console.log(terminalOutput);
  }

  const outputPath = resolveOutputPath(scan, options);
  if (outputPath) {
    await saveReport(scan, outputPath, options);
    console.log(options.quiet ? `Saved FITFO report to ${outputPath}` : `\n${renderSavedMessage(outputPath, { color: !noColor })}`);
  } else if (shouldPromptForReportSave(options)) {
    await promptForReportSave(scan, options, { color: !noColor });
  }
} catch (error) {
  console.error(`\nFITFO failed: ${error.message}`);
  process.exit(1);
}

async function saveReport(scan, outputPath, options) {
  const fileOutput = renderOutput(scan, {
    color: false,
    format: options.format,
    obsidian: options.obsidian,
    report: options.command,
  });
  await writeReport(outputPath, fileOutput);
}

function shouldRenderRunStart(options) {
  return !options.quiet && options.format === "text";
}

async function promptForDomain(options = {}) {
  const theme = createTheme(options.color !== false);
  const rl = readline.createInterface({ input, output });

  console.log(renderPromptIntro({ color: options.color !== false, version: options.version }));
  console.log("");

  try {
    const prompt = theme.surface(`${theme.hotChip("DOMAIN")} ${theme.prompt("fitfo >")} `);
    const answer = await rl.question(prompt);
    const domain = answer.trim();
    if (!domain) {
      throw new Error("A domain is required.");
    }
    return domain;
  } catch (error) {
    if (error.code === "ABORT_ERR") {
      console.log(`\n${theme.dim("FITFO cancelled.")}`);
      process.exit(130);
    }
    throw error;
  } finally {
    rl.close();
  }
}

async function promptForReportSave(scan, options = {}, display = {}) {
  const theme = createTheme(display.color !== false);
  const rl = readline.createInterface({ input, output });

  try {
    const shouldSave = await rl.question(theme.surface(`${theme.hotChip("SAVE")} ${theme.prompt("Save findings?")} ${theme.dim("[y/N]")} `));
    if (!/^y(es)?$/i.test(shouldSave.trim())) {
      return;
    }

    const formatAnswer = await rl.question(theme.surface(`${theme.blueChip("FORMAT")} ${theme.prompt("text, markdown, or obsidian")} ${theme.dim("[markdown]")} `));
    const format = normalizeSaveFormat(formatAnswer || "markdown");
    const saveOptions = {
      ...options,
      format,
      obsidian: format === "obsidian",
      save: true,
      out: null,
    };
    const suggestedPath = resolveOutputPath(scan, saveOptions);
    const pathAnswer = await rl.question(theme.surface(`${theme.hotChip("PATH")} ${theme.prompt("where should FITFO save it?")} ${theme.dim(`[${suggestedPath}]`)} `));
    const outputPath = pathAnswer.trim() || suggestedPath;

    await saveReport(scan, outputPath, saveOptions);
    console.log(`\n${renderSavedMessage(outputPath, { color: display.color !== false })}`);
  } catch (error) {
    if (error.code === "ABORT_ERR") {
      console.log(`\n${theme.dim("FITFO save prompt cancelled.")}`);
      return;
    }
    throw error;
  } finally {
    rl.close();
  }
}
