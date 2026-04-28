import assert from "node:assert/strict";
import test from "node:test";
import { normalizeFormat, parseArgs } from "../src/cli/options.js";

test("parses default scan command with a domain", () => {
  assert.deepEqual(parseArgs(["example.com"]), {
    command: "scan",
    crawlLimit: 8,
    deep: false,
    domain: "example.com",
    help: false,
    json: false,
    format: "text",
    noColor: false,
    obsidian: false,
    out: null,
    quiet: false,
    save: false,
    vault: null,
    version: false,
  });
});

test("parses brief command with Obsidian output path", () => {
  const options = parseArgs(["brief", "example.com", "--obsidian", "--out", "notes/example.md"]);

  assert.equal(options.command, "brief");
  assert.equal(options.domain, "example.com");
  assert.equal(options.format, "obsidian");
  assert.equal(options.obsidian, true);
  assert.equal(options.out, "notes/example.md");
});

test("parses vault as an Obsidian output target", () => {
  const options = parseArgs(["brief", "example.com", "--vault", "~/Obsidian/Clients"]);

  assert.equal(options.command, "brief");
  assert.equal(options.format, "obsidian");
  assert.equal(options.obsidian, true);
  assert.equal(options.vault, "~/Obsidian/Clients");
});

test("parses markdown and json aliases", () => {
  assert.equal(parseArgs(["example.com", "--md"]).format, "markdown");
  assert.equal(parseArgs(["example.com", "--json"]).format, "json");
  assert.equal(parseArgs(["example.com", "--quiet"]).quiet, true);
  assert.equal(parseArgs(["brief", "example.com", "--deep"]).deep, true);
  assert.equal(parseArgs(["brief", "example.com", "--crawl-limit", "12"]).crawlLimit, 12);
  assert.equal(parseArgs(["version"]).version, true);
  assert.equal(parseArgs(["help"]).help, true);
});

test("rejects unsupported formats and unknown options", () => {
  assert.throws(() => normalizeFormat("pdf"), /Unsupported format/);
  assert.throws(() => parseArgs(["example.com", "--wat"]), /Unknown option/);
  assert.throws(() => parseArgs(["example.com", "--crawl-limit", "0"]), /between 1 and 50/);
});
