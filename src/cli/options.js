const COMMANDS = new Set(["scan", "brief", "plan", "config", "doctor", "version", "help"]);
const FORMATS = new Set(["text", "markdown", "obsidian", "json"]);

export function parseArgs(argv) {
  const options = {
    command: "scan",
    crawlLimit: 8,
    deep: false,
    domain: null,
    exportTables: null,
    help: false,
    json: false,
    format: "text",
    noColor: false,
    obsidian: false,
    out: null,
    quiet: false,
    save: false,
    search: false,
    searchLimit: 5,
    researchProvider: "firecrawl",
    location: null,
    country: "US",
    vault: null,
    version: false,
  };
  Object.defineProperty(options, "provided", {
    value: new Set(),
    enumerable: false,
  });

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--help" || arg === "-h") {
      options.help = true;
    } else if (arg === "--deep") {
      options.deep = true;
      options.provided.add("deep");
    } else if (arg === "--search") {
      options.search = true;
      options.provided.add("search");
    } else if (arg === "--location") {
      const value = argv[index + 1];
      if (!value || value.startsWith("-")) {
        throw new Error("--location requires a location value.");
      }
      options.location = value;
      options.provided.add("location");
      index += 1;
    } else if (arg === "--country") {
      const value = argv[index + 1];
      if (!value || value.startsWith("-")) {
        throw new Error("--country requires a country code.");
      }
      options.country = value.toUpperCase();
      options.provided.add("country");
      index += 1;
    } else if (arg === "--export-tables" || arg === "--tables") {
      const value = argv[index + 1];
      if (!value || value.startsWith("-")) {
        throw new Error(`${arg} requires a directory path.`);
      }
      options.exportTables = value;
      index += 1;
    } else if (arg === "--search-limit") {
      const value = argv[index + 1];
      if (!value || value.startsWith("-")) {
        throw new Error("--search-limit requires a number.");
      }
      const limit = Number(value);
      if (!Number.isInteger(limit) || limit < 1 || limit > 20) {
        throw new Error("--search-limit must be an integer between 1 and 20.");
      }
      options.searchLimit = limit;
      options.provided.add("searchLimit");
      index += 1;
    } else if (arg === "--crawl-limit") {
      const value = argv[index + 1];
      if (!value || value.startsWith("-")) {
        throw new Error("--crawl-limit requires a number.");
      }
      const limit = Number(value);
      if (!Number.isInteger(limit) || limit < 1 || limit > 50) {
        throw new Error("--crawl-limit must be an integer between 1 and 50.");
      }
      options.crawlLimit = limit;
      options.provided.add("crawlLimit");
      index += 1;
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
      applyFormat(options, value);
      options.provided.add("format");
      index += 1;
    } else if (arg === "--markdown" || arg === "--md") {
      applyFormat(options, "markdown");
      options.provided.add("format");
    } else if (arg === "--obsidian") {
      applyFormat(options, "obsidian");
      options.provided.add("format");
    } else if (arg === "--save") {
      options.save = true;
    } else if (arg === "--quiet" || arg === "-q") {
      options.quiet = true;
      options.provided.add("quiet");
    } else if (arg === "--vault") {
      const value = argv[index + 1];
      if (!value || value.startsWith("-")) {
        throw new Error("--vault requires a directory path.");
      }
      options.vault = value;
      options.obsidian = true;
      options.format = "obsidian";
      options.provided.add("vault");
      options.provided.add("format");
      index += 1;
    } else if (arg === "--out" || arg === "-o") {
      const value = argv[index + 1];
      if (!value || value.startsWith("-")) {
        throw new Error(`${arg} requires a file path.`);
      }
      options.out = value;
      index += 1;
    } else if (COMMANDS.has(arg) && !options.domain) {
      if (arg === "version") {
        options.version = true;
      } else if (arg === "help") {
        options.help = true;
      } else if (arg === "config") {
        options.command = arg;
        options.configArgs = argv.slice(index + 1);
        break;
      } else {
        options.command = arg;
      }
    } else if (!arg.startsWith("-") && !options.domain) {
      options.domain = arg;
    } else if (arg.startsWith("-")) {
      throw new Error(`Unknown option: ${arg}`);
    }
  }

  return options;
}

export function normalizeFormat(value) {
  const format = String(value || "").toLowerCase();
  if (format === "md") return "markdown";
  if (FORMATS.has(format)) return format;
  throw new Error(`Unsupported format "${value}". Use text, markdown, obsidian, or json.`);
}

function applyFormat(options, value) {
  options.format = normalizeFormat(value);
  options.json = options.format === "json";
  options.obsidian = options.format === "obsidian";
}
