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
    nameservers: ["ns1.domaincontrol.com", "ns2.domaincontrol.com"],
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
      { path: "/", title: "Client Example Plumbing", metaDescription: "Local plumbing help.", headings: { h1: ["Client Example"] }, forms: [], phones: ["555-123-4567"], ctas: ["Request an Estimate"] },
      { path: "/services/drain-cleaning/", title: "Drain Cleaning", headings: { h1: ["Drain Cleaning"] }, forms: [], phones: [], ctas: ["Request an Estimate"] },
      { path: "/contact/", title: "Contact", metaDescription: "Contact us.", headings: { h1: ["Contact"] }, forms: [{ raw: "<form>" }], phones: ["555-123-4567"], ctas: [] },
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
  wayback: {
    enabled: true,
    provider: "internet-archive",
    snapshotsFound: 2,
    checkedUrls: ["https://client.example/", "https://www.client.example/"],
    versions: [
      {
        capturedAt: "2026-04-01 12:00 UTC",
        original: "https://client.example/",
        title: "Client Example Plumbing",
        h1: "Client Example",
        metaDescription: "Local plumbing help.",
        metaRobots: "",
        wordCount: 420,
        formCount: 0,
        phones: ["555-123-4567"],
        ctas: ["Request an Estimate"],
        toolSignals: ["Google Tag Manager"],
        archiveUrl: "https://web.archive.org/web/20260401120000/https://client.example/",
      },
      {
        capturedAt: "2025-12-01 12:00 UTC",
        original: "https://client.example/",
        title: "Old Agency Plumbing",
        h1: "Plumbing Repairs",
        metaDescription: "Old plumbing copy.",
        metaRobots: "",
        wordCount: 650,
        formCount: 1,
        phones: ["555-123-4567"],
        ctas: ["Book Service"],
        toolSignals: ["Google Tag Manager", "CallRail"],
        archiveUrl: "https://web.archive.org/web/20251201120000/https://client.example/",
      },
    ],
    comparison: {
      available: true,
      changes: [
        { signal: "Title", previous: "Old Agency Plumbing", latest: "Client Example Plumbing", note: "Changed between recent Wayback captures." },
        { signal: "Forms", previous: "1", latest: "0", note: "-1 from previous capture." },
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
  assert.equal(brief.waybackEvidence.versions.length, 2);
  assert.ok(brief.waybackEvidence.changes.some((item) => item.signal === "Forms"));
  assert.ok(brief.marketResearch.some((item) => item.label === "Queries"));
  assert.ok(brief.kickoffResearch.currentSiteRead.some((item) => item.label === "Lead paths" && item.source === "Observed"));
  assert.ok(brief.kickoffResearch.marketSnapshot.some((item) => item.label === "Review and reputation signals" && item.source === "Research"));
  assert.ok(brief.kickoffResearch.keywordPageOpportunities.some((item) => item.label === "Priority keyword candidates" && item.detail.includes("drain cleaning")));
  assert.ok(brief.kickoffResearch.positioningHypotheses.some((item) => item.label === "Differentiators to validate"));
  assert.ok(brief.kickoffResearch.kickoffCallAgenda.some((item) => item.label === "Market and SEO assumptions"));
  assert.ok(brief.actionReport.priorityActions.some((item) => item.label === "Map keywords to pages" && item.source === "Inferred"));
  assert.ok(brief.actionReport.keywordClusters.coreServices.includes("drain cleaning"));
  assert.ok(brief.actionReport.keywordClusters.emergency.some((keyword) => keyword.includes("emergency plumbing repair")));
  assert.ok(brief.actionReport.competitorResearch.competitors.some((result) => result.title === "Emergency Plumbing Repair Richmond VA"));
  assert.ok(brief.actionReport.competitorResearch.topLocalCompetitors.some((result) => result.name === "Emergency Plumbing Repair Richmond VA"));
  assert.ok(brief.actionReport.competitorResearch.reviewProfiles.some((result) => result.title.includes("Yelp")));
  assert.ok(brief.infrastructureSnapshot.some((item) => item.area === "Registrar / Domain Provider" && item.finding === "GoDaddy"));
  assert.ok(brief.loginChecklist.some((item) => item.access === "Cloudflare" && item.status === "No - no obvious Cloudflare"));
  assert.ok(brief.unknownBlockers.some((item) => item.area === "Subdomain inventory"));
  assert.ok(brief.callOneWorkflow.some((item) => item.area === "Internal next step" && item.owner === "Us"));
  assert.ok(brief.confidenceExplanations.some((item) => item.area === "Registrar" && item.finding === "GoDaddy"));
  assert.ok(brief.clientAccessRequests.some((item) => item.access === "Domain registrar" && item.owner === "Client"));
  assert.ok(brief.doNotTouchWarnings.some((item) => item.area === "Email"));
  assert.ok(brief.previousDeveloperRequestItems.some((item) => item.includes("Full DNS zone export")));
  assert.ok(brief.actionReport.siteEvidence.urlInventory.some((item) => item.area === "Canonical host"));
  assert.ok(brief.actionReport.siteEvidence.leadCaptureInventory.some((item) => item.signal === "Form"));
  assert.ok(brief.actionReport.siteEvidence.toolFootprint.some((item) => item.tool === "Marketing tags"));
  assert.ok(brief.actionReport.keywordEvidence.some((item) => item.keyword === "drain cleaning"));
  assert.ok(brief.actionReport.pageMap.some((item) => item.keyword === "drain cleaning" && item.status === "Improve existing"));
  assert.ok(brief.actionReport.proofAssets.some((item) => item.asset === "Reviews and testimonials" && item.priority === "High"));
  assert.ok(brief.actionReport.contentInventory.some((item) => item.path === "/services/drain-cleaning/" && item.type === "Service"));
  assert.ok(brief.competitorStructure.some((item) => item.path === "/reviews/" && item.priority === "High"));
  assert.ok(brief.reputationSummary.some((item) => item.channel === "Review profiles" && item.signal.includes("1")));
  assert.ok(brief.serviceLocationRecommendations.some((item) => item.page === "/services/drain-cleaning/" && item.type === "Service"));
  assert.ok(brief.confirmationScript.some((item) => item.topic === "Competitor reality check"));
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
  assert.match(markdown, /## Infrastructure Snapshot/);
  assert.match(markdown, /\| Registrar \/ Domain Provider \| GoDaddy \| High \|/);
  assert.match(markdown, /\| Cloudflare \| No - no obvious Cloudflare \| Low \|/);
  assert.match(markdown, /## Unknowns Blocking Work/);
  assert.match(markdown, /\| Blocker \| Severity \| Owner \| Evidence \| Ask \|/);
  assert.match(markdown, /## Call One Workflow/);
  assert.match(markdown, /\| Area \| Found \| Need \| Risk \| Ask \| Owner \| Audience \|/);
  assert.match(markdown, /## Why FITFO Thinks This/);
  assert.match(markdown, /\| Area \| Finding \| Confidence \| Why FITFO Thinks This \| Client Follow-Up \|/);
  assert.match(markdown, /## Login \/ Access Checklist/);
  assert.match(markdown, /\| Domain registrar \| GoDaddy \|/);
  assert.match(markdown, /## Go Get These Logins/);
  assert.match(markdown, /\| Login \/ Access \| Current Public Status \| Owner \| What Client Needs To Get \|/);
  assert.match(markdown, /## Do Not Touch Until Confirmed/);
  assert.match(markdown, /\| Area \| Do Not Touch \| Why It Matters \|/);
  assert.match(markdown, /## Previous Developer Request List/);
  assert.match(markdown, /## URL \/ Redirect Inventory/);
  assert.match(markdown, /\| Area \/ URL \| Extracted Evidence \| Client \/ Launch Question \|/);
  assert.match(markdown, /## Wayback Recent Versions/);
  assert.match(markdown, /\| Captured \| URL \| Title \| H1 \| Words \| Forms \| Phones \| Tools \|/);
  assert.match(markdown, /### Wayback Change Flags/);
  assert.match(markdown, /Earlier archived homepage had forms/);
  assert.match(markdown, /## Lead Capture Inventory/);
  assert.match(markdown, /\| Page \| Signal \| Extracted Details \| Client \/ Tracking Question \|/);
  assert.match(markdown, /## Tracking \/ Tool Footprint/);
  assert.match(markdown, /## Confirm On The Call/);
  assert.match(markdown, /## Site Intelligence/);
  assert.match(markdown, /## Market Research/);
  assert.match(markdown, /## Kickoff Research Brief/);
  assert.match(markdown, /### Current Site Read/);
  assert.match(markdown, /### Keyword \+ Page Opportunities/);
  assert.match(markdown, /_Research_:/);
  assert.match(markdown, /## Detailed Action Report/);
  assert.match(markdown, /\| Priority \| Source \| Owner \| Action \| Detail \|/);
  assert.match(markdown, /## Proof Assets Needed/);
  assert.match(markdown, /## Content Inventory/);
  assert.match(markdown, /## Keyword Research/);
  assert.match(markdown, /\| Cluster \| Keywords \|/);
  assert.match(markdown, /## Keyword Evidence/);
  assert.match(markdown, /\| Cluster \| Keyword \| Evidence Source \| Mapped Page \| Next Step \|/);
  assert.match(markdown, /## Competitor Research/);
  assert.match(markdown, /## Top Local Competitors To Review/);
  assert.match(markdown, /Emergency Plumbing Repair Richmond VA/);
  assert.match(markdown, /## Review \+ Reputation Summary/);
  assert.match(markdown, /\| Channel \| Signal \| Action \|/);
  assert.match(markdown, /## Competitor-Informed Structure/);
  assert.match(markdown, /\| Priority \| Path \| Trigger \| Rationale \|/);
  assert.match(markdown, /## Service \+ Location Recommendations/);
  assert.match(markdown, /\| Priority \| Type \| Page \| Focus \| Recommendation \|/);
  assert.match(markdown, /## Keyword To Page Map/);
  assert.match(markdown, /## Suggested Site Structure/);
  assert.match(markdown, /## Client Call Intelligence/);
  assert.match(markdown, /## Kickoff Confirmation Script/);
  assert.match(markdown, /\| Topic \| Ask \| Why \|/);
  assert.match(markdown, /Confirm CRM\/booking owner/);
  assert.match(markdown, /## Research Queue/);
  assert.match(markdown, /## First-Call Questions/);
});
