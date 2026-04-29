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
    actionItems: normalizeActionItems(actionReport.priorityActions || []),
    proofAssets: normalizeProofAssets(actionReport.proofAssets || []),
    contentInventory: normalizeContentInventory(actionReport.contentInventory || []),
    competitorStructure: normalizeCompetitorStructure(report.competitorStructure || []),
    reputationSummary: normalizeReputationSummary(report.reputationSummary || []),
    serviceLocationRecommendations: normalizeServiceLocationRecommendations(report.serviceLocationRecommendations || []),
    launchChecklist: normalizeLaunchChecklist(report.launchChecklist || []),
    confirmationScript: normalizeConfirmationScript(report.confirmationScript || []),
    keywordClusters: normalizeKeywordClusters(actionReport.keywordClusters || {}),
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
    proofAssets: path.join(directory, `${domain}-proof-assets.csv`),
    contentInventory: path.join(directory, `${domain}-content-inventory.csv`),
    competitorStructure: path.join(directory, `${domain}-competitor-structure.csv`),
    reputationSummary: path.join(directory, `${domain}-reputation-summary.csv`),
    serviceLocationRecommendations: path.join(directory, `${domain}-service-location-recommendations.csv`),
    launchChecklist: path.join(directory, `${domain}-launch-checklist.csv`),
    confirmationScript: path.join(directory, `${domain}-confirmation-script.csv`),
    keywordClusters: path.join(directory, `${domain}-keyword-clusters.csv`),
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
