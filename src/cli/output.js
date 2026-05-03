import { buildBrief, renderBriefMarkdown, renderBriefText } from "../brief.js";
import { buildClientPlan, renderPlanMarkdown, renderPlanText } from "../plan.js";
import { renderMarkdownReport, renderTextReport } from "../report.js";
import { buildSnapshot, renderSnapshotMarkdown, renderSnapshotText } from "../snapshot.js";

export function renderOutput(scan, options) {
  const sourceReport = options.report;
  const report = sourceReport === "onboard" ? "plan" : sourceReport;

  if (options.format === "json") {
    if (report === "brief") {
      return `${JSON.stringify({ scan, brief: buildBrief(scan) }, null, 2)}\n`;
    }
    if (report === "snapshot") {
      return `${JSON.stringify({ scan, snapshot: buildSnapshot(scan) }, null, 2)}\n`;
    }
    if (report === "plan") {
      return `${JSON.stringify({ scan, plan: buildClientPlan(scan, { agentReady: options.agentReady }) }, null, 2)}\n`;
    }
    return `${JSON.stringify(scan, null, 2)}\n`;
  }

  if (options.format === "markdown" || options.format === "obsidian") {
    if (report === "brief") {
      return renderBriefMarkdown(scan, { obsidian: options.obsidian });
    }
    if (report === "snapshot") {
      return renderSnapshotMarkdown(scan, { obsidian: options.obsidian, clientSafe: options.clientSafe });
    }
    if (report === "plan") {
      return renderPlanMarkdown(scan, {
        obsidian: options.obsidian,
        agentReady: options.agentReady,
        onboard: sourceReport === "onboard" || options.onboard,
      });
    }
    return renderMarkdownReport(scan, { obsidian: options.obsidian });
  }

  if (report === "brief") {
    return `${renderBriefText(scan, { color: options.color })}\n`;
  }
  if (report === "snapshot") {
    return `${renderSnapshotText(scan, { color: options.color, clientSafe: options.clientSafe })}\n`;
  }
  if (report === "plan") {
    return `${renderPlanText(scan, { color: options.color, agentReady: options.agentReady })}\n`;
  }

  return `${renderTextReport(scan, { color: options.color })}\n`;
}
