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
      ssl: {
        available: true,
        valid: true,
        issuer: { O: "Example CA" },
        validTo: "May 30 12:00:00 2026 GMT",
        daysRemaining: 33,
      },
      redirects: [
        {
          startUrl: "http://www.client.example",
          reachable: true,
          finalUrl: "https://www.client.example/",
          status: 200,
          hops: [
            {
              url: "http://www.client.example",
              status: 301,
              location: "https://www.client.example/",
            },
          ],
        },
      ],
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
      emailSafety: {
        provider: "Google Workspace",
        riskLevel: "Medium",
        hasMx: true,
        spf: {
          present: true,
          value: "v=spf1 include:_spf.google.com ~all",
          summary: "Detected",
        },
        dmarc: {
          present: true,
          value: "v=DMARC1; p=none",
          policy: "none",
          summary: "Detected (none)",
        },
        dkim: {
          summary: "Confirm selectors manually",
        },
        senderServices: ["Google Workspace"],
        warnings: ["DMARC policy is p=none, which is monitoring only."],
        summary: "Google Workspace has MX, SPF, and DMARC records. Preserve MX, SPF, DKIM, and DMARC during DNS changes. DMARC policy is none. Sender clues: Google Workspace.",
        checklist: [
          "Export current MX records before changing nameservers or DNS.",
          "Preserve the current SPF record exactly unless sender platforms change.",
          "Preserve the current DMARC record with p=none.",
        ],
      },
      connectedServices: ["Google verification"],
      marketing: {
        found: ["Google Tag Manager"],
        requiredAccess: ["Google Analytics / GA4", "Google Search Console"],
      },
      operations: {
        found: ["ServiceTitan"],
        requiredAccess: ["CRM or field-service platform admin access"],
      },
      urlStructure: {
        preferredHost: "www.client.example",
        preferredProtocol: "HTTPS",
        canonicalStyle: "www",
        recommendation: "Likely primary launch URL is HTTPS on www. Preserve this choice unless the client intentionally wants to change canonical host.",
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
      launchChecklist: [
        {
          item: "Canonical host",
          detail: "Preserve www.",
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
  assert.match(markdown, /email_risk: "Medium"/);
  assert.match(markdown, /## Client Handoff Summary/);
  assert.match(markdown, /\| Area \| Confidence \| Public Signal \| Client Needs To Provide \/ Confirm \|/);
  assert.match(markdown, /Domain \/ Registrar/);
  assert.match(markdown, /Client must provide registrar login/);
  assert.match(markdown, /## Email Safety/);
  assert.match(markdown, /Google Workspace has MX, SPF, and DMARC records/);
  assert.match(markdown, /## Handoff Packet/);
  assert.match(markdown, /### What FITFO Found/);
  assert.match(markdown, /### Ask Previous Developer/);
  assert.match(markdown, /Registrar: GoDaddy/);
  assert.match(markdown, /### Redirects/);
  assert.match(markdown, /### URL Structure/);
  assert.match(markdown, /## CRM \/ Operations Access/);
  assert.match(markdown, /## Dev Pre-Launch Checklist/);
  assert.match(markdown, /issuer Example CA/);
  assert.match(markdown, /## Previous Developer Request/);
});
