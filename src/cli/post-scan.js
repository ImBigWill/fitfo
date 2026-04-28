import { homedir } from "node:os";
import path from "node:path";

const SAVE_DESTINATIONS = new Set(["desktop", "obsidian", "custom"]);
const SAVE_FORMATS = new Set(["text", "markdown", "obsidian"]);

export function shouldPromptForReportSave(options, env = process.env, streams = process) {
  return Boolean(
    options.format === "text"
      && !options.quiet
      && !options.save
      && !options.out
      && !options.obsidian
      && !env.CI
      && streams.stdin?.isTTY
      && streams.stdout?.isTTY,
  );
}

export function normalizeSaveFormat(value) {
  const format = String(value || "markdown").trim().toLowerCase();
  if (format === "md") return "markdown";
  if (SAVE_FORMATS.has(format)) return format;
  throw new Error(`Unsupported save format "${value}". Use text, markdown, or obsidian.`);
}

export function normalizeSaveDestination(value) {
  const destination = String(value || "desktop").trim().toLowerCase();
  if (destination === "d") return "desktop";
  if (destination === "o" || destination === "vault") return "obsidian";
  if (destination === "c" || destination === "path") return "custom";
  if (SAVE_DESTINATIONS.has(destination)) return destination;
  throw new Error(`Unsupported save destination "${value}". Use desktop, obsidian, or custom.`);
}

export function defaultDesktopReportPath(scan) {
  const stamp = scan.finishedAt.replace(/[:.]/g, "-");
  return path.join(homedir(), "Desktop", `${scan.domain.apex}-${stamp}.md`);
}
