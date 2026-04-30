import assert from "node:assert/strict";
import test from "node:test";
import { renderRunRecap } from "../src/cli/status.js";
import { renderHelp, renderPromptIntro } from "../src/help.js";
import { TERMINAL_WIDTH, visibleLength } from "../src/ui.js";

test("no-color help and startup screens stay inside the terminal frame", () => {
  for (const output of [
    renderHelp({ color: false, version: "0.1.0" }),
    renderPromptIntro({ color: false, version: "0.1.0" }),
    renderRunRecap({
      analysis: {
        registrar: "GoDaddy",
        dnsProvider: "GoDaddy DNS",
        hosting: { provider: "Unknown" },
        email: { provider: "Google Workspace" },
        cloudflare: { status: "No obvious Cloudflare", confidence: "Low" },
        urlStructure: { canonicalStyle: "www" },
      },
    }, { reportPath: "client.example.md", tablePath: "fitfo-exports" }, { color: false }),
  ]) {
    for (const line of output.split("\n")) {
      assert.ok(visibleLength(line) <= TERMINAL_WIDTH, `Line exceeded ${TERMINAL_WIDTH}: ${line}`);
    }
  }
});
