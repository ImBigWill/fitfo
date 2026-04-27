#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { renderDoctor } from "../src/doctor.js";
import { scanDomain } from "../src/index.js";
import { renderHelp, renderPromptIntro } from "../src/help.js";
import { APP_VERSION } from "../src/meta.js";
import { renderTextReport } from "../src/report.js";
import { createTheme } from "../src/theme.js";

const args = process.argv.slice(2);
const options = parseArgs(args);
const wantsJson = options.json;
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
  const terminalOutput = wantsJson ? JSON.stringify(scan, null, 2) : renderTextReport(scan, { color: !noColor });

  if (wantsJson) {
    console.log(terminalOutput);
  } else {
    console.log(terminalOutput);
  }

  const outputPath = options.save ? defaultReportPath(scan, wantsJson) : options.out;
  if (outputPath) {
    const fileOutput = wantsJson ? `${JSON.stringify(scan, null, 2)}\n` : `${renderTextReport(scan, { color: false })}\n`;
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
    noColor: false,
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
    } else if (arg === "--no-color") {
      options.noColor = true;
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

function defaultReportPath(scan, json) {
  const extension = json ? "json" : "txt";
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
