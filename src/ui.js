const ANSI_PATTERN = /\x1b\[[0-9;]*m/g;

export const TERMINAL_WIDTH = 76;

export function stripAnsi(value) {
  return String(value).replace(ANSI_PATTERN, "");
}

export function visibleLength(value) {
  return stripAnsi(value).length;
}

export function padVisible(value, width) {
  const length = visibleLength(value);
  return length >= width ? value : `${value}${" ".repeat(width - length)}`;
}

export function renderAppHeader(theme, meta = {}) {
  const version = meta.version || "0.1.0";
  const mode = meta.mode || "domain records";
  const scope = meta.scope || "WHOIS-style RDAP + DNS + HTTP fingerprinting";
  const motto = meta.motto || "Kickstarting onboarding.";
  const width = meta.width || TERMINAL_WIDTH;
  const innerWidth = width - 4;
  const brandColumn = renderWordmark(theme).split("\n");
  const copyColumn = [
    `${theme.hotChip("FITFO")} ${theme.dim(`v${version}`)} ${theme.faint("::")} ${theme.blue("intake console")}`,
    theme.tagline(motto),
    `${theme.dim("mode")} ${theme.value(clipPlain(mode, 28))}`,
    `${theme.dim("scope")} ${theme.dim(clipPlain(scope, 31))}`,
  ];
  const masthead = columns(brandColumn, copyColumn, 3).split("\n");
  const rule = `${theme.accentBorder("━".repeat(12))}${theme.border("━".repeat(innerWidth - 24))}${theme.accentBorder("━".repeat(12))}`;

  return [
    theme.border(`╭${"─".repeat(width - 2)}╮`),
    boxLine(theme, rule, innerWidth),
    ...masthead.map((line) => boxLine(theme, line, innerWidth)),
    boxLine(theme, `${theme.faint("signal")} ${theme.title("#FF00AA")} ${theme.faint("x")} ${theme.blue("electric blue")} ${theme.faint("x")} ${theme.value("blackout")}`, innerWidth),
    theme.border(`╰${"─".repeat(width - 2)}╯`),
  ].join("\n");
}

export function renderLaunchScreen(theme, meta = {}) {
  const version = meta.version || "0.1.0";
  const width = meta.width || TERMINAL_WIDTH;
  const innerWidth = width - 4;
  const logo = renderWordmark(theme, { gradient: true }).split("\n");
  const rail = signalRail(theme, innerWidth);
  const microRail = centerVisible(theme.gradient("▰▰▰▰▰▰▰▰▰▰▰▰"), innerWidth);
  const deck = centerVisible(`${theme.hotChip("FITFO")} ${theme.dim(`v${version}`)} ${theme.faint("::")} ${theme.blue("blackout intake console")}`, innerWidth);
  const pipeline = [
    theme.hotChip("SCAN"),
    theme.faint("domain records"),
    theme.blue("→"),
    theme.blueChip("MAP"),
    theme.faint("access owners"),
    theme.blue("→"),
    theme.hotChip("BRIEF"),
    theme.faint("first call"),
  ].join(" ");

  return [
    theme.border(`╭${"─".repeat(width - 2)}╮`),
    boxLine(theme, rail, innerWidth),
    boxLine(theme, microRail, innerWidth),
    boxLine(theme, deck, innerWidth),
    boxLine(theme, "", innerWidth),
    ...logo.map((line) => boxLine(theme, centerVisible(line, innerWidth), innerWidth)),
    boxLine(theme, "", innerWidth),
    boxLine(theme, centerVisible(theme.tagline("Kickstarting onboarding."), innerWidth), innerWidth),
    boxLine(theme, centerVisible(`${theme.italic(theme.dim("Figure It The Fuck Out"))} ${theme.faint("/")} ${theme.dim("Find Infrastructure, Tech & Footprint Overview")}`, innerWidth), innerWidth),
    boxLine(theme, "", innerWidth),
    boxLine(theme, centerVisible(pipeline, innerWidth), innerWidth),
    boxLine(theme, rail, innerWidth),
    theme.border(`╰${"─".repeat(width - 2)}╯`),
  ].join("\n");
}

export function renderWordmark(theme, options = {}) {
  const lines = [
    "██████ █████ █████ █████  █████ ",
    "██       █     █   ██    ██   ██",
    "████     █     █   ████  ██   ██",
    "██       █     █   ██    ██   ██",
    "██     █████   █   ██     █████ ",
  ];

  return lines
    .map((line, index) => {
      if (options.gradient) {
        return theme.gradient(line);
      }
      return index === 2 ? theme.blue(line) : theme.title(line);
    })
    .join("\n");
}

export function panel(theme, title, lines, options = {}) {
  const width = options.width || TERMINAL_WIDTH;
  const innerWidth = width - 4;
  const normalizedLines = normalizeLines(lines, innerWidth);
  const borderLine = "─".repeat(width - 2);
  const output = [];

  if (title) {
    const titleText = ` ${stripAnsi(title).toUpperCase()} `;
    const left = "─".repeat(2);
    const right = "─".repeat(Math.max(0, width - visibleLength(titleText) - 4));
    output.push(`${theme.border("╭")}${theme.border(left)}${theme.hotChip(titleText.trim())}${theme.border(right)}${theme.border("╮")}`);
  } else {
    output.push(theme.border(`╭${borderLine}╮`));
  }

  for (const line of normalizedLines) {
    output.push(boxLine(theme, line, innerWidth));
  }

  output.push(theme.border(`╰${borderLine}╯`));
  return output.join("\n");
}

export function kv(theme, label, value, options = {}) {
  const labelWidth = options.labelWidth || 13;
  const innerWidth = options.innerWidth || TERMINAL_WIDTH - 4;
  const plainLabel = label.padEnd(labelWidth);
  const inline = `${theme.dim(plainLabel)} ${value}`;

  if (visibleLength(inline) <= innerWidth) {
    return inline;
  }

  return `${theme.dim(label)}\n  ${value}`;
}

export function numbered(theme, index, title, detail) {
  return [
    `${theme.prompt(`${index}.`)} ${theme.label(title)}`,
    `   ${theme.dim(detail)}`,
  ];
}

export function commandHint(theme, command, detail) {
  return `${theme.blueChip(command)} ${theme.dim(detail)}`;
}

export function renderSurface(theme, content, options = {}) {
  if (!theme.enabled) return content;

  const lines = String(content).split("\n");
  const width = Math.max(options.width || TERMINAL_WIDTH, ...lines.map((line) => visibleLength(line)));
  return lines.map((line) => theme.surface(padVisible(line, width))).join("\n");
}

function columns(left, right, gap) {
  const leftWidth = Math.max(...left.map((line) => visibleLength(line)));
  const rows = Math.max(left.length, right.length);
  const output = [];

  for (let index = 0; index < rows; index += 1) {
    const leftLine = left[index] || "";
    const rightLine = right[index] || "";
    output.push(`${padVisible(leftLine, leftWidth)}${" ".repeat(gap)}${rightLine}`.trimEnd());
  }

  return output.join("\n");
}

function clipPlain(value, width) {
  const text = String(value || "");
  if (text.length <= width) return text;
  return `${text.slice(0, Math.max(0, width - 1))}…`;
}

function centerVisible(value, width) {
  const length = visibleLength(value);
  if (length >= width) return value;
  const left = Math.floor((width - length) / 2);
  return `${" ".repeat(left)}${value}`;
}

function boxLine(theme, value, innerWidth) {
  return `${theme.border("│")} ${padVisible(value, innerWidth)} ${theme.border("│")}`;
}

function signalRail(theme, width) {
  const plain = "━".repeat(width);
  return theme.gradient(plain);
}

function normalizeLines(lines, width) {
  const normalized = [];
  for (const line of lines.flat()) {
    if (line === null || line === undefined) continue;
    for (const value of String(line).split("\n")) {
      if (!value) {
        normalized.push("");
        continue;
      }

      if (visibleLength(value) <= width) {
        normalized.push(value);
        continue;
      }

      normalized.push(...wrapPlain(value, width));
    }
  }
  return normalized;
}

function wrapPlain(value, width) {
  const plain = stripAnsi(value);
  const indent = plain.match(/^\s*/)?.[0] || "";
  const words = plain.trim().split(/\s+/);
  const lines = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length + indent.length > width && current) {
      lines.push(`${indent}${current}`);
      current = word;
    } else {
      current = next;
    }
  }

  if (current) lines.push(`${indent}${current}`);
  return lines;
}
