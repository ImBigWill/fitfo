import assert from "node:assert/strict";
import test from "node:test";
import { buildSiteRecommendations, extractPageProfile, summarizePages } from "../src/lib/site.js";

const html = `<!doctype html>
  <html>
    <head>
      <title>Client Plumbing</title>
      <meta name="description" content="Emergency plumbing and drain cleaning.">
      <script type="application/ld+json">{"@type":"LocalBusiness","name":"Client Plumbing"}</script>
    </head>
    <body>
      <h1>Emergency Plumbing</h1>
      <h2>Drain Cleaning</h2>
      <a href="/contact/">Request an Estimate</a>
      <a href="tel:555-123-4567">555-123-4567</a>
      <form action="/lead"></form>
    </body>
  </html>`;

test("extracts onboarding signals from page HTML", () => {
  const page = extractPageProfile("https://client.example/services/drain-cleaning/", html, "https://client.example");

  assert.equal(page.title, "Client Plumbing");
  assert.equal(page.metaDescription, "Emergency plumbing and drain cleaning.");
  assert.deepEqual(page.headings.h1, ["Emergency Plumbing"]);
  assert.ok(page.ctas.includes("Request an Estimate"));
  assert.equal(page.forms.length, 1);
  assert.ok(page.phones.includes("555-123-4567"));
  assert.ok(page.schemaTypes.includes("LocalBusiness"));
});

test("summarizes crawled pages into brief-ready recommendations", () => {
  const pages = [
    extractPageProfile("https://client.example/", html, "https://client.example"),
    extractPageProfile("https://client.example/services/drain-cleaning/", html, "https://client.example"),
  ];

  const summary = summarizePages(pages);
  const recommendations = buildSiteRecommendations(pages);

  assert.equal(summary.pagesScanned, 2);
  assert.equal(summary.formsDetected, 2);
  assert.ok(summary.phonesDetected.includes("555-123-4567"));
  assert.ok(summary.schemaTypes.includes("LocalBusiness"));
  assert.equal(recommendations.length, 0);
});
