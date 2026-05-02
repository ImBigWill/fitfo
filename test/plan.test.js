import assert from "node:assert/strict";
import test from "node:test";
import { buildClientPlan, renderPlanMarkdown } from "../src/plan.js";
import { buildVerticalContext } from "../src/verticals/index.js";

const scan = {
  finishedAt: "2026-04-27T00:01:00.000Z",
  domain: { apex: "client.example" },
  dns: {
    nameservers: ["ns1.domaincontrol.com", "ns2.domaincontrol.com"],
    subdomains: [
      {
        name: "staging.client.example",
        cnames: ["client-staging.wpengine.com"],
        addresses: [],
      },
    ],
  },
  http: { reachable: true, title: "Client Plumbing" },
  site: {
    enabled: true,
    robots: {
      checked: true,
      sitemapUrls: ["https://client.example/sitemap.xml"],
      aiCrawlerRules: [
        { agent: "gptbot", directive: "disallow", path: "/" },
      ],
    },
    sitemap: {
      urls: ["https://client.example/", "https://client.example/services/drain-cleaning/"],
    },
    summary: { pagesScanned: 2, phonesDetected: ["555-123-4567"], addressesDetected: ["123 Main St Richmond VA 23220"] },
    pages: [
      { path: "/", wordCount: 350, metaRobots: "index,follow" },
      { path: "/services/drain-cleaning/", wordCount: 250, metaRobots: "index,follow" },
    ],
  },
  research: {
    enabled: true,
    available: true,
    location: "Richmond, VA",
    queries: ["Client Plumbing services Richmond VA"],
    results: [
      { query: "Client Plumbing services Richmond VA", title: "Competitor Plumbing Services", description: "Drain repair and emergency plumbing", url: "https://competitor.example" },
      { query: "Client Plumbing reviews", title: "Client Plumbing Yelp Reviews", description: "Client Plumbing at 123 Main St Richmond VA 23220. Call 555-123-4567.", url: "https://www.yelp.com/biz/client-plumbing" },
    ],
  },
  wayback: {
    enabled: true,
    provider: "internet-archive",
    snapshotsFound: 2,
    versions: [
      {
        capturedAt: "2026-04-01 12:00 UTC",
        original: "https://client.example/",
        title: "Client Plumbing",
        h1: "Client Plumbing",
        wordCount: 400,
        formCount: 0,
        phones: ["555-123-4567"],
        ctas: ["Request Service"],
        toolSignals: ["Google Tag Manager"],
      },
      {
        capturedAt: "2025-12-01 12:00 UTC",
        original: "https://client.example/",
        title: "Client Plumbing Old Site",
        h1: "Emergency Plumbing",
        wordCount: 700,
        formCount: 1,
        phones: ["555-123-4567"],
        ctas: ["Book Now"],
        toolSignals: ["Google Tag Manager", "CallRail"],
      },
    ],
    comparison: {
      changes: [
        { signal: "Title", previous: "Client Plumbing Old Site", latest: "Client Plumbing", note: "Changed between recent Wayback captures." },
      ],
    },
    warnings: ["Earlier archived homepage had forms but the latest archived version does not. Confirm current lead capture paths."],
    errors: [],
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
    urlStructure: {
      preferredHost: "www.client.example",
      preferredProtocol: "HTTPS",
      canonicalStyle: "www",
      recommendation: "Likely primary launch URL is HTTPS on www, but apex/www variants need redirect QA before launch.",
      issues: [
        {
          code: "split_hosts",
          severity: "Medium",
          summary: "Apex/www variants resolve to more than one final host.",
          detail: "Choose one canonical launch host and redirect the other variants to it before launch.",
        },
      ],
    },
    launchChecklist: [
      { item: "Canonical host", detail: "Preserve HTTPS on www." },
      { item: "DNS cutover", detail: "Confirm TTLs and rollback path." },
    ],
  },
};

