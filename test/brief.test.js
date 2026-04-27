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
    subdomains: [{ name: "staging.client.example" }],
  },
  http: {
    reachable: true,
    title: "Client Example Plumbing",
  },
  analysis: {
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
  },
};

test("builds a first-call brief from an existing scan", () => {
  const brief = buildBrief(scan);

  assert.equal(brief.subject, "client.example");
  assert.ok(brief.confirmations.some((item) => item.label === "WordPress operations"));
  assert.ok(brief.researchQueue.some((item) => item.area === "SEO"));
  assert.ok(brief.opportunityQueue.some((item) => item.area === "Subdomains"));
  assert.ok(brief.callQuestions.some((question) => question.includes("Google Tag Manager")));
});

test("renders a Markdown brief for Obsidian/client prep", () => {
  const markdown = renderBriefMarkdown(scan, { obsidian: true });

  assert.match(markdown, /report_type: "obsidian-brief"/);
  assert.match(markdown, /# FITFO Brief - client.example/);
  assert.match(markdown, /## Confirm On The Call/);
  assert.match(markdown, /## Research Queue/);
  assert.match(markdown, /## First-Call Questions/);
});
