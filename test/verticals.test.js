import assert from "node:assert/strict";
import test from "node:test";
import { buildVerticalContext, detectVertical, normalizeVertical, supportedVerticals } from "../src/verticals/index.js";

const plumbingScan = {
  http: { title: "Client Plumbing" },
  site: {
    summary: {
      ctas: ["Call Now", "Request Service"],
      phonesDetected: ["555-123-4567"],
      toolSignals: ["CallRail"],
    },
    pages: [
      {
        path: "/",
        title: "Emergency Plumbing",
        metaDescription: "Licensed and insured plumber with drain cleaning and water heater repair.",
        headings: { h1: ["Emergency Plumbing"], h2: ["Drain Cleaning", "Water Heaters"] },
        ctas: ["Call Now"],
        forms: [{ action: "/contact", method: "POST" }],
        schemaTypes: ["LocalBusiness"],
      },
    ],
  },
  research: {
    results: [
      { title: "Client Plumbing Reviews", description: "Google reviews for a local plumber.", url: "https://example.test/reviews" },
    ],
  },
  analysis: {
    operations: { found: ["ServiceTitan"] },
  },
};

test("normalizes supported verticals", () => {
  assert.deepEqual(supportedVerticals(), ["plumbing"]);
  assert.equal(normalizeVertical("Plumbing"), "plumbing");
  assert.equal(normalizeVertical(null), null);
  assert.throws(() => normalizeVertical("restaurants"), /Unsupported vertical/);
});

test("detects plumbing from site and research signals", () => {
  assert.equal(detectVertical(plumbingScan), "plumbing");
  assert.equal(detectVertical({ http: { title: "Generic Company" }, site: { pages: [] } }), null);
});

test("builds plumbing vertical context with homeowner UX checks", () => {
  const context = buildVerticalContext(plumbingScan, { vertical: "plumbing" });

  assert.equal(context.slug, "plumbing");
  assert.equal(context.source, "explicit");
  assert.ok(context.services.includes("emergency plumbing"));
  assert.ok(context.proofAssets.includes("license and insurance details"));
  assert.ok(context.operationsTools.includes("ServiceTitan"));
  assert.ok(context.audienceQuestions.some((item) => item.audience === "Office / dispatcher"));
  assert.ok(context.homeownerUx.some((item) => item.area === "Emergency contact path" && item.status === "Strong signal"));
  assert.ok(context.homeownerUx.some((item) => item.area === "Dispatch and attribution" && item.evidence.includes("ServiceTitan")));
});

test("builds empty context when no vertical is found", () => {
  const context = buildVerticalContext({ http: { title: "Generic Company" }, site: { pages: [] } });

  assert.equal(context.slug, null);
  assert.deepEqual(context.homeownerUx, []);
});