scan.vertical = buildVerticalContext(scan, { vertical: "plumbing" });

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
  assert.ok(plan.unknownBlockers.some((item) => item.area === "Measurement access"));
  assert.ok(plan.callOneWorkflow.some((item) => item.area === "Internal next step" && item.audience === "Internal"));
  assert.ok(plan.confidenceExplanations.some((item) => item.area === "Registrar" && item.finding === "GoDaddy"));
  assert.ok(plan.clientAccessRequests.some((item) => item.access === "Domain registrar" && item.owner === "Client"));
  assert.ok(plan.doNotTouchWarnings.some((item) => item.area === "Email"));
  assert.ok(plan.previousDeveloperRequestItems.some((item) => item.includes("Full DNS zone export")));
  assert.ok(plan.citationBaseline.rows.some((item) => item.source === "yelp"));
  assert.ok(plan.topLocalCompetitors.some((item) => item.name === "Competitor Plumbing Services"));
  assert.equal(plan.vertical.slug, "plumbing");
  assert.ok(plan.vertical.homeownerUx.some((item) => item.area === "Emergency contact path"));
  assert.ok(plan.vertical.proofAssets.includes("license and insurance details"));
  assert.ok(plan.vertical.audienceQuestions.some((item) => item.audience === "Owner"));
  assert.ok(plan.siteEvidence.urlInventory.some((item) => item.area === "Canonical host"));
  assert.equal(plan.waybackEvidence.versions.length, 2);
  assert.ok(plan.siteEvidence.toolFootprint.some((item) => item.tool === "Marketing tags"));
  assert.ok(plan.keywordEvidence.some((item) => item.keyword.includes("drain cleaning")));
  assert.ok(plan.architecturalStateMap.rows.some((item) => item.area === "Domain architecture" && item.target === "www.client.example"));
  assert.ok(plan.architecturalStateMap.rows.some((item) => item.area === "Current URL" && item.target === "/services/drain-cleaning/" && item.decision === "Rework"));
  assert.ok(plan.architecturalStateMap.rows.some((item) => item.area === "Subdomain" && item.target === "staging.client.example"));
  assert.ok(plan.workstreams.some((item) => item.name === "Tracking and conversion"));
  assert.ok(plan.launchChecklist.some((item) => item.item === "DNS cutover" && item.phase === "Launch"));
  assert.ok(plan.kickoffResearch.marketSnapshot.some((item) => item.label === "Competitor and market SERP"));
  assert.ok(plan.kickoffResearch.keywordPageOpportunities.some((item) => item.label === "Priority keyword candidates"));
  assert.ok(plan.actionReport.priorityActions.some((item) => item.label === "Map keywords to pages" && item.source === "Inferred"));
  assert.ok(plan.actionReport.pageMap.some((item) => item.keyword.includes("drain cleaning")));
  assert.ok(plan.clientCallIntelligence.some((item) => item.prompt === "Confirm top services/markets"));
  assert.ok(plan.confirmationScript.some((item) => item.topic === "Structure approval"));
  assert.equal(plan.agentReadiness, null);
});

test("adds agent readiness when requested", () => {
  const plan = buildClientPlan(scan, { agentReady: true });

  assert.ok(plan.agentReadiness.rows.some((item) => item.signal === "robots.txt" && item.status === "Found"));
  assert.ok(plan.agentReadiness.rows.some((item) => item.signal === "AI crawler policy" && item.status === "Found"));
});

test("renders a Markdown plan for Obsidian", () => {
  const markdown = renderPlanMarkdown(scan, { obsidian: true, agentReady: true });

  assert.match(markdown, /report_type: "obsidian-plan"/);
  assert.match(markdown, /## Infrastructure Snapshot/);
  assert.match(markdown, /\| Registrar \/ Domain Provider \| GoDaddy \| High \|/);
  assert.match(markdown, /\| Cloudflare \| No - no obvious Cloudflare \| Low \|/);
  assert.match(markdown, /## Unknowns Blocking Work/);
  assert.match(markdown, /## Call One Workflow/);
  assert.match(markdown, /## Why FITFO Thinks This/);
  assert.match(markdown, /\| Area \| Finding \| Confidence \| Why FITFO Thinks This \| Client Follow-Up \|/);
  assert.match(markdown, /## Login \/ Access Checklist/);
  assert.match(markdown, /\| Domain registrar \| GoDaddy \|/);
  assert.match(markdown, /## Go Get These Logins/);
  assert.match(markdown, /\| Login \/ Access \| Current Public Status \| Owner \| What Client Needs To Get \|/);
  assert.match(markdown, /## Do Not Touch Until Confirmed/);
  assert.match(markdown, /## Previous Developer Request List/);
  assert.match(markdown, /## Citation \/ NAP Baseline/);
  assert.match(markdown, /Canonical NAP candidate only/);
  assert.match(markdown, /yelp/);
  assert.match(markdown, /## URL \/ Redirect Inventory/);
  assert.match(markdown, /\| Area \/ URL \| Extracted Evidence \| Client \/ Launch Question \|/);
  assert.match(markdown, /## Wayback Recent Versions/);
  assert.match(markdown, /### Wayback Change Flags/);
  assert.match(markdown, /Earlier archived homepage had forms/);
  assert.match(markdown, /## Lead Capture Inventory/);
  assert.match(markdown, /## Tracking \/ Tool Footprint/);
  assert.match(markdown, /## Evidence Labels/);
  assert.match(markdown, /## Architectural State Map/);
  assert.match(markdown, /Apex\/www variants resolve to more than one final host/);
  assert.match(markdown, /staging\.client\.example/);
  assert.match(markdown, /## Agent Readiness Snapshot/);
  assert.match(markdown, /\| Discoverability \| robots\.txt \| Found \|/);
  assert.match(markdown, /gptbot disallow/);
  assert.match(markdown, /## Focus First/);
  assert.match(markdown, /## Recommended Structure/);
  assert.match(markdown, /## Competitor-Informed Structure/);
  assert.match(markdown, /\| Priority \| Path \| Trigger \| Rationale \|/);
  assert.match(markdown, /## Top Local Competitors To Review/);
  assert.match(markdown, /Competitor Plumbing Services/);
  assert.match(markdown, /## Vertical Lens/);
  assert.match(markdown, /Plumbing \/ home services/);
  assert.match(markdown, /## Homeowner Emergency UX/);
  assert.match(markdown, /Emergency contact path/);
  assert.match(markdown, /## Plumbing Proof Assets Needed/);
  assert.match(markdown, /license and insurance details/);
  assert.match(markdown, /## Plumbing Call Questions/);
  assert.match(markdown, /Which plumbing jobs are most valuable right now/);
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
