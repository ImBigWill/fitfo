import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { normalizeFormat } from "./options.js";

const CONFIG_KEYS = new Set([
  "vault",
  "location",
  "country",
  "format",
  "deep",
  "search",
  "crawlLimit",
  "searchLimit",
  "quiet",
]);

const BOOLEAN_KEYS = new Set(["deep", "search", "quiet"]);
const NUMBER_KEYS = new Set(["crawlLimit", "searchLimit"]);

export function getConfigPath() {
  return process.env.FITFO_CONFIG || path.join(homedir(), ".config", "fitfo", "config.json");
}

export async function loadConfig() {
  const configPath = getConfigPath();
  if (!existsSync(configPath)) return {};

  const raw = await readFile(configPath, "utf8");
  if (!raw.trim()) return {};
  return JSON.parse(raw);
}

export async function saveConfig(config) {
  const configPath = getConfigPath();
  await mkdir(path.dirname(configPath), { recursive: true });
  await writeFile(configPath, `${JSON.stringify(sortConfig(config), null, 2)}\n`, "utf8");
  return configPath;
}

export async function handleConfigCommand(args = []) {
  const action = args[0] || "show";
  const config = await loadConfig();

  if (action === "path") {
    return `${getConfigPath()}\n`;
  }

  if (action === "show" || action === "get") {
    return `${JSON.stringify(sortConfig(config), null, 2)}\n`;
  }

  if (action === "set") {
    const key = args[1];
    const value = args.slice(2).join(" ");
    if (!key || !value) throw new Error("Usage: fitfo config set <key> <value>");
    assertConfigKey(key);
    config[key] = normalizeConfigValue(key, value);
    const configPath = await saveConfig(config);
    return `Saved ${key} to ${configPath}\n`;
  }

  if (action === "unset") {
    const key = args[1];
    if (!key) throw new Error("Usage: fitfo config unset <key>");
    assertConfigKey(key);
    delete config[key];
    const configPath = await saveConfig(config);
    return `Removed ${key} from ${configPath}\n`;
  }

  throw new Error(`Unknown config action: ${action}`);
}

export function applyConfigDefaults(options, config = {}) {
  const merged = { ...options };
  preserveProvided(options, merged);

  applyDefault(merged, config, "vault", null);
  applyDefault(merged, config, "location", null);
  applyDefault(merged, config, "country", "US");
  applyDefault(merged, config, "crawlLimit", 8);
  applyDefault(merged, config, "searchLimit", 5);
  applyDefault(merged, config, "quiet", false);

  if (!provided(merged, "format") && config.format) {
    merged.format = normalizeFormat(config.format);
    merged.json = merged.format === "json";
    merged.obsidian = merged.format === "obsidian";
  }

  if (!provided(merged, "deep") && typeof config.deep === "boolean") {
    merged.deep = config.deep;
  }

  if (!provided(merged, "search") && typeof config.search === "boolean") {
    merged.search = config.search;
  }

  return merged;
}

function preserveProvided(source, target) {
  if (source.provided instanceof Set) {
    Object.defineProperty(target, "provided", {
      value: new Set(source.provided),
      enumerable: false,
    });
  }
}

export function normalizeConfigValue(key, value) {
  assertConfigKey(key);
  if (BOOLEAN_KEYS.has(key)) {
    if (/^(true|yes|1|on)$/i.test(value)) return true;
    if (/^(false|no|0|off)$/i.test(value)) return false;
    throw new Error(`${key} must be true or false.`);
  }

  if (NUMBER_KEYS.has(key)) {
    const number = Number(value);
    const max = key === "crawlLimit" ? 50 : 20;
    if (!Number.isInteger(number) || number < 1 || number > max) {
      throw new Error(`${key} must be an integer between 1 and ${max}.`);
    }
    return number;
  }

  if (key === "format") {
    return normalizeFormat(value);
  }

  if (key === "country") {
    return value.toUpperCase();
  }

  return value;
}

function applyDefault(options, config, key, defaultValue) {
  if (!provided(options, key) && config[key] !== undefined && options[key] === defaultValue) {
    options[key] = config[key];
  }
}

function provided(options, key) {
  return options.provided instanceof Set && options.provided.has(key);
}

function assertConfigKey(key) {
  if (!CONFIG_KEYS.has(key)) {
    throw new Error(`Unsupported config key: ${key}`);
  }
}

function sortConfig(config) {
  return Object.fromEntries(Object.entries(config).sort(([a], [b]) => a.localeCompare(b)));
}
