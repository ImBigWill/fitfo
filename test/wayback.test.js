import assert from "node:assert/strict";
import test from "node:test";
import { buildWaybackCandidates, compareVersions, formatWaybackTimestamp, getWaybackProfile } from "../src/lib/wayback.js";

test("builds common homepage candidates for Wayback lookup", () => {
  const candidates = buildWaybackCandidates(
    { apex: "client.example", hostname: "www.client.example" },
    { finalUrl: "https://client.example/about/" },
  );

  assert.ok(candidates.includes("https://client.example/"));
  assert.ok(candidates.includes("http://client.example/"));
  assert.ok(candidates.includes("https://www.client.example/"));
});

test("formats Wayback timestamps", () => {
  assert.equal(formatWaybackTimestamp("20260401123456"), "2026-04-01 12:34 UTC");
  assert.equal(formatWaybackTimestamp("bad"), "bad");
});

test("compares recent archived versions for handoff breakage clues", () => {
  const comparison = compareVersions([
    { capturedAt: "2026", title: "New", h1: "New H1", wordCount: 300, formCount: 0, phones: [], ctas: ["Call"], toolSignals: [] },
    { capturedAt: "2025", title: "Old", h1: "Old H1", wordCount: 600, formCount: 1, phones: ["555-123-4567"], ctas: ["Book"], toolSignals: ["CallRail"] },
  ]);

  assert.equal(comparison.available, true);
  assert.ok(comparison.changes.some((change) => change.signal === "Title"));
  assert.ok(comparison.changes.some((change) => change.signal === "Forms"));
  assert.ok(comparison.changes.some((change) => change.signal === "Phone numbers"));
});

test("fetches and summarizes recent Wayback snapshots without live network", async () => {
  const fetchImpl = async (url) => {
    if (String(url).includes("/cdx/search/cdx")) {
      return response({
        json: [
          ["timestamp", "original", "statuscode", "mimetype", "digest", "length"],
          ["20260401120000", "https://client.example/", "200", "text/html", "newdigest", "4200"],
          ["20251201120000", "https://client.example/", "200", "text/html", "olddigest", "6500"],
        ],
      });
    }

    if (String(url).includes("20260401120000")) {
      return response({
        text: "<html><head><title>New Site</title><meta name=\"description\" content=\"New copy\"></head><body><h1>New Site</h1><a href=\"tel:5551234567\">Call</a></body></html>",
      });
    }

    return response({
      text: "<html><head><title>Old Site</title><meta name=\"description\" content=\"Old copy\"></head><body><h1>Old Site</h1><form><button>Book Now</button></form><script src=\"https://cdn.callrail.com/app.js\"></script></body></html>",
    });
  };

  const profile = await getWaybackProfile(
    { apex: "client.example", hostname: "client.example" },
    {},
    { enabled: true, fetchImpl, limit: 4, versions: 2 },
  );

  assert.equal(profile.enabled, true);
  assert.equal(profile.versions.length, 2);
  assert.equal(profile.versions[0].title, "New Site");
  assert.equal(profile.versions[1].formCount, 1);
  assert.ok(profile.comparison.changes.some((change) => change.signal === "Forms"));
  assert.ok(profile.warnings.some((warning) => warning.includes("forms")));
});

function response({ json, text }) {
  return {
    ok: true,
    status: 200,
    headers: {
      get(name) {
        if (name.toLowerCase() === "content-type") {
          return json ? "application/json" : "text/html";
        }
        return "";
      },
    },
    async json() {
      return json;
    },
    async text() {
      return text;
    },
  };
}
