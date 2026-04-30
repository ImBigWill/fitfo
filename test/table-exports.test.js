import assert from "node:assert/strict";
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { buildTableExportBundle, toCsv, writeTableExports } from "../src/exports/tables.js";

const scan = {
  finishedAt: "2026-04-27T00:01:00.000Z",
  domain: { apex: "client.example" },
  dns: { nameservers: ["ns1.domaincontrol.com"], subdomains: [] },
  http: { reachable: true, title: "Client Plumbing" },
  site: {
    enabled: true,
    summary: { pagesScanned: 2, formsDetected: 1, phonesDetected: ["555-123-4567"], ctas: ["Book Now"] },
    pages: [
      { path: "/", title: "Client Plumbing", metaDescription: "Local plumber.", headings: { h1: ["Client Plumbing"] }, forms: [], phones: ["555-123-4567"], ctas: ["Book Now"] },
      { path: "/services/drain-cleaning/", title: "Drain Cleaning", headings: { h1: ["Drain Cleaning"] }, forms: [], phones: [], ctas: [] },
    ],
  },
  research: {
    enabled: true,
    available: true,
    location: "Richmond, VA",
    queries: ["plumber Richmond, VA"],
    results: [
      {
        query: "plumber Richmond, VA",
        title: "Competitor Plumbing",
        description: "Emergency plumbing repair",
        url: "https://competitor.example",
      },
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
        toolSignals: ["Google Tag Manager"],
        archiveUrl: "https://web.archive.org/web/20260401120000/https://client.example/",
      },
      {
        capturedAt: "2025-12-01 12:00 UTC",
        original: "https://client.example/",
        title: "Old Client Plumbing",
        h1: "Old Client Plumbing",
        wordCount: 650,
        formCount: 1,
        phones: ["555-123-4567"],
        toolSignals: ["Google Tag Manager", "CallRail"],
        archiveUrl: "https://web.archive.org/web/20251201120000/https://client.example/",
      },
    ],
    comparison: {
      changes: [
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
    cms: { platform: "WordPress", confidence: "Medium" },
    hosting: {
      provider: "WP Engine",
      confidence: "Medium",
      edge: "No obvious Cloudflare edge detected.",
      evidence: ["CNAME: client.wpengine.com", "HTTP x-powered-by: WP Engine"],
      note: "Detected from public DNS, HTTP, reverse DNS, or ASN/network hints.",
    },
    email: { provider: "Google Workspace" },
    connectedServices: [],
    marketing: { found: [] },
    operations: { found: [] },
    launchChecklist: [
      { item: "Canonical host", detail: "Preserve apex." },
      { item: "DNS cutover", detail: "Confirm TTLs." },
    ],
  },
};

test("builds table export rows for research sidecars", () => {
  const bundle = buildTableExportBundle(scan, { report: "brief" });

  assert.equal(bundle.metadata.domain, "client.example");
  assert.ok(bundle.infrastructureSnapshot.some((item) => item.area === "Registrar / Domain Provider" && item.finding === "GoDaddy"));
  assert.ok(bundle.loginChecklist.some((item) => item.access === "Cloudflare" && item.status === "No - no obvious Cloudflare"));
  assert.ok(bundle.hostingEvidence.some((item) => item.provider === "WP Engine" && item.evidence.includes("CNAME")));
  assert.ok(bundle.waybackVersions.some((item) => item.title === "Client Plumbing"));
  assert.ok(bundle.waybackChanges.some((item) => item.signal === "Forms"));
  assert.ok(bundle.actionItems.some((item) => item.action === "Map keywords to pages" && item.source === "Inferred"));
  assert.ok(bundle.contentInventory.some((item) => item.path === "/services/drain-cleaning/"));
  assert.ok(bundle.competitorStructure.some((item) => item.path.startsWith("/services/")));
  assert.ok(bundle.reputationSummary.some((item) => item.channel === "Market patterns"));
  assert.ok(bundle.serviceLocationRecommendations.some((item) => item.page === "/services/drain-cleaning/"));
  assert.ok(bundle.confirmationScript.some((item) => item.topic === "Competitor reality check"));
  assert.ok(bundle.keywordClusters.some((item) => item.keyword === "drain cleaning"));
  assert.ok(bundle.topLocalCompetitors.some((item) => item.name === "Competitor Plumbing"));
  assert.ok(bundle.competitors.some((item) => item.type === "competitor" && item.title === "Competitor Plumbing"));
  assert.ok(bundle.keywordPageMap.some((item) => item.keyword === "drain cleaning"));
  assert.ok(bundle.researchResults.some((item) => item.query === "plumber Richmond, VA"));
});

test("builds plan launch checklist export rows", () => {
  const bundle = buildTableExportBundle(scan, { report: "plan" });

  assert.ok(bundle.launchChecklist.some((item) => item.item === "DNS cutover" && item.phase === "Launch"));
});

test("treats onboard table exports as plan exports", () => {
  const bundle = buildTableExportBundle(scan, { report: "onboard" });

  assert.equal(bundle.metadata.reportType, "plan");
  assert.ok(bundle.launchChecklist.some((item) => item.item === "DNS cutover" && item.phase === "Launch"));
});

test("writes CSV and JSON table exports", async () => {
  const directory = await mkdtemp(path.join(tmpdir(), "fitfo-table-exports-"));
  const result = await writeTableExports(scan, { dir: directory, report: "brief" });

  const keywords = await readFile(result.files.keywordClusters, "utf8");
  const infrastructure = await readFile(result.files.infrastructureSnapshot, "utf8");
  const logins = await readFile(result.files.loginChecklist, "utf8");
  const hosting = await readFile(result.files.hostingEvidence, "utf8");
  const waybackVersions = await readFile(result.files.waybackVersions, "utf8");
  const waybackChanges = await readFile(result.files.waybackChanges, "utf8");
  const topLocal = await readFile(result.files.topLocalCompetitors, "utf8");
  const script = await readFile(result.files.confirmationScript, "utf8");
  const serviceLocation = await readFile(result.files.serviceLocationRecommendations, "utf8");
  const json = JSON.parse(await readFile(result.files.json, "utf8"));

  assert.match(keywords, /Cluster,Keyword/);
  assert.match(keywords, /Core services,drain cleaning/);
  assert.match(infrastructure, /Area,Public Finding,Confidence,Client Needs/);
  assert.match(infrastructure, /Registrar \/ Domain Provider,GoDaddy,High/);
  assert.match(logins, /Access,Public Status,Needed From Client/);
  assert.match(logins, /Cloudflare,No - no obvious Cloudflare/);
  assert.match(hosting, /Provider,Confidence,Edge \/ Proxy Note,Evidence,Note/);
  assert.match(hosting, /WP Engine,Medium/);
  assert.match(waybackVersions, /Captured,URL,Title,H1,Words,Forms,Phones,Tools,Archive URL/);
  assert.match(waybackVersions, /2026-04-01 12:00 UTC/);
  assert.match(waybackChanges, /Signal,Previous Capture,Latest Capture,Note,Warning/);
  assert.match(waybackChanges, /Forms,1,0/);
  assert.match(topLocal, /Competitor,Why It Surfaced,Source Query,URL/);
  assert.match(script, /Topic,Ask,Why/);
  assert.match(serviceLocation, /Priority,Type,Page,Focus,Recommendation/);
  assert.equal(json.metadata.domain, "client.example");
  assert.ok(json.hostingEvidence.some((item) => item.evidence.includes("WP Engine")));
  assert.ok(json.waybackVersions.some((item) => item.title === "Client Plumbing"));
  assert.ok(json.waybackChanges.some((item) => item.warning.includes("forms")));
  assert.ok(json.topLocalCompetitors.some((item) => item.name === "Competitor Plumbing"));
  assert.ok(json.competitors.some((item) => item.title === "Competitor Plumbing"));
  assert.ok(json.confirmationScript.some((item) => item.topic === "Structure approval"));
});

test("escapes CSV cells", () => {
  const csv = toCsv([{ value: "one, two \"quoted\"" }], [["value", "Value"]]);

  assert.equal(csv, "Value\n\"one, two \"\"quoted\"\"\"\n");
});
