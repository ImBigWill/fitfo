import assert from "node:assert/strict";
import test from "node:test";
import { buildCitationBaseline, extractAddressCandidates, extractPhones } from "../src/lib/citations.js";

const scan = {
  domain: { apex: "client.example", hostname: "client.example" },
  http: { title: "Client Plumbing | Richmond VA", finalUrl: "https://client.example/" },
  site: {
    summary: {
      phonesDetected: ["555-123-4567"],
      addressesDetected: ["123 Main St Richmond VA 23220"],
    },
    pages: [
      {
        path: "/",
        title: "Client Plumbing",
        headings: { h1: ["Client Plumbing"] },
        phones: ["555-123-4567"],
        addresses: ["123 Main St Richmond VA 23220"],
      },
    ],
  },
  research: {
    results: [
      {
        title: "Client Plumbing Reviews",
        description: "Client Plumbing at 123 Main St Richmond VA 23220. Call 555-123-4567.",
        url: "https://www.yelp.com/biz/client-plumbing-richmond",
      },
      {
        title: "Client Plumbing BBB Profile",
        description: "Client Plumbing at 123 Main St Richmond VA 23220. Phone 555-999-0000.",
        url: "https://www.bbb.org/us/va/richmond/profile/plumber/client-plumbing",
      },
    ],
  },
};

test("extracts phones and address candidates from citation text", () => {
  assert.deepEqual(extractPhones("Call (555) 123-4567 or 555.999.0000"), ["(555) 123-4567", "555.999.0000"]);
  assert.deepEqual(extractAddressCandidates("Visit 123 Main St Richmond VA 23220 today."), ["123 Main St Richmond VA 23220"]);
});

test("builds a citation baseline with canonical NAP and mismatch rows", () => {
  const baseline = buildCitationBaseline(scan);

  assert.equal(baseline.canonical.name, "Client Plumbing");
  assert.equal(baseline.canonical.phone, "555-123-4567");
  assert.equal(baseline.canonical.address, "123 Main St Richmond VA 23220");
  assert.ok(baseline.rows.some((row) => row.source === "Current website" && row.matchStatus === "Canonical candidate"));
  assert.ok(baseline.rows.some((row) => row.source === "yelp" && row.matchStatus === "Consistent candidate"));
  assert.ok(baseline.rows.some((row) => row.source === "bbb" && row.matchStatus === "Phone mismatch" && row.risk === "High"));
  assert.match(baseline.confirmationQuestion, /Google Business Profile owner/);
});
