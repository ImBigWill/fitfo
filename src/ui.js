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
  const brandColumn = renderMiniWordmark(theme).split("\n");
  const copyColumn = [
    `${theme.label("FITFO")} ${theme.dim(`v${version}`)}`,
    `${theme.dim("console:")} ${theme.value("domain intake")}`,
    theme.tagline(motto),
    `${theme.dim("mode:")} ${theme.blue(clipPlain(mode, 30))}`,
    `${theme.dim("scope:")} ${theme.dim(clipPlain(scope, 30))}`,
  ];
  const masthead = columns(brandColumn, copyColumn, 3).split("\n");

  return [
    theme.border(`╭${theme.accentBorder("─".repeat(10))}${"─".repeat(width - 22)}${theme.accentBorder("─".repeat(10))}╮`),
    ...masthead.map((line) => boxLine(theme, line, innerWidth)),
    boxLine(theme, `${theme.faint("palette")} ${theme.title("#FF00AA")} ${theme.faint("/")} ${theme.blue("electric blue")} ${theme.faint("/")} ${theme.value("black")}`, innerWidth),
    theme.border(`╰${"─".repeat(width - 2)}╯`),
  ].join("\n");
}

export function renderLaunchScreen(theme, meta = {}) {
  const version = meta.version || "0.1.0";
  const width = meta.width || TERMINAL_WIDTH;
  const innerWidth = width - 4;
  const logo = renderWordmark(theme, { gradient: true }).split("\n");
  const deck = centerVisible(`${theme.label("FITFO")} ${theme.dim(`v${version}`)} ${theme.faint("·")} ${theme.dim("domain intake console")}`, innerWidth);
  const home = centerVisible(theme.faint("~"), innerWidth);
  const pipeline = [
    theme.prompt("›"),
    theme.blue("1."),
    theme.label("Onboard a client domain"),
    theme.dim("(recommended)"),
    "",
    theme.faint("2."),
    theme.dim("Quick scan only"),
  ].join(" ");

  return [
    theme.border(`╭${theme.accentBorder("─".repeat(10))}${"─".repeat(width - 22)}${theme.accentBorder("─".repeat(10))}╮`),
    boxLine(theme, "", innerWidth),
    ...logo.map((line) => boxLine(theme, centerVisible(line, innerWidth), innerWidth)),
    boxLine(theme, deck, innerWidth),
    boxLine(theme, home, innerWidth),
    boxLine(theme, "", innerWidth),
    boxLine(theme, centerVisible(theme.italic(theme.tagline("Kickstarting onboarding.")), innerWidth), innerWidth),
    boxLine(theme, "", innerWidth),
    ...launchCard(theme, "Build The Client Handoff", [
      "Map registrar, DNS, Cloudflare, hosting, CMS, and email.",
      "Track analytics, CRM, and previous-developer access before the call.",
      "",
      pipeline,
      "",
      `${theme.dim("Use arrow keys or numbers to select, Enter to confirm")}`,
    ], innerWidth),
    theme.border(`╰${"─".repeat(width - 2)}╯`),
  ].join("\n");
}

export function renderWordmark(theme, options = {}) {
  const lines = [
    "██████╗ ██╗████████╗███████╗ ██████╗ ",
    "██╔═══╝ ██║╚══██╔══╝██╔════╝██╔═══██╗",
    "█████╗  ██║   ██║   █████╗  ██║   ██║",
    "██╔══╝  ██║   ██║   ██╔══╝  ██║   ██║",
    "██║     ██║   ██║   ██║     ╚██████╔╝",
    "╚═╝     ╚═╝   ╚═╝   ╚═╝      ╚═════╝ ",
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

export function renderMiniWordmark(theme) {
  return [
    theme.gradient("█▀▀ █ ▀█▀ █▀▀ █▀█"),
    theme.gradient("█▀  █  █  █▀  █ █"),
    theme.gradient("▀   ▀  ▀  ▀   ▀▀▀"),
  ].join("\n");
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

function launchCard(theme, title, lines, innerWidth) {
  const cardWidth = Math.min(68, innerWidth);
  const cardInner = cardWidth - 4;
  const leftPad = Math.max(0, Math.floor((innerWidth - cardWidth) / 2));
  const pad = " ".repeat(leftPad);
  const normalized = normalizeLines(lines, cardInner);

  return [
    boxLine(theme, `${pad}${theme.border(`╭─`)}${theme.hotChip(title)}${theme.border("─".repeat(Math.max(0, cardWidth - visibleLength(title) - 6)))}${theme.border("╮")}`, innerWidth),
    ...normalized.map((line) => boxLine(theme, `${pad}${theme.border("│")} ${padVisible(line, cardInner)} ${theme.border("│")}`, innerWidth)),
    boxLine(theme, `${pad}${theme.border(`╰${"─".repeat(cardWidth - 2)}╯`)}`, innerWidth),
  ];
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
