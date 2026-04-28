import assert from "node:assert/strict";
import test from "node:test";
import { buildResearchQueries, getResearchProfile } from "../src/lib/research.js";

test("builds Firecrawl research queries from title, location, and crawled services", () => {
  const queries = buildResearchQueries(
    { apex: "client.example" },
    { title: "Client Plumbing | Richmond VA" },
    {
      pages: [
        { path: "/services/drain-cleaning/", headings: { h1: ["Drain Cleaning"], h2: ["Emergency Plumbing Repair"] } },
      ],
    },
    { location: "Richmond VA" },
  );

  assert.ok(queries.includes("\"Client Plumbing\""));
  assert.ok(queries.includes("Client Plumbing Richmond VA reviews"));
  assert.ok(queries.some((query) => query.includes("emergency plumbing repair")));
});

test("returns a clear unavailable profile when Firecrawl key is missing", async () => {
  const profile = await getResearchProfile(
    { apex: "client.example" },
    { title: "Client Plumbing" },
    { pages: [] },
    { search: true, firecrawlApiKey: "" },
  );

  assert.equal(profile.enabled, true);
  assert.equal(profile.provider, "firecrawl");
  assert.equal(profile.available, false);
  assert.match(profile.errors[0], /FIRECRAWL_API_KEY/);
});
