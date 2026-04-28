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
    results: [{ title: "Competitor", url: "https://competitor.example" }],
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
  assert.ok(plan.workstreams.some((item) => item.name === "Tracking and conversion"));
});

test("renders a Markdown plan for Obsidian", () => {
  const markdown = renderPlanMarkdown(scan, { obsidian: true });

  assert.match(markdown, /report_type: "obsidian-plan"/);
  assert.match(markdown, /## Focus First/);
  assert.match(markdown, /## Recommended Structure/);
  assert.match(markdown, /## Build Workstreams/);
});
