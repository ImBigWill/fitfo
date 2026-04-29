import assert from "node:assert/strict";
import test from "node:test";
import { absoluteOutputPath, defaultReportPath, resolveOutputPath } from "../src/cli/reports.js";

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

test("uses a stable Obsidian vault path when a vault directory is configured", () => {
  const outputPath = resolveOutputPath(scan, {
    command: "brief",
    out: null,
    save: false,
    obsidian: true,
    format: "obsidian",
    vault: "/vault/Clients",
  });

  assert.equal(outputPath, "/vault/Clients/example.com-brief.md");
});

test("uses a stable full-onboarding path for onboard reports", () => {
  const vaultPath = resolveOutputPath(scan, {
    command: "onboard",
    out: null,
    save: true,
    obsidian: false,
    format: "text",
    vault: "/vault/Clients",
  });
  const fallbackPath = resolveOutputPath(scan, {
    command: "onboard",
    out: null,
    save: true,
    obsidian: false,
    format: "text",
    vault: null,
  });

  assert.equal(vaultPath, "/vault/Clients/example.com-onboard.md");
  assert.equal(fallbackPath, "fitfo-reports/example.com-onboard.md");
});

test("uses explicit onboard report format extensions", () => {
  const outputPath = resolveOutputPath(scan, {
    command: "onboard",
    onboardFileFormat: "json",
    out: null,
    save: true,
    obsidian: false,
    format: "json",
    vault: null,
  });

  assert.equal(outputPath, "fitfo-reports/example.com-onboard.json");
});

test("expands saved report paths for clear terminal output", () => {
  assert.equal(absoluteOutputPath("fitfo-reports/example.md").startsWith("/"), true);
  assert.equal(absoluteOutputPath("~/fitfo-example.md").startsWith("/"), true);
});
