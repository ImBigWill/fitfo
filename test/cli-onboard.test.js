import assert from "node:assert/strict";
import test from "node:test";
import { applyOnboardPromptAnswers, defaultOnboardVault, shouldAskForOnboardLocation, shouldAskForOnboardVault, shouldPromptForOnboardDetails } from "../src/cli/onboard.js";

test("asks for onboard location only when search has no location", () => {
  assert.equal(shouldAskForOnboardLocation({ command: "onboard", search: true, location: null }), true);
  assert.equal(shouldAskForOnboardLocation({ command: "onboard", search: true, location: "Richmond, VA" }), false);
  assert.equal(shouldAskForOnboardLocation({ command: "scan", search: true, location: null }), false);
});

test("asks for onboard vault only when the default Markdown note has nowhere to go", () => {
  assert.equal(shouldAskForOnboardVault({ command: "onboard", onboardFileFormat: "obsidian", vault: null, out: null }), true);
  assert.equal(shouldAskForOnboardVault({ command: "onboard", onboardFileFormat: "obsidian", vault: "/vault", out: null }), false);
  assert.equal(shouldAskForOnboardVault({ command: "onboard", onboardFileFormat: "obsidian", vault: null, out: "note.md" }), false);
  assert.equal(shouldAskForOnboardVault({ command: "onboard", onboardFileFormat: "json", vault: null, out: null }), false);
});

test("prompts for onboard details only in interactive runs", () => {
  const options = { command: "onboard", search: true, location: null, vault: null, out: null, onboardFileFormat: "obsidian" };

  assert.equal(shouldPromptForOnboardDetails(options, { inputIsTTY: true, outputIsTTY: true }), true);
  assert.equal(shouldPromptForOnboardDetails({ ...options, quiet: true }, { inputIsTTY: true, outputIsTTY: true }), false);
  assert.equal(shouldPromptForOnboardDetails(options, { inputIsTTY: false, outputIsTTY: true }), false);
});

test("applies onboard prompt answers without dropping explicit option tracking", () => {
  const options = {
    command: "onboard",
    location: null,
    vault: null,
  };
  Object.defineProperty(options, "provided", {
    value: new Set(["format"]),
    enumerable: false,
  });

  const next = applyOnboardPromptAnswers(options, {
    location: " Richmond, VA ",
    vault: " ~/Obsidian/Clients ",
  });

  assert.equal(next.location, "Richmond, VA");
  assert.equal(next.vault, "~/Obsidian/Clients");
  assert.equal(next.provided.has("format"), true);
});

test("uses fitfo-reports as the onboard vault fallback", () => {
  assert.equal(defaultOnboardVault({}), "fitfo-reports");
  assert.equal(defaultOnboardVault({ vault: "/vault/Clients" }), "/vault/Clients");
});
