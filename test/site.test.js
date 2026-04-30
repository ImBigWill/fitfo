import assert from "node:assert/strict";
import test from "node:test";
import { buildSiteRecommendations, extractPageProfile, summarizePages } from "../src/lib/site.js";

const html = `<!doctype html>
  <html>
    <head>
      <title>Client Plumbing</title>
      <meta name="description" content="Emergency plumbing and drain cleaning.">
      <meta name="robots" content="index,follow">
      <link rel="canonical" href="https://client.example/services/drain-cleaning/">
      <script src="https://www.googletagmanager.com/gtm.js?id=GTM-TEST"></script>
      <script type="application/ld+json">{"@type":"LocalBusiness","name":"Client Plumbing"}</script>
    </head>
    <body>
      <h1>Emergency Plumbing</h1>
      <h2>Drain Cleaning</h2>
      <a href="/contact/">Request an Estimate</a>
      <a href="tel:555-123-4567">555-123-4567</a>
      <form action="/lead" method="post" id="quote-form">
        <input name="name" type="text">
        <input name="phone" type="tel">
        <button>Request Quote</button>
      </form>
    </body>
  </html>`;

test("extracts onboarding signals from page HTML", () => {
  const page = extractPageProfile("https://client.example/services/drain-cleaning/", html, "https://client.example");

  assert.equal(page.title, "Client Plumbing");
  assert.equal(page.metaDescription, "Emergency plumbing and drain cleaning.");
  assert.equal(page.metaRobots, "index,follow");
  assert.equal(page.canonicalUrl, "https://client.example/services/drain-cleaning/");
  assert.deepEqual(page.headings.h1, ["Emergency Plumbing"]);
  assert.ok(page.ctas.includes("Request an Estimate"));
  assert.equal(page.forms.length, 1);
  assert.equal(page.forms[0].action, "https://client.example/lead");
  assert.equal(page.forms[0].method, "POST");
  assert.ok(page.forms[0].fields.includes("phone (tel)"));
  assert.ok(page.forms[0].submitLabels.includes("Request Quote"));
  assert.ok(page.phones.includes("555-123-4567"));
  assert.ok(page.schemaTypes.includes("LocalBusiness"));
  assert.ok(page.toolSignals.includes("Google Tag Manager"));
  assert.ok(page.scriptHosts.includes("googletagmanager.com"));
});

test("summarizes crawled pages into brief-ready recommendations", () => {
  const pages = [
    extractPageProfile("https://client.example/", html, "https://client.example"),
    extractPageProfile("https://client.example/services/drain-cleaning/", html, "https://client.example"),
  ];

  const summary = summarizePages(pages);
  const recommendations = buildSiteRecommendations(pages);

  assert.equal(summary.pagesScanned, 2);
  assert.equal(summary.pagesWithCanonical, 2);
  assert.equal(summary.formsDetected, 2);
  assert.ok(summary.phonesDetected.includes("555-123-4567"));
  assert.ok(summary.schemaTypes.includes("LocalBusiness"));
  assert.ok(summary.toolSignals.includes("Google Tag Manager"));
  assert.equal(recommendations.length, 0);
});
