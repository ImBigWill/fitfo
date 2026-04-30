import assert from "node:assert/strict";
import test from "node:test";
import { buildClientPlan, renderPlanMarkdown } from "../src/plan.js";

const scan = {
  finishedAt: "2026-04-27T00:01:00.000Z",
  domain: { apex: "client.example" },
  dns: { nameservers: ["ns1.domaincontrol.com", "ns2.domaincontrol.com"], subdomains: [] },
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
    registrar: "GoDaddy",
    registrarDetails: { confidence: "High" },
    dnsProvider: "GoDaddy DNS",
    cloudflare: { status: "No obvious Cloudflare", confidence: "Low" },
    cms: { platform: "WordPress", confidence: "Medium" },
    hosting: { provider: "WP Engine", confidence: "Medium" },
    email: { provider: "Google Workspace" },
    connectedServices: [],
    marketing: { found: [] },
    launchChecklist: [
      { item: "Canonical host", detail: "Preserve HTTPS on www." },
      { item: "DNS cutover", detail: "Confirm TTLs and rollback path." },
    ],
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
  assert.ok(plan.serviceLocationRecommendations.some((item) => item.page === "/services/drain-cleaning/"));
  assert.ok(plan.infrastructureSnapshot.some((item) => item.area === "Registrar / Domain Provider" && item.finding === "GoDaddy"));
  assert.ok(plan.loginChecklist.some((item) => item.access === "Cloudflare" && item.status === "No - no obvious Cloudflare"));
  assert.ok(plan.topLocalCompetitors.some((item) => item.name === "Competitor Plumbing Services"));
  assert.ok(plan.siteEvidence.urlInventory.some((item) => item.area === "Canonical host"));
  assert.ok(plan.siteEvidence.toolFootprint.some((item) => item.tool === "Marketing tags"));
  assert.ok(plan.keywordEvidence.some((item) => item.keyword.includes("drain cleaning")));
  assert.ok(plan.workstreams.some((item) => item.name === "Tracking and conversion"));
  assert.ok(plan.launchChecklist.some((item) => item.item === "DNS cutover" && item.phase === "Launch"));
  assert.ok(plan.kickoffResearch.marketSnapshot.some((item) => item.label === "Competitor and market SERP"));
  assert.ok(plan.kickoffResearch.keywordPageOpportunities.some((item) => item.label === "Priority keyword candidates"));
  assert.ok(plan.actionReport.priorityActions.some((item) => item.label === "Map keywords to pages" && item.source === "Inferred"));
  assert.ok(plan.actionReport.pageMap.some((item) => item.keyword.includes("drain cleaning")));
  assert.ok(plan.clientCallIntelligence.some((item) => item.prompt === "Confirm top services/markets"));
  assert.ok(plan.confirmationScript.some((item) => item.topic === "Structure approval"));
});

test("renders a Markdown plan for Obsidian", () => {
  const markdown = renderPlanMarkdown(scan, { obsidian: true });

  assert.match(markdown, /report_type: "obsidian-plan"/);
  assert.match(markdown, /## Infrastructure Snapshot/);
  assert.match(markdown, /\| Registrar \/ Domain Provider \| GoDaddy \| High \|/);
  assert.match(markdown, /\| Cloudflare \| No - no obvious Cloudflare \| Low \|/);
  assert.match(markdown, /## Login \/ Access Checklist/);
  assert.match(markdown, /\| Domain registrar \| GoDaddy \|/);
  assert.match(markdown, /## URL \/ Redirect Inventory/);
  assert.match(markdown, /\| Area \/ URL \| Extracted Evidence \| Client \/ Launch Question \|/);
  assert.match(markdown, /## Lead Capture Inventory/);
  assert.match(markdown, /## Tracking \/ Tool Footprint/);
  assert.match(markdown, /## Evidence Labels/);
  assert.match(markdown, /## Focus First/);
  assert.match(markdown, /## Recommended Structure/);
  assert.match(markdown, /## Competitor-Informed Structure/);
  assert.match(markdown, /\| Priority \| Path \| Trigger \| Rationale \|/);
  assert.match(markdown, /## Top Local Competitors To Review/);
  assert.match(markdown, /Competitor Plumbing Services/);
  assert.match(markdown, /## Review \+ Reputation Summary/);
  assert.match(markdown, /## Service \+ Location Recommendations/);
  assert.match(markdown, /## Build Workstreams/);
  assert.match(markdown, /## Launch Checklist/);
  assert.match(markdown, /\| Phase \| Item \| Detail \|/);
  assert.match(markdown, /## Kickoff Research Game Plan/);
  assert.match(markdown, /### Market Snapshot/);
  assert.match(markdown, /## Prioritized Action Report/);
  assert.match(markdown, /\| Priority \| Source \| Owner \| Action \| Detail \|/);
  assert.match(markdown, /## Keyword Page Map/);
  assert.match(markdown, /\| Priority \| Intent \| Keyword \| Page \| Status \|/);
  assert.match(markdown, /## Keyword Evidence/);
  assert.match(markdown, /\| Cluster \| Keyword \| Evidence Source \| Mapped Page \| Next Step \|/);
  assert.match(markdown, /## Client Call Next Steps/);
  assert.match(markdown, /## Kickoff Confirmation Script/);
  assert.match(markdown, /Confirm analytics\/Search Console access/);
});
