import assert from "node:assert/strict";
import test from "node:test";
import { defaultDesktopReportPath, normalizeSaveDestination, normalizeSaveFormat, shouldPromptForReportSave } from "../src/cli/post-scan.js";

test("prompts to save only for normal interactive text runs without an explicit output", () => {
  const streams = {
    stdin: { isTTY: true },
    stdout: { isTTY: true },
  };

  assert.equal(shouldPromptForReportSave({ format: "text" }, {}, streams), true);
  assert.equal(shouldPromptForReportSave({ format: "json" }, {}, streams), false);
  assert.equal(shouldPromptForReportSave({ format: "text", quiet: true }, {}, streams), false);
  assert.equal(shouldPromptForReportSave({ format: "text", save: true }, {}, streams), false);
  assert.equal(shouldPromptForReportSave({ format: "text", out: "report.md" }, {}, streams), false);
  assert.equal(shouldPromptForReportSave({ format: "text", obsidian: true }, {}, streams), false);
  assert.equal(shouldPromptForReportSave({ format: "text" }, { CI: "true" }, streams), false);
  assert.equal(shouldPromptForReportSave({ format: "text" }, {}, { stdin: { isTTY: false }, stdout: { isTTY: true } }), false);
});

test("normalizes prompted save formats", () => {
  assert.equal(normalizeSaveFormat(""), "markdown");
  assert.equal(normalizeSaveFormat("md"), "markdown");
  assert.equal(normalizeSaveFormat("Text"), "text");
  assert.equal(normalizeSaveFormat("obsidian"), "obsidian");
  assert.throws(() => normalizeSaveFormat("pdf"), /Unsupported save format/);
});

test("normalizes prompted save destinations", () => {
  assert.equal(normalizeSaveDestination(""), "desktop");
  assert.equal(normalizeSaveDestination("d"), "desktop");
  assert.equal(normalizeSaveDestination("o"), "obsidian");
  assert.equal(normalizeSaveDestination("vault"), "obsidian");
  assert.equal(normalizeSaveDestination("c"), "custom");
  assert.throws(() => normalizeSaveDestination("downloads"), /Unsupported save destination/);
});

test("builds a findable Desktop markdown path by default", () => {
  const outputPath = defaultDesktopReportPath({
    finishedAt: "2026-04-28T17:05:10.001Z",
    domain: { apex: "example.com" },
  });

  assert.match(outputPath, /\/Desktop\/example\.com-2026-04-28T17-05-10-001Z\.md$/);
});
