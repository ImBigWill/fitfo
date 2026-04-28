import assert from "node:assert/strict";
import test from "node:test";
import { applyWizardIntent, normalizeWizardIntent, shouldAskForWizardLocation } from "../src/cli/wizard.js";

test("normalizes wizard intent choices", () => {
  assert.equal(normalizeWizardIntent("").key, "kickoff");
  assert.equal(normalizeWizardIntent("1").key, "scan");
  assert.equal(normalizeWizardIntent("2").key, "handoff");
  assert.equal(normalizeWizardIntent("3").key, "kickoff");
  assert.equal(normalizeWizardIntent("4").key, "plan");
  assert.equal(normalizeWizardIntent("plan").key, "plan");
  assert.throws(() => normalizeWizardIntent("nope"), /Unsupported FITFO intent/);
});

test("applies wizard presets to existing options", () => {
  const base = {
    command: "scan",
    deep: false,
    search: false,
    format: "text",
  };
  const options = applyWizardIntent(base, normalizeWizardIntent("3"));

  assert.equal(options.command, "brief");
  assert.equal(options.deep, true);
  assert.equal(options.search, true);
  assert.equal(options.format, "text");
  assert.equal(options.wizardIntent, "kickoff");
});

test("asks for location only when search is enabled and no location exists", () => {
  assert.equal(shouldAskForWizardLocation({ search: true, location: null }), true);
  assert.equal(shouldAskForWizardLocation({ search: true, location: "Richmond, VA" }), false);
  assert.equal(shouldAskForWizardLocation({ search: false, location: null }), false);
});
