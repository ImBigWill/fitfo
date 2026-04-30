import { mkdir, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";
import { buildBrief } from "../brief.js";
import { buildClientPlan } from "../plan.js";

const KEYWORD_CLUSTER_LABELS = {
  coreServices: "Core services",
  emergency: "Emergency / high intent",
  local: "Local modifiers",
  informational: "Informational",
  proofTrust: "Proof / trust",
};

export function buildTableExportBundle(scan, options = {}) {
  const reportType = options.report === "plan" || options.report === "onboard" ? "plan" : "brief";
  const report = reportType === "plan" ? buildClientPlan(scan) : buildBrief(scan);
  const actionReport = report.actionReport || {};
  const competitorResearch = actionReport.competitorResearch || {};

  return {
    metadata: {
      domain: scan.domain?.apex || "unknown",
      generatedAt: scan.finishedAt,
      reportType,
      location: scan.research?.location || null,
      searchEnabled: Boolean(scan.research?.enabled),
      searchAvailable: Boolean(scan.research?.available),
      searchQueries: scan.research?.queries || [],
    },
    infrastructureSnapshot: normalizeInfrastructureSnapshot(report.infrastructureSnapshot || []),
    loginChecklist: normalizeLoginChecklist(report.loginChecklist || []),
    unknownBlockers: normalizeUnknownBlockers(report.unknownBlockers || []),
    callOneWorkflow: normalizeCallOneWorkflow(report.callOneWorkflow || []),
    hostingEvidence: normalizeHostingEvidence(scan.analysis?.hosting || {}),
    waybackVersions: normalizeWaybackVersions(report.waybackEvidence || {}),
    waybackChanges: normalizeWaybackChanges(report.waybackEvidence || {}),
    actionItems: normalizeActionItems(actionReport.priorityActions || []),
    proofAssets: normalizeProofAssets(actionReport.proofAssets || []),
    contentInventory: normalizeContentInventory(actionReport.contentInventory || []),
    competitorStructure: normalizeCompetitorStructure(report.competitorStructure || []),
    reputationSummary: normalizeReputationSummary(report.reputationSummary || []),
    serviceLocationRecommendations: normalizeServiceLocationRecommendations(report.serviceLocationRecommendations || []),
    launchChecklist: normalizeLaunchChecklist(report.launchChecklist || []),
    confirmationScript: normalizeConfirmationScript(report.confirmationScript || []),
    keywordClusters: normalizeKeywordClusters(actionReport.keywordClusters || {}),
    topLocalCompetitors: normalizeTopLocalCompetitors(competitorResearch.topLocalCompetitors || []),
    competitors: normalizeCompetitors(competitorResearch),
    keywordPageMap: normalizePageMap(actionReport.pageMap || []),
    researchResults: normalizeResearchResults(scan.research?.results || []),
  };
}

export async function writeTableExports(scan, options = {}) {
  const directory = absoluteExportPath(options.dir || "fitfo-exports");
  const bundle = buildTableExportBundle(scan, options);
  const domain = safeFilePart(bundle.metadata.domain);
  await mkdir(directory, { recursive: true });

  const files = {
    actionItems: path.join(directory, `${domain}-action-items.csv`),
    infrastructureSnapshot: path.join(directory, `${domain}-infrastructure-snapshot.csv`),
    loginChecklist: path.join(directory, `${domain}-login-checklist.csv`),
    unknownBlockers: path.join(directory, `${domain}-unknown-blockers.csv`),
    callOneWorkflow: path.join(directory, `${domain}-call-one-workflow.csv`),
    hostingEvidence: path.join(directory, `${domain}-hosting-evidence.csv`),
    waybackVersions: path.join(directory, `${domain}-wayback-versions.csv`),
    waybackChanges: path.join(directory, `${domain}-wayback-changes.csv`),
    proofAssets: path.join(directory, `${domain}-proof-assets.csv`),
    contentInventory: path.join(directory, `${domain}-content-inventory.csv`),
    competitorStructure: path.join(directory, `${domain}-competitor-structure.csv`),
    reputationSummary: path.join(directory, `${domain}-reputation-summary.csv`),
    serviceLocationRecommendations: path.join(directory, `${domain}-service-location-recommendations.csv`),
    launchChecklist: path.join(directory, `${domain}-launch-checklist.csv`),
    confirmationScript: path.join(directory, `${domain}-confirmation-script.csv`),
    keywordClusters: path.join(directory, `${domain}-keyword-clusters.csv`),
    topLocalCompetitors: path.join(directory, `${domain}-top-local-competitors.csv`),
    competitors: path.join(directory, `${domain}-competitors.csv`),
    keywordPageMap: path.join(directory, `${domain}-keyword-page-map.csv`),
    researchResults: path.join(directory, `${domain}-research-results.csv`),
    json: path.join(directory, `${domain}-research-tables.json`),
  };

  await Promise.all([
    writeFile(files.actionItems, toCsv(bundle.actionItems, [
      ["priority", "Priority"],
      ["source", "Source"],
      ["owner", "Owner"],
      ["action", "Action"],
      ["detail", "Detail"],
    ]), "utf8"),
    writeFile(files.infrastructureSnapshot, toCsv(bundle.infrastructureSnapshot, [
      ["area", "Area"],
      ["finding", "Public Finding"],
      ["confidence", "Confidence"],
      ["clientNeed", "Client Needs"],
    ]), "utf8"),
    writeFile(files.loginChecklist, toCsv(bundle.loginChecklist, [
      ["access", "Access"],
      ["status", "Public Status"],
      ["needed", "Needed From Client"],
    ]), "utf8"),
    writeFile(files.unknownBlockers, toCsv(bundle.unknownBlockers, [
      ["area", "Blocker"],
      ["severity", "Severity"],
      ["owner", "Owner"],
      ["evidence", "Evidence"],
      ["ask", "Ask"],
    ]), "utf8"),
    writeFile(files.callOneWorkflow, toCsv(bundle.callOneWorkflow, [
      ["area", "Area"],
      ["found", "Found"],
      ["need", "Need"],
      ["risk", "Risk"],
      ["ask", "Ask"],
      ["owner", "Owner"],
      ["audience", "Audience"],
    ]), "utf8"),
    writeFile(files.hostingEvidence, toCsv(bundle.hostingEvidence, [
      ["provider", "Provider"],
      ["confidence", "Confidence"],
      ["edge", "Edge / Proxy Note"],
      ["evidence", "Evidence"],
      ["note", "Note"],
    ]), "utf8"),
    writeFile(files.waybackVersions, toCsv(bundle.waybackVersions, [
      ["capturedAt", "Captured"],
      ["original", "URL"],
      ["title", "Title"],
      ["h1", "H1"],
      ["wordCount", "Words"],
      ["formCount", "Forms"],
      ["phones", "Phones"],
      ["toolSignals", "Tools"],
      ["archiveUrl", "Archive URL"],
    ]), "utf8"),
    writeFile(files.waybackChanges, toCsv(bundle.waybackChanges, [
      ["signal", "Signal"],
      ["previous", "Previous Capture"],
      ["latest", "Latest Capture"],
      ["note", "Note"],
      ["warning", "Warning"],
    ]), "utf8"),
    writeFile(files.proofAssets, toCsv(bundle.proofAssets, [
      ["priority", "Priority"],
      ["owner", "Owner"],
      ["asset", "Asset"],
      ["reason", "Reason"],
    ]), "utf8"),
    writeFile(files.contentInventory, toCsv(bundle.contentInventory, [
      ["path", "Path"],
      ["type", "Type"],
      ["title", "Title"],
      ["status", "Status"],
      ["action", "Action"],
    ]), "utf8"),
    writeFile(files.competitorStructure, toCsv(bundle.competitorStructure, [
      ["priority", "Priority"],
      ["path", "Path"],
      ["trigger", "Trigger"],
      ["rationale", "Rationale"],
    ]), "utf8"),
    writeFile(files.reputationSummary, toCsv(bundle.reputationSummary, [
      ["channel", "Channel"],
      ["signal", "Signal"],
      ["action", "Action"],
    ]), "utf8"),
    writeFile(files.serviceLocationRecommendations, toCsv(bundle.serviceLocationRecommendations, [
      ["priority", "Priority"],
      ["type", "Type"],
      ["page", "Page"],
      ["focus", "Focus"],
      ["recommendation", "Recommendation"],
    ]), "utf8"),
    writeFile(files.launchChecklist, toCsv(bundle.launchChecklist, [
      ["phase", "Phase"],
      ["item", "Item"],
      ["detail", "Detail"],
    ]), "utf8"),
    writeFile(files.confirmationScript, toCsv(bundle.confirmationScript, [
      ["topic", "Topic"],
      ["ask", "Ask"],
      ["why", "Why"],
    ]), "utf8"),
    writeFile(files.keywordClusters, toCsv(bundle.keywordClusters, [
      ["cluster", "Cluster"],
      ["keyword", "Keyword"],
    ]), "utf8"),
    writeFile(files.topLocalCompetitors, toCsv(bundle.topLocalCompetitors, [
      ["name", "Competitor"],
      ["reason", "Why It Surfaced"],
      ["source", "Source Query"],
      ["url", "URL"],
    ]), "utf8"),
    writeFile(files.competitors, toCsv(bundle.competitors, [
      ["type", "Type"],
      ["title", "Title"],
      ["url", "URL"],
      ["query", "Query"],
      ["description", "Description"],
      ["patterns", "Patterns"],
    ]), "utf8"),
    writeFile(files.keywordPageMap, toCsv(bundle.keywordPageMap, [
      ["priority", "Priority"],
      ["intent", "Intent"],
      ["keyword", "Keyword"],
      ["page", "Page"],
      ["status", "Status"],
      ["note", "Note"],
    ]), "utf8"),
    writeFile(files.researchResults, toCsv(bundle.researchResults, [
      ["query", "Query"],
      ["title", "Title"],
      ["url", "URL"],
      ["description", "Description"],
    ]), "utf8"),
    writeFile(files.json, `${JSON.stringify(bundle, null, 2)}\n`, "utf8"),
  ]);

  return {
    directory,
    files,
  };
}

export function toCsv(rows, columns) {
  return [
    columns.map(([, label]) => csvCell(label)).join(","),
    ...rows.map((row) => columns.map(([key]) => csvCell(row[key])).join(",")),
  ].join("\n") + "\n";
}

function normalizeActionItems(items) {
  return items.map((item) => ({
    priority: item.priority || "",
    source: item.source || "Inferred",
    owner: item.owner || "",
    action: item.label || item.action || "",
    detail: item.detail || "",
  }));
}

function normalizeInfrastructureSnapshot(items) {
  return items.map((item) => ({
    area: item.area || "",
    finding: item.finding || "",
    confidence: item.confidence || "",
    clientNeed: item.clientNeed || "",
  }));
}

function normalizeLoginChecklist(items) {
  return items.map((item) => ({
    access: item.access || "",
    status: item.status || "",
    needed: item.needed || "",
  }));
}

function normalizeUnknownBlockers(items) {
  return items.map((item) => ({
    area: item.area || "",
    severity: item.severity || "",
    owner: item.owner || "",
    evidence: item.evidence || "",
    ask: item.ask || "",
  }));
}

function normalizeCallOneWorkflow(items) {
  return items.map((item) => ({
    area: item.area || "",
    found: item.found || "",
    need: item.need || "",
    risk: item.risk || "",
    ask: item.ask || "",
    owner: item.owner || "",
    audience: item.audience || "",
  }));
}

function normalizeHostingEvidence(hosting) {
  const evidence = hosting.evidence?.length ? hosting.evidence : ["No hosting evidence captured"];
  return evidence.map((item) => ({
    provider: hosting.provider || "Unknown",
    confidence: hosting.confidence || "Manual",
    edge: hosting.edge || "",
    evidence: item,
    note: hosting.note || "",
  }));
}

function normalizeWaybackVersions(evidence) {
  return (evidence.versions || []).map((version) => ({
    capturedAt: version.capturedAt || "",
    original: version.original || "",
    title: version.title || "",
    h1: version.h1 || "",
    wordCount: version.wordCount || 0,
    formCount: version.formCount || 0,
    phones: (version.phones || []).join(", "),
    toolSignals: (version.toolSignals || []).join(", "),
    archiveUrl: version.archiveUrl || "",
  }));
}

function normalizeWaybackChanges(evidence) {
  const changes = (evidence.changes || []).map((item) => ({
    signal: item.signal || "",
    previous: item.previous || "",
    latest: item.latest || "",
    note: item.note || "",
    warning: "",
  }));

  return [
    ...changes,
    ...(evidence.warnings || []).map((warning) => ({
      signal: "Risk note",
      previous: "",
      latest: "",
      note: "",
      warning,
    })),
  ];
}

function normalizeProofAssets(items) {
  return items.map((item) => ({
    priority: item.priority || "",
    owner: item.owner || "",
    asset: item.asset || "",
    reason: item.reason || "",
  }));
}

function normalizeContentInventory(items) {
  return items.map((item) => ({
    path: item.path || "",
    type: item.type || "",
    title: item.title || "",
    status: item.status || "",
    action: item.action || "",
  }));
}

function normalizeCompetitorStructure(items) {
  return items.map((item) => ({
    priority: item.priority || "",
    path: item.path || "",
    trigger: item.trigger || "",
    rationale: item.rationale || "",
  }));
}

function normalizeReputationSummary(items) {
  return items.map((item) => ({
    channel: item.channel || "",
    signal: item.signal || "",
    action: item.action || "",
  }));
}

function normalizeServiceLocationRecommendations(items) {
  return items.map((item) => ({
    priority: item.priority || "",
    type: item.type || "",
    page: item.page || "",
    focus: item.focus || "",
    recommendation: item.recommendation || "",
  }));
}

function normalizeLaunchChecklist(items) {
  return items.map((item) => ({
    phase: item.phase || "",
    item: item.item || "",
    detail: item.detail || "",
  }));
}

function normalizeConfirmationScript(items) {
  return items.map((item) => ({
    topic: item.topic || "",
    ask: item.ask || "",
    why: item.why || "",
  }));
}

function normalizeKeywordClusters(clusters) {
  return Object.entries(KEYWORD_CLUSTER_LABELS).flatMap(([key, label]) => (
    (clusters[key] || []).map((keyword) => ({
      cluster: label,
      keyword,
    }))
  ));
}

function normalizeCompetitors(research) {
  return [
    ...typedResults("competitor", research.competitors || []),
    ...typedResults("directory", research.directories || []),
    ...typedResults("review", research.reviewProfiles || []),
    ...typedResults("social", research.socialProfiles || []),
    ...typedResults("owned", research.owned || []),
    ...typedResults("other", research.other || []),
  ];
}

function normalizeTopLocalCompetitors(items) {
  return items.map((item) => ({
    name: item.name || "",
    reason: item.reason || "",
    source: item.source || "",
    url: item.url || "",
  }));
}

function typedResults(type, results) {
  return results.map((result) => ({
    type,
    title: result.title || "",
    url: result.url || "",
    query: result.query || "",
    description: result.description || "",
    patterns: (result.patterns || []).join(", "),
  }));
}

function normalizePageMap(items) {
  return items.map((item) => ({
    priority: item.priority || "",
    intent: item.intent || "",
    keyword: item.keyword || "",
    page: item.page || "",
    status: item.status || "",
    note: item.note || "",
  }));
}

function normalizeResearchResults(results) {
  return results.map((result) => ({
    query: result.query || "",
    title: result.title || "",
    url: result.url || "",
    description: result.description || "",
  }));
}

function csvCell(value) {
  const text = String(value ?? "");
  if (!/[",\n\r]/.test(text)) return text;
  return `"${text.replace(/"/g, '""')}"`;
}

function absoluteExportPath(value) {
  return path.resolve(expandHome(value));
}

function expandHome(value) {
  const input = String(value || "");
  if (input === "~") return homedir();
  if (input.startsWith("~/")) return path.join(homedir(), input.slice(2));
  return input;
}

function safeFilePart(value) {
  return String(value || "fitfo")
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, "-")
    .replace(/^-+|-+$/g, "") || "fitfo";
}
