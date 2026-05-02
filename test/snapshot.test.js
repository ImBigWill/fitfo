import assert from "node:assert/strict";
import test from "node:test";
import { buildSnapshot, renderSnapshotMarkdown } from "../src/snapshot.js";

const scan = {
  finishedAt: "2026-04-27T00:01:00.000Z",
  domain: {
    apex: "client.example",
    hostname: "www.client.example",
  },
  dns: {
    nameservers: ["ns1.example.com"],
    subdomains: [
      {
        name: "staging.client.example",
        cnames: ["client-staging.wpengine.com"],
        addresses: [],
      },
    ],
  },
  http: {
    reachable: true,
    title: "Client Example",
  },
  site: {
    enabled: true,
    summary: {
      pagesScanned: 3,
      pagesWithMetaDescription: 1,
      pagesMissingH1: 1,
      pagesWithMultipleH1: 0,
      formsDetected: 0,
      phonesDetected: ["555-123-4567"],
      schemaTypes: ["LocalBusiness"],
      ctas: ["Request a Quote"],
    },
    pages: [
      {
        path: "/",
        title: "Client Example",
        metaDescription: "Practical local service help.",
        headings: { h1: ["Local Service Help"] },
        forms: [],
        phones: ["555-123-4567"],
        ctas: ["Request a Quote"],
      },
      {
        path: "/services/",
        title: "Services",
        headings: { h1: [] },
        forms: [],
        phones: [],
        ctas: [],
      },
      {
        path: "/contact/",
        title: "Contact",
        metaDescription: "Contact us.",
        headings: { h1: ["Contact"] },
        forms: [],
        phones: ["555-123-4567"],
        ctas: [],
      },
    ],
    recommendations: ["Write unique meta descriptions for important pages before launch."],
  },
  research: {
    enabled: true,
    available: true,
    location: "Richmond, VA",
    queries: ["Client Example services Richmond VA"],
    results: [
      {
        query: "Client Example services Richmond VA",
        title: "Competitor Service Company",
        description: "Emergency service and maintenance plans",
        url: "https://competitor.example/services/",
      },
      {
        query: "Client Example reviews",
        title: "Client Example Yelp Reviews",
        description: "Customer reviews and ratings",
        url: "https://www.yelp.com/biz/client-example",
      },
    ],
    errors: [],
  },
  wayback: {
    enabled: false,
    versions: [],
    comparison: { changes: [] },
    warnings: [],
    errors: [],
  },
  analysis: {
    registrar: "GoDaddy",
    registrarDetails: { confidence: "High" },
    dnsProvider: "Example DNS",
    cloudflare: { status: "No obvious Cloudflare", confidence: "Low" },
    cms: {
      platform: "WordPress",
      confidence: "Medium",
    },
    hosting: {
      provider: "Unknown",
      confidence: "Low",
    },
    email: {
      provider: "Google Workspace",
    },
    connectedServices: [],
    marketing: {
      found: ["Google Tag Manager"],
    },
    operations: {
      found: ["ServiceTitan"],
    },
  },
};

test("builds a light first-call snapshot", () => {
  const snapshot = buildSnapshot(scan);

  assert.equal(snapshot.subject, "client.example");
  assert.ok(snapshot.accessSignals.some(([label, value]) => label === "Website host" && value.includes("Unknown")));
  assert.ok(snapshot.accessSignals.some(([label, value]) => label === "Google Workspace" && value.includes("Detected")));
  assert.ok(snapshot.serviceSignals.some((item) => item.label === "CRM / booking / field service" && item.detail.includes("ServiceTitan")));
  assert.ok(snapshot.subdomainsToVerify.some((item) => item.label === "staging.client.example" && item.detail.includes("wpengine")));
  assert.ok(snapshot.positioningRead.some((item) => item.label === "What visitors likely see first" && item.detail === "Local Service Help"));
  assert.ok(snapshot.whatIsWorking.some((item) => item.label === "The site is live and accessible"));
  assert.ok(snapshot.frictionPoints.some((item) => item.label === "Lead capture may be too thin"));
  assert.ok(snapshot.frictionPoints.some((item) => item.label === "Subdomains need ownership review"));
  assert.ok(snapshot.opportunities.some((item) => item.label === "Use competitor patterns without copying them"));
  assert.ok(snapshot.howWeCanHelp.some((item) => item.label === "Clarify positioning"));
  assert.ok(snapshot.walkthroughFlow.some((item) => item.label === "Close with a concrete next step"));
  assert.ok(snapshot.talkTrack.some((item) => item.detail.includes("This is not a full audit")));
  assert.ok(snapshot.clientQuestions.some((item) => item.label === "What should a visitor do first?"));
});

test("renders a generic Markdown snapshot", () => {
  const markdown = renderSnapshotMarkdown(scan, { obsidian: true });

  assert.match(markdown, /report_type: "obsidian-snapshot"/);
  assert.match(markdown, /# FitFo Snapshot - client\.example/);
  assert.match(markdown, /A light first-call walkthrough/);
  assert.match(markdown, /## Access Signals/);
  assert.match(markdown, /\| Google Workspace \| Detected via MX \|/);
  assert.match(markdown, /## Service Tools To Confirm/);
  assert.match(markdown, /ServiceTitan/);
  assert.match(markdown, /## Subdomains To Verify/);
  assert.match(markdown, /staging\.client\.example/);
  assert.match(markdown, /## What The Site Is Doing Right/);
  assert.match(markdown, /## What May Be Holding It Back/);
  assert.match(markdown, /## How An Agency Can Help/);
  assert.doesNotMatch(markdown, /Lovable Gazelle/);
  assert.doesNotMatch(markdown, /PMF/);
});
