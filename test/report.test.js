import assert from "node:assert/strict";
import test from "node:test";
import { renderMarkdownReport } from "../src/report.js";

test("renders an Obsidian-ready Markdown report with frontmatter, checklists, and client questions", () => {
  const markdown = renderMarkdownReport({
    tool: "FITFO",
    scanVersion: "0.1.0",
    startedAt: "2026-04-27T00:00:00.000Z",
    finishedAt: "2026-04-27T00:01:00.000Z",
    domain: {
      apex: "client.example",
      hostname: "www.client.example",
    },
    rdap: {
      registrar: { name: "GoDaddy" },
      dates: {
        registration: "2020-01-01T00:00:00Z",
        expiration: "2027-01-01T00:00:00Z",
      },
      statuses: ["client transfer prohibited"],
    },
    dns: {
      nameservers: ["ns01.domaincontrol.com"],
      addresses: ["192.0.2.10"],
      ipv6Addresses: [],
      cnames: ["client.wpengine.com"],
      mx: [{ priority: 1, exchange: "aspmx.l.google.com" }],
      spf: "v=spf1 include:_spf.google.com ~all",
      dmarc: "v=DMARC1; p=none",
      dnssec: false,
      subdomains: [
        {
          name: "staging.client.example",
          addresses: ["192.0.2.20"],
          cnames: [],
        },
      ],
    },
    http: {
      reachable: true,
      finalUrl: "https://www.client.example/",
      status: 200,
      title: "Client Example",
      metaGenerator: "WordPress",
      headers: {
        server: "nginx",
      },
    },
    analysis: {
      registrar: "GoDaddy",
      dnsProvider: "GoDaddy",
      cloudflare: {
        status: "No obvious Cloudflare",
        confidence: "Low",
        signals: [],
      },
      hosting: {
        provider: "WP Engine",
        confidence: "Medium",
        note: "Detected from DNS or HTTP hints.",
      },
      cms: {
        platform: "WordPress",
        confidence: "Medium",
        signals: ["wp-content path found"],
      },
      email: {
        provider: "Google Workspace",
      },
      connectedServices: ["Google verification"],
      marketing: {
        found: ["Google Tag Manager"],
        requiredAccess: ["Google Analytics / GA4", "Google Search Console"],
      },
      previousDeveloper: {
        contact: "Not publicly identifiable",
        note: "Ask the client for the person or agency that last managed the site.",
      },
      actionPlan: [
        {
          label: "Track down GoDaddy",
          detail: "Ask the client who has the GoDaddy login.",
        },
      ],
      accessNeeded: [
        {
          item: "GoDaddy access",
          reason: "Needed for ownership and renewals.",
        },
      ],
      risks: ["1 common subdomain resolved."],
    },
  }, { obsidian: true });

  assert.match(markdown, /^---\ntitle: "FITFO - client.example"/);
  assert.match(markdown, /report_type: "obsidian"/);
  assert.match(markdown, /  - client-onboarding/);
  assert.match(markdown, /## Track This Down/);
  assert.match(markdown, /- \[ \] \*\*Track down GoDaddy\*\*/);
  assert.match(markdown, /## Questions For The Client Call/);
  assert.match(markdown, /Who owns the GoDaddy account/);
  assert.match(markdown, /## Previous Developer Request/);
});
