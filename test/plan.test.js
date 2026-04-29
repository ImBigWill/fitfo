import assert from "node:assert/strict";
import test from "node:test";
import { buildClientPlan, renderPlanMarkdown } from "../src/plan.js";

const scan = {
  finishedAt: "2026-04-27T00:01:00.000Z",
  domain: { apex: "client.example" },
  dns: { subdomains: [] },
  http: { reachable: true, title: "Client Plumbing" },
  site: {
    enabled: true,
    summary: { pagesScanned: 2 },
    pages: [{ path: "/" }, { path: "/services/drain-cleaning/" }],
  },
  research: {
    enabled: true,
    available: true,
    location: "Richmond, VA",
    queries: ["Client Plumbing services Richmond VA"],
    results: [{ query: "Client Plumbing services Richmond VA", title: "Competitor Plumbing Services", description: "Drain repair and emergency plumbing", url: "https://competitor.example" }],
  },
  analysis: {
    cms: { platform: "WordPress", confidence: "Medium" },
    hosting: { provider: "WP Engine", confidence: "Medium" },
    email: { provider: "Google Workspace" },
    connectedServices: [],
    marketing: { found: [] },
  },
};

test("builds a client plan from scan, crawl, and research signals", () => {
  const plan = buildClientPlan(scan);

  assert.equal(plan.subject, "client.example");
  assert.ok(plan.priorities.some((item) => item.label === "Structure"));
  assert.ok(plan.priorities.some((item) => item.label === "Market proof"));
  assert.ok(plan.structure.some((item) => item.path === "/services/{service}/"));
  assert.ok(plan.competitorStructure.some((item) => item.path.startsWith("/services/")));
  assert.ok(plan.reputationSummary.some((item) => item.channel === "Market patterns"));
  assert.ok(plan.workstreams.some((item) => item.name === "Tracking and conversion"));
  assert.ok(plan.kickoffResearch.marketSnapshot.some((item) => item.label === "Competitor and market SERP"));
  assert.ok(plan.kickoffResearch.keywordPageOpportunities.some((item) => item.label === "Priority keyword candidates"));
  assert.ok(plan.actionReport.priorityActions.some((item) => item.label === "Map keywords to pages"));
  assert.ok(plan.actionReport.pageMap.some((item) => item.keyword.includes("drain cleaning")));
  assert.ok(plan.clientCallIntelligence.some((item) => item.prompt === "Confirm top services/markets"));
  assert.ok(plan.confirmationScript.some((item) => item.topic === "Structure approval"));
});

test("renders a Markdown plan for Obsidian", () => {
  const markdown = renderPlanMarkdown(scan, { obsidian: true });

  assert.match(markdown, /report_type: "obsidian-plan"/);
  assert.match(markdown, /## Focus First/);
  assert.match(markdown, /## Recommended Structure/);
  assert.match(markdown, /## Competitor-Informed Structure/);
  assert.match(markdown, /\| Priority \| Path \| Trigger \| Rationale \|/);
  assert.match(markdown, /## Review \+ Reputation Summary/);
  assert.match(markdown, /## Build Workstreams/);
  assert.match(markdown, /## Kickoff Research Game Plan/);
  assert.match(markdown, /### Market Snapshot/);
  assert.match(markdown, /## Prioritized Action Report/);
  assert.match(markdown, /\| Priority \| Owner \| Action \| Detail \|/);
  assert.match(markdown, /## Keyword Page Map/);
  assert.match(markdown, /\| Priority \| Intent \| Keyword \| Page \| Status \|/);
  assert.match(markdown, /## Client Call Next Steps/);
  assert.match(markdown, /## Kickoff Confirmation Script/);
  assert.match(markdown, /Confirm analytics\/Search Console access/);
});
