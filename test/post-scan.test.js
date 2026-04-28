import assert from "node:assert/strict";
import test from "node:test";
import { normalizeSaveFormat, shouldPromptForReportSave } from "../src/cli/post-scan.js";

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
