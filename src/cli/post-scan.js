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
