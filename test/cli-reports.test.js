import assert from "node:assert/strict";
import test from "node:test";
import { defaultReportPath, resolveOutputPath } from "../src/cli/reports.js";

const scan = {
  finishedAt: "2026-04-27T12:34:56.789Z",
  domain: {
    apex: "example.com",
  },
};

test("builds default report paths with matching extensions", () => {
  assert.match(defaultReportPath(scan, "text", false), /^fitfo-reports\/example\.com-.*\.txt$/);
  assert.match(defaultReportPath(scan, "json", false), /^fitfo-reports\/example\.com-.*\.json$/);
  assert.match(defaultReportPath(scan, "markdown", false), /^fitfo-reports\/example\.com-.*\.md$/);
  assert.match(defaultReportPath(scan, "obsidian", true), /^fitfo-reports\/example\.com-.*\.md$/);
});

test("prefers explicit output path over generated save path", () => {
  const outputPath = resolveOutputPath(scan, {
    out: "notes/example.md",
    save: true,
    obsidian: true,
    format: "obsidian",
  });

  assert.equal(outputPath, "notes/example.md");
});
