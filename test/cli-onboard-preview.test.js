import assert from "node:assert/strict";
import test from "node:test";
import { applyOnboardRuntimeDefaults, renderOnboardSummary } from "../src/cli/onboard.js";

test("applies onboard runtime defaults", () => {
  const options = {
    command: "onboard",
    deep: false,
    exportTables: null,
    format: "text",
    noSave: false,
    save: false,
    search: false,
  };
  Object.defineProperty(options, "provided", {
    value: new Set(),
    enumerable: false,
  });

  const next = applyOnboardRuntimeDefaults(options);

  assert.equal(next.deep, true);
  assert.equal(next.search, true);
  assert.equal(next.save, true);
  assert.equal(next.onboardFileFormat, "obsidian");
  assert.equal(next.exportTables, "fitfo-exports");
});

test("no-save disables onboard file and table exports", () => {
  const options = {
    command: "onboard",
    exportTables: "fitfo-exports",
    format: "text",
    noSave: true,
    save: false,
  };
  Object.defineProperty(options, "provided", {
    value: new Set(),
    enumerable: false,
  });

  const next = applyOnboardRuntimeDefaults(options);

  assert.equal(next.save, false);
  assert.equal(next.exportTables, null);
});

test("renders onboard preview summary", () => {
  const output = renderOnboardSummary("example.com", {
    command: "onboard",
    crawlLimit: 8,
    deep: true,
    exportTables: "fitfo-exports",
    location: "Richmond, VA",
    noSave: false,
    onboardFileFormat: "obsidian",
    preview: true,
    save: true,
    search: true,
    vault: "/vault/Clients",
  }, { color: false });

  assert.match(output, /ONBOARD PREVIEW/);
  assert.match(output, /example\.com/);
  assert.match(output, /Richmond, VA/);
  assert.match(output, /example\.com-onboard\.md/);
});
