const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";
const ITALIC = "\x1b[3m";
const BLACK_BG = "\x1b[48;2;0;0;0m";
const PINK_BG = "\x1b[48;2;255;0;170m";
const HOT_PINK = "\x1b[38;2;255;0;170m";
const ELECTRIC_BLUE = "\x1b[38;2;0;220;255m";
const WHITE = "\x1b[38;2;245;245;245m";
const GRAY = "\x1b[38;2;150;150;160m";
const DARK_GRAY = "\x1b[38;2;78;76;96m";
const GREEN = "\x1b[38;2;67;220;120m";
const YELLOW = "\x1b[38;2;255;210;90m";
const RED = "\x1b[38;2;255;85;85m";

export function createTheme(enabled = true) {
  const paint = (code, value) => (enabled ? `${code}${value}${RESET}` : value);
  const surfacePaint = (value) => (enabled ? `${BLACK_BG}${String(value).replaceAll(RESET, `${RESET}${BLACK_BG}`)}${RESET}` : value);

  return {
    enabled,
    surface: surfacePaint,
    banner: (value) => paint(`${BLACK_BG}${HOT_PINK}${BOLD}`, value),
    inverted: (value) => paint(`${PINK_BG}${BLACK_BG.replace("48", "38")}${BOLD}`, value),
    title: (value) => paint(`${HOT_PINK}${BOLD}`, value),
    tagline: (value) => paint(`${HOT_PINK}${BOLD}${ITALIC}`, value),
    italic: (value) => paint(ITALIC, value),
    section: (value) => paint(`${ELECTRIC_BLUE}${BOLD}`, value),
    blue: (value) => paint(ELECTRIC_BLUE, value),
    cyan: (value) => paint(ELECTRIC_BLUE, value),
    label: (value) => paint(`${WHITE}${BOLD}`, value),
    dim: (value) => paint(GRAY, value),
    faint: (value) => paint(DARK_GRAY, value),
    muted: (value) => paint(DIM, value),
    ok: (value) => paint(GREEN, value),
    warn: (value) => paint(YELLOW, value),
    bad: (value) => paint(RED, value),
    value: (value) => paint(WHITE, value),
    bullet: (value) => paint(HOT_PINK, value),
    chip: (value) => paint(`${BLACK_BG}${HOT_PINK}${BOLD}`, ` ${value} `),
    border: (value) => paint(ELECTRIC_BLUE, value),
    prompt: (value) => paint(`${HOT_PINK}${BOLD}`, value),
  };
}
