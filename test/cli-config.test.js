import assert from "node:assert/strict";
import test from "node:test";
import { applyConfigDefaults, normalizeConfigValue } from "../src/cli/config.js";
import { parseArgs } from "../src/cli/options.js";

test("applies safe config defaults without overriding explicit flags", () => {
  const options = parseArgs(["brief", "example.com", "--location", "Richmond, VA"]);
  const merged = applyConfigDefaults(options, {
    vault: "/vault/Clients",
    location: "Jacksonville, FL",
    country: "us",
    format: "obsidian",
    deep: true,
    search: true,
    crawlLimit: 12,
    searchLimit: 8,
  });

  assert.equal(merged.location, "Richmond, VA");
  assert.equal(merged.vault, "/vault/Clients");
  assert.equal(merged.format, "obsidian");
  assert.equal(merged.obsidian, true);
  assert.equal(merged.deep, true);
  assert.equal(merged.search, true);
  assert.equal(merged.crawlLimit, 12);
  assert.equal(merged.searchLimit, 8);
});

test("normalizes config values by key", () => {
  assert.equal(normalizeConfigValue("deep", "yes"), true);
  assert.equal(normalizeConfigValue("search", "off"), false);
  assert.equal(normalizeConfigValue("crawlLimit", "10"), 10);
  assert.equal(normalizeConfigValue("format", "md"), "markdown");
  assert.equal(normalizeConfigValue("country", "us"), "US");
  assert.throws(() => normalizeConfigValue("firecrawlApiKey", "secret"), /Unsupported config key/);
});
