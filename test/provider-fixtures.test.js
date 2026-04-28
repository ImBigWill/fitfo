import assert from "node:assert/strict";
import test from "node:test";
import { analyzeProfile } from "../src/lib/analyze.js";
import { providerPatternFixtures } from "./fixtures/provider-patterns.js";

for (const fixture of providerPatternFixtures) {
  test(`provider fixture: ${fixture.name}`, () => {
    const analysis = analyzeProfile(fixture.profile);
    const expected = fixture.expected;

    if (expected.registrar) assert.equal(analysis.registrar, expected.registrar);
    if (expected.dnsProvider) assert.equal(analysis.dnsProvider, expected.dnsProvider);
    if (expected.hosting) assert.equal(analysis.hosting.provider, expected.hosting);
    if (expected.email) assert.equal(analysis.email.provider, expected.email);
    if (expected.cms) assert.equal(analysis.cms.platform, expected.cms);
    if (expected.cloudflare) assert.equal(analysis.cloudflare.status, expected.cloudflare);
    if (expected.canonicalStyle) assert.equal(analysis.urlStructure.canonicalStyle, expected.canonicalStyle);

    assertIncludesAll(analysis.connectedServices, expected.connectedServices || [], "connected service");
    assertIncludesAll(analysis.marketing.found, expected.marketing || [], "marketing service");
    assertIncludesAll(analysis.operations.found, expected.operations || [], "operations service");
  });
}

function assertIncludesAll(actual, expected, label) {
  for (const value of expected) {
    assert.ok(actual.includes(value), `Expected ${label} ${value}; got ${actual.join(", ") || "none"}`);
  }
}
