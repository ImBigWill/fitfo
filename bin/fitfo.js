#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { renderDoctor } from "../src/doctor.js";
import { scanDomain } from "../src/index.js";
import { renderHelp, renderPromptIntro } from "../src/help.js";
import { APP_VERSION } from "../src/meta.js";
import { renderMarkdownReport, renderTextReport } from "../src/report.js";
import { createTheme } from "../src/theme.js";

const args = process.argv.slice(2);
const options = parseArgs(args);
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

if (!domainArg) {
  domainArg = await promptForDomain({ color: !noColor, version: APP_VERSION });
}

try {
  const scan = await scanDomain(domainArg);
  const terminalOutput = renderOutput(scan, {
    color: !noColor,
    format: options.format,
    obsidian: options.obsidian,
  });

  console.log(terminalOutput);

  const outputPath = options.out || (options.save || options.obsidian ? defaultReportPath(scan, options.format, options.obsidian) : null);
  if (outputPath) {
    const fileOutput = renderOutput(scan, {
      color: false,
      format: options.format,
      obsidian: options.obsidian,
    });
    await writeReport(outputPath, fileOutput);
    console.log(`\nSaved FITFO report to ${outputPath}`);
  }
} catch (error) {
  console.error(`FITFO failed: ${error.message}`);
  process.exit(1);
}

async function promptForDomain(options = {}) {
  const theme = createTheme(options.color !== false);
  const rl = readline.createInterface({ input, output });

  console.log(renderPromptIntro({ color: options.color !== false, version: options.version }));
  console.log("");

  try {
    const prompt = theme.surface(`${theme.prompt("› Domain to FITFO:")} `);
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

function parseArgs(argv) {
  const options = {
    command: "scan",
    domain: null,
    help: false,
    json: false,
    format: "text",
    noColor: false,
    obsidian: false,
    out: null,
    save: false,
    version: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--help" || arg === "-h") {
      options.help = true;
    } else if (arg === "--version" || arg === "-v") {
      options.version = true;
    } else if (arg === "--json") {
      options.json = true;
      options.format = "json";
    } else if (arg === "--no-color") {
      options.noColor = true;
    } else if (arg === "--format" || arg === "-f") {
      const value = argv[index + 1];
      if (!value || value.startsWith("-")) {
        throw new Error(`${arg} requires text, markdown, obsidian, or json.`);
      }
      options.format = normalizeFormat(value);
      options.json = options.format === "json";
      options.obsidian = options.format === "obsidian";
      index += 1;
    } else if (arg === "--markdown" || arg === "--md") {
      options.format = "markdown";
    } else if (arg === "--obsidian") {
      options.format = "obsidian";
      options.obsidian = true;
    } else if (arg === "--save") {
      options.save = true;
    } else if (arg === "--out" || arg === "-o") {
      const value = argv[index + 1];
      if (!value || value.startsWith("-")) {
        throw new Error(`${arg} requires a file path.`);
      }
      options.out = value;
      index += 1;
    } else if ((arg === "scan" || arg === "doctor" || arg === "version") && !options.domain) {
      if (arg === "version") {
        options.version = true;
      } else {
        options.command = arg;
      }
    } else if (!arg.startsWith("-") && !options.domain) {
      options.domain = arg;
    }
  }

  return options;
}

function renderOutput(scan, options) {
  if (options.format === "json") {
    return `${JSON.stringify(scan, null, 2)}\n`;
  }

  if (options.format === "markdown" || options.format === "obsidian") {
    return renderMarkdownReport(scan, { obsidian: options.obsidian });
  }

  return `${renderTextReport(scan, { color: options.color })}\n`;
}

function normalizeFormat(value) {
  const format = value.toLowerCase();
  if (format === "md") return "markdown";
  if (["text", "markdown", "obsidian", "json"].includes(format)) return format;
  throw new Error(`Unsupported format "${value}". Use text, markdown, obsidian, or json.`);
}

function defaultReportPath(scan, format, obsidian) {
  const extension = format === "json" ? "json" : format === "markdown" || format === "obsidian" || obsidian ? "md" : "txt";
  const stamp = scan.finishedAt.replace(/[:.]/g, "-");
  return path.join("fitfo-reports", `${scan.domain.apex}-${stamp}.${extension}`);
}

async function writeReport(outputPath, content) {
  const directory = path.dirname(outputPath);
  if (directory && directory !== ".") {
    await mkdir(directory, { recursive: true });
  }
  await writeFile(outputPath, content, "utf8");
}
