import { buildBrief, renderBriefMarkdown, renderBriefText } from "../brief.js";
import { buildClientPlan, renderPlanMarkdown, renderPlanText } from "../plan.js";
import { renderMarkdownReport, renderTextReport } from "../report.js";

export function renderOutput(scan, options) {
  if (options.format === "json") {
    if (options.report === "brief") {
      return `${JSON.stringify({ scan, brief: buildBrief(scan) }, null, 2)}\n`;
    }
    if (options.report === "plan") {
      return `${JSON.stringify({ scan, plan: buildClientPlan(scan) }, null, 2)}\n`;
    }
    return `${JSON.stringify(scan, null, 2)}\n`;
  }

  if (options.format === "markdown" || options.format === "obsidian") {
    if (options.report === "brief") {
      return renderBriefMarkdown(scan, { obsidian: options.obsidian });
    }
    if (options.report === "plan") {
      return renderPlanMarkdown(scan, { obsidian: options.obsidian });
    }
    return renderMarkdownReport(scan, { obsidian: options.obsidian });
  }

  if (options.report === "brief") {
    return `${renderBriefText(scan, { color: options.color })}\n`;
  }
  if (options.report === "plan") {
    return `${renderPlanText(scan, { color: options.color })}\n`;
  }

  return `${renderTextReport(scan, { color: options.color })}\n`;
}
