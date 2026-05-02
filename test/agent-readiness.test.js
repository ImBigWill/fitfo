import assert from "node:assert/strict";
import test from "node:test";
import { buildAgentReadiness } from "../src/agent-readiness.js";

test("builds agent readiness signals from deep crawl evidence", () => {
  const readiness = buildAgentReadiness({
    domain: { apex: "client.example" },
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
        urls: ["https://client.example/", "https://client.example/services/"],
      },
      pages: [
        {
          path: "/",
          wordCount: 420,
          metaRobots: "index,follow",
        },
      ],
    },
    analysis: {
      urlStructure: {
        preferredHost: "www.client.example",
        preferredProtocol: "HTTPS",
        issues: [],
      },
    },
  });

  assert.ok(readiness.summary.includes("found"));
  assert.ok(readiness.rows.some((item) => item.signal === "robots.txt" && item.status === "Found"));
  assert.ok(readiness.rows.some((item) => item.signal === "sitemap.xml" && item.status === "Found"));
  assert.ok(readiness.rows.some((item) => item.signal === "Canonical host" && item.status === "Found"));
  assert.ok(readiness.rows.some((item) => item.signal === "AI crawler policy" && item.status === "Found"));
});

test("keeps agent readiness actionable when deep crawl is not enabled", () => {
  const readiness = buildAgentReadiness({
    domain: { apex: "client.example" },
    site: { enabled: false },
    analysis: {},
  });

  assert.ok(readiness.rows.some((item) => item.signal === "robots.txt" && item.status === "Not checked"));
  assert.ok(readiness.rows.some((item) => item.signal === "Readable public pages" && item.action.includes("--deep")));
  assert.ok(readiness.rows.some((item) => item.signal === "Agentic commerce protocols" && item.status === "Not applicable"));
});
