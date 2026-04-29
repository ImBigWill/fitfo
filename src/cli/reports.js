import { mkdir, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";

export function defaultReportPath(scan, format, obsidian) {
  const extension = format === "json" ? "json" : format === "markdown" || format === "obsidian" || obsidian ? "md" : "txt";
  const stamp = scan.finishedAt.replace(/[:.]/g, "-");
  return path.join("fitfo-reports", `${scan.domain.apex}-${stamp}.${extension}`);
}

export function resolveOutputPath(scan, options) {
  if (!options.out && options.command === "onboard") {
    const fileName = onboardFileName(scan, options);
    if (options.vault) {
      return path.join(expandHome(options.vault), fileName);
    }
    return path.join("fitfo-reports", fileName);
  }

  if (!options.out && options.obsidian && options.vault) {
    return path.join(expandHome(options.vault), obsidianFileName(scan, options));
  }

  return options.out || (options.save || options.obsidian ? defaultReportPath(scan, options.format, options.obsidian) : null);
}

export function absoluteOutputPath(outputPath) {
  return path.resolve(expandHome(outputPath));
}

export async function writeReport(outputPath, content) {
  const resolvedPath = absoluteOutputPath(outputPath);
  const directory = path.dirname(resolvedPath);
  if (directory && directory !== ".") {
    await mkdir(directory, { recursive: true });
  }
  await writeFile(resolvedPath, content, "utf8");
  return resolvedPath;
}

function obsidianFileName(scan, options) {
  const suffix = options.command === "brief" ? "-brief" : options.command === "plan" ? "-plan" : options.command === "onboard" ? "-onboard" : "";
  return `${scan.domain.apex}${suffix}.md`;
}

function onboardFileName(scan, options) {
  const format = options.onboardFileFormat || "obsidian";
  const extension = format === "json" ? "json" : format === "text" ? "txt" : "md";
  return `${scan.domain.apex}-onboard.${extension}`;
}

function expandHome(value) {
  const input = String(value || "");
  if (input === "~") return homedir();
  if (input.startsWith("~/")) return path.join(homedir(), input.slice(2));
  return input;
}
