import assert from "node:assert/strict";
import test from "node:test";
import { buildResearchQueries, getResearchProfile, normalizeFirecrawlResults } from "../src/lib/research.js";

test("builds Firecrawl research queries from title, location, and crawled services", () => {
  const queries = buildResearchQueries(
    { apex: "client.example" },
    { title: "Client Plumbing | Richmond VA" },
    {
      pages: [
        { path: "/services/drain-cleaning/", headings: { h1: ["Drain Cleaning"], h2: ["Emergency Plumbing Repair"] } },
      ],
    },
    { location: "Richmond VA", queryLimit: 10 },
  );

  assert.ok(queries.includes("\"Client Plumbing\""));
  assert.ok(queries.includes("Client Plumbing Richmond VA reviews"));
  assert.ok(queries.includes("plumber Richmond VA"));
  assert.ok(queries.includes("best plumber Richmond VA"));
  assert.ok(queries.some((query) => query.includes("emergency plumbing repair")));
  assert.ok(queries.some((query) => query.includes("best emergency plumbing repair Richmond VA")));
});

test("returns a clear unavailable profile when Firecrawl key is missing and CLI fallback is disabled", async () => {
  const profile = await getResearchProfile(
    { apex: "client.example" },
    { title: "Client Plumbing" },
    { pages: [] },
    { search: true, firecrawlApiKey: "", cliFallback: false },
  );

  assert.equal(profile.enabled, true);
  assert.equal(profile.provider, "firecrawl");
  assert.equal(profile.method, null);
  assert.equal(profile.available, false);
  assert.match(profile.errors[0], /FIRECRAWL_API_KEY/);
});

test("adds vertical service queries when a vertical is provided", () => {
  const queries = buildResearchQueries(
    { apex: "client.example" },
    { title: "Client Services" },
    { pages: [] },
    { location: "Richmond VA", queryLimit: 12, vertical: "plumbing" },
  );

  assert.ok(queries.includes("emergency plumbing Richmond VA"));
  assert.ok(queries.includes("drain cleaning Richmond VA"));
  assert.ok(queries.includes("sewer line repair Richmond VA"));
  assert.ok(queries.includes("best emergency plumbing Richmond VA"));
});

test("uses authenticated Firecrawl CLI fallback when the API key is missing", async () => {
  const calls = [];
  const profile = await getResearchProfile(
    { apex: "client.example" },
    { title: "Client Plumbing" },
    { pages: [] },
    {
      search: true,
      firecrawlApiKey: "",
      queryLimit: 1,
      searchLimit: 2,
      country: "US",
      location: "Richmond, VA",
      firecrawlCliSearch: async (query, options) => {
        calls.push({ query, options });
        return [
          {
            query,
            title: "Client Plumbing Reviews",
            description: "Review listing",
            url: "https://example.com/reviews",
          },
        ];
      },
    },
  );

  assert.equal(profile.available, true);
  assert.equal(profile.method, "cli");
  assert.equal(profile.results.length, 1);
  assert.equal(profile.location, "Richmond, VA");
  assert.equal(profile.country, "US");
  assert.equal(calls[0].options.limit, 2);
  assert.equal(calls[0].options.country, "US");
  assert.equal(calls[0].options.location, "Richmond, VA");
});

test("normalizes Firecrawl CLI JSON output", () => {
  const results = normalizeFirecrawlResults(
    {
      success: true,
      data: {
        web: [
          {
            url: "https://client.example/services",
            title: "Services",
            description: "Service page",
          },
        ],
      },
    },
    "client services",
  );

  assert.deepEqual(results, [
    {
      query: "client services",
      title: "Services",
      description: "Service page",
      url: "https://client.example/services",
    },
  ]);
});
