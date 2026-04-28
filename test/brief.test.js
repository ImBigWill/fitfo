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
    method: "cli",
    available: true,
    location: "Richmond, VA",
    queries: ["Client Example Plumbing reviews", "Client Example Plumbing services"],
    results: [
      {
        query: "Client Example Plumbing reviews",
        title: "Client Example Plumbing Reviews",
        description: "Customer reviews and ratings",
        url: "https://client.example/reviews/",
      },
      {
        query: "emergency plumbing repair Richmond, VA",
        title: "Emergency Plumbing Repair Richmond VA",
        description: "Emergency plumbing service from a local competitor",
        url: "https://competitor.example/emergency-plumbing/",
      },
      {
        query: "Client Example Plumbing reviews",
        title: "Client Example Plumbing Yelp Reviews",
        description: "Ratings and customer reviews",
        url: "https://www.yelp.com/biz/client-example-plumbing",
      },
    ],
    errors: [],
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
    operations: {
      found: ["ServiceTitan"],
    },
  },
};

test("builds a first-call brief from an existing scan", () => {
  const brief = buildBrief(scan);

  assert.equal(brief.subject, "client.example");
  assert.ok(brief.confirmations.some((item) => item.label === "WordPress operations"));
  assert.ok(brief.researchQueue.some((item) => item.area === "SEO"));
  assert.ok(brief.siteIntelligence.some((item) => item.label === "Pages crawled"));
  assert.ok(brief.marketResearch.some((item) => item.label === "Queries"));
  assert.ok(brief.kickoffResearch.currentSiteRead.some((item) => item.label === "Lead paths" && item.source === "Observed"));
  assert.ok(brief.kickoffResearch.marketSnapshot.some((item) => item.label === "Review and reputation signals" && item.source === "Research"));
  assert.ok(brief.kickoffResearch.keywordPageOpportunities.some((item) => item.label === "Priority keyword candidates" && item.detail.includes("drain cleaning")));
  assert.ok(brief.kickoffResearch.positioningHypotheses.some((item) => item.label === "Differentiators to validate"));
  assert.ok(brief.kickoffResearch.kickoffCallAgenda.some((item) => item.label === "Market and SEO assumptions"));
  assert.ok(brief.actionReport.priorityActions.some((item) => item.label === "Map keywords to pages"));
  assert.ok(brief.actionReport.keywordClusters.coreServices.includes("drain cleaning"));
  assert.ok(brief.actionReport.keywordClusters.emergency.some((keyword) => keyword.includes("emergency plumbing repair")));
  assert.ok(brief.actionReport.competitorResearch.competitors.some((result) => result.title === "Emergency Plumbing Repair Richmond VA"));
  assert.ok(brief.actionReport.competitorResearch.reviewProfiles.some((result) => result.title.includes("Yelp")));
  assert.ok(brief.actionReport.pageMap.some((item) => item.keyword === "drain cleaning" && item.status === "Improve existing"));
  assert.ok(brief.suggestedStructure.some((item) => item.path === "/services/{service}/"));
  assert.ok(brief.clientCallIntelligence.some((item) => item.prompt === "Confirm lead flow" && item.nextStep.includes("1 form(s)")));
  assert.ok(brief.clientCallIntelligence.some((item) => item.prompt === "Confirm analytics/Search Console access" && item.nextStep.includes("Google Tag Manager")));
  assert.ok(brief.clientCallIntelligence.some((item) => item.prompt === "Confirm prior developer handoff" && item.nextStep.includes("WP Engine")));
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
  assert.match(markdown, /## Kickoff Research Brief/);
  assert.match(markdown, /### Current Site Read/);
  assert.match(markdown, /### Keyword \+ Page Opportunities/);
  assert.match(markdown, /_Research_:/);
  assert.match(markdown, /## Detailed Action Report/);
  assert.match(markdown, /## Keyword Research/);
  assert.match(markdown, /## Competitor Research/);
  assert.match(markdown, /## Keyword To Page Map/);
  assert.match(markdown, /## Suggested Site Structure/);
  assert.match(markdown, /## Client Call Intelligence/);
  assert.match(markdown, /Confirm CRM\/booking owner/);
  assert.match(markdown, /## Research Queue/);
  assert.match(markdown, /## First-Call Questions/);
});
