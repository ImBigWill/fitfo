const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";
const ITALIC = "\x1b[3m";
const BLACK_BG = "\x1b[48;2;0;0;0m";
const PINK_BG = "\x1b[48;2;255;0;170m";
const BLUE_BG = "\x1b[48;2;0;220;255m";
const BLACK = "\x1b[38;2;0;0;0m";
const HOT_PINK = "\x1b[38;2;255;0;170m";
const ELECTRIC_BLUE = "\x1b[38;2;0;220;255m";
const WHITE = "\x1b[38;2;245;245;245m";
const GRAY = "\x1b[38;2;166;166;176m";
const DARK_GRAY = "\x1b[38;2;74;76;82m";
const GREEN = "\x1b[38;2;67;220;120m";
const YELLOW = "\x1b[38;2;255;210;90m";
const RED = "\x1b[38;2;255;85;85m";
const PINK_RGB = [255, 0, 170];
const BLUE_RGB = [0, 220, 255];
const WHITE_RGB = [245, 245, 245];

export function createTheme(enabled = true) {
  const paint = (code, value) => (enabled ? `${code}${value}${RESET}` : value);
  const rgb = ([red, green, blue]) => `\x1b[38;2;${red};${green};${blue}m`;
  const surfacePaint = (value) => (enabled ? `${BLACK_BG}${String(value).replaceAll(RESET, `${RESET}${BLACK_BG}`)}${RESET}` : value);

  return {
    enabled,
    surface: surfacePaint,
    gradient: (value, stops = [PINK_RGB, BLUE_RGB, PINK_RGB]) => (enabled ? gradientPaint(String(value), stops, rgb) : value),
    banner: (value) => paint(`${BLACK_BG}${HOT_PINK}${BOLD}`, value),
    inverted: (value) => paint(`${PINK_BG}${BLACK}${BOLD}`, value),
    blueInverted: (value) => paint(`${BLUE_BG}${BLACK}${BOLD}`, value),
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
    hotChip: (value) => paint(`${PINK_BG}${BLACK}${BOLD}`, ` ${value} `),
    blueChip: (value) => paint(`${BLUE_BG}${BLACK}${BOLD}`, ` ${value} `),
    border: (value) => paint(ELECTRIC_BLUE, value),
    accentBorder: (value) => paint(HOT_PINK, value),
    prompt: (value) => paint(`${HOT_PINK}${BOLD}`, value),
  };
}

function gradientPaint(value, stops, rgb) {
  const chars = [...value];
  const paintedChars = chars.map((char, index) => {
    if (char === " ") return char;
    const ratio = chars.length <= 1 ? 0 : index / (chars.length - 1);
    return `${rgb(interpolateStops(stops, ratio))}${BOLD}${char}`;
  });

  return `${paintedChars.join("")}${RESET}`;
}

function interpolateStops(stops, ratio) {
  const clamped = Math.max(0, Math.min(1, ratio));
  const segmentCount = Math.max(1, stops.length - 1);
  const scaled = clamped * segmentCount;
  const segment = Math.min(segmentCount - 1, Math.floor(scaled));
  const localRatio = scaled - segment;
  const start = stops[segment] || WHITE_RGB;
  const end = stops[segment + 1] || start;

  return start.map((value, index) => Math.round(value + (end[index] - value) * localRatio));
}
