import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export function defaultReportPath(scan, format, obsidian) {
  const extension = format === "json" ? "json" : format === "markdown" || format === "obsidian" || obsidian ? "md" : "txt";
  const stamp = scan.finishedAt.replace(/[:.]/g, "-");
  return path.join("fitfo-reports", `${scan.domain.apex}-${stamp}.${extension}`);
}

export function resolveOutputPath(scan, options) {
  return options.out || (options.save || options.obsidian ? defaultReportPath(scan, options.format, options.obsidian) : null);
}

export async function writeReport(outputPath, content) {
  const directory = path.dirname(outputPath);
  if (directory && directory !== ".") {
    await mkdir(directory, { recursive: true });
  }
  await writeFile(outputPath, content, "utf8");
}
