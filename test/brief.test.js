import assert from "node:assert/strict";
import test from "node:test";
import { buildBrief, renderBriefMarkdown } from "../src/brief.js";

const scan = {
  finishedAt: "2026-04-27T00:01:00.000Z",
  domain: {
    apex: "client.example",
    hostname: "www.client.example",
  },
  dns: {
    subdomains: [{ name: "staging.client.example" }],
  },
  http: {
    reachable: true,
    title: "Client Example Plumbing",
  },
  site: {
    enabled: true,
    summary: {
      pagesScanned: 3,
      pagesWithMetaDescription: 1,
      pagesMissingH1: 1,
      pagesWithMultipleH1: 0,
      formsDetected: 1,
      phonesDetected: ["555-123-4567"],
      schemaTypes: ["LocalBusiness"],
      ctas: ["Request an Estimate"],
    },
    pages: [
      { path: "/", headings: { h1: ["Client Example"] } },
      { path: "/services/drain-cleaning/", headings: { h1: ["Drain Cleaning"] } },
      { path: "/contact/", headings: { h1: ["Contact"] } },
    ],
    recommendations: ["Write unique meta descriptions for important pages before launch."],
  },
  research: {
    enabled: true,
    provider: "firecrawl",
    available: false,
    queries: ["Client Example Plumbing reviews", "Client Example Plumbing services"],
    results: [],
    errors: ["FIRECRAWL_API_KEY is not set. Add it to enable live web research."],
  },
  analysis: {
    cms: {
      platform: "WordPress",
      confidence: "Medium",
    },
    hosting: {
      provider: "WP Engine",
      confidence: "Medium",
    },
    email: {
      provider: "Google Workspace",
    },
    connectedServices: ["Google verification"],
    marketing: {
      found: ["Google Tag Manager"],
    },
  },
};

test("builds a first-call brief from an existing scan", () => {
  const brief = buildBrief(scan);

  assert.equal(brief.subject, "client.example");
  assert.ok(brief.confirmations.some((item) => item.label === "WordPress operations"));
  assert.ok(brief.researchQueue.some((item) => item.area === "SEO"));
  assert.ok(brief.siteIntelligence.some((item) => item.label === "Pages crawled"));
  assert.ok(brief.marketResearch.some((item) => item.label === "Firecrawl"));
  assert.ok(brief.suggestedStructure.some((item) => item.path === "/services/{service}/"));
  assert.ok(brief.opportunityQueue.some((item) => item.area === "Subdomains"));
  assert.ok(brief.callQuestions.some((question) => question.includes("Google Tag Manager")));
});

test("renders a Markdown brief for Obsidian/client prep", () => {
  const markdown = renderBriefMarkdown(scan, { obsidian: true });

  assert.match(markdown, /report_type: "obsidian-brief"/);
  assert.match(markdown, /# FITFO Brief - client.example/);
  assert.match(markdown, /## Confirm On The Call/);
  assert.match(markdown, /## Site Intelligence/);
  assert.match(markdown, /## Market Research/);
  assert.match(markdown, /## Suggested Site Structure/);
  assert.match(markdown, /## Research Queue/);
  assert.match(markdown, /## First-Call Questions/);
});
