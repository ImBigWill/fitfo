import assert from "node:assert/strict";
import test from "node:test";
import { analyzeProfile } from "../src/lib/analyze.js";

test("infers registrar, DNS, hosting, CMS, email, and marketing clues from mocked public records", () => {
  const analysis = analyzeProfile({
    domain: {
      apex: "client.example",
      hostname: "www.client.example",
    },
    rdap: {
      registrar: { name: "GoDaddy" },
      nameservers: ["ns01.domaincontrol.com", "ns02.domaincontrol.com"],
    },
    dns: {
      nameservers: ["ns01.domaincontrol.com", "ns02.domaincontrol.com"],
      cnames: ["client.wpengine.com"],
      mx: [{ priority: 1, exchange: "aspmx.l.google.com" }],
      txt: ["google-site-verification=abc123", "v=spf1 include:_spf.google.com ~all"],
      spf: "v=spf1 include:_spf.google.com ~all",
      dmarc: "v=DMARC1; p=reject; rua=mailto:dmarc@client.example",
      caa: [],
    },
    http: {
      finalUrl: "https://www.client.example/",
      urlStructure: {
        preferredHost: "www.client.example",
        preferredProtocol: "https:",
        www: true,
        recommendation: "Likely primary launch URL is HTTPS on www. Preserve this choice unless the client intentionally wants to change canonical host.",
      },
      headers: {
        server: "nginx",
      },
      htmlSample: "<html><head><script src=\"https://www.googletagmanager.com/gtm.js?id=GTM-ABC123\"></script><script src=\"https://embed.servicetitan.com/widget.js\"></script></head></html>",
      wordpress: {
        likely: true,
        signals: ["wp-content path found"],
      },
    },
  });

  assert.equal(analysis.registrar, "GoDaddy");
  assert.equal(analysis.dnsProvider, "GoDaddy");
  assert.equal(analysis.hosting.provider, "WP Engine");
  assert.equal(analysis.cms.platform, "WordPress");
  assert.equal(analysis.email.provider, "Google Workspace");
  assert.equal(analysis.emailSafety.riskLevel, "Low");
  assert.equal(analysis.emailSafety.dmarc.policy, "reject");
  assert.ok(analysis.emailSafety.senderServices.includes("Google Workspace"));
  assert.equal(analysis.urlStructure.canonicalStyle, "www");
  assert.ok(analysis.connectedServices.includes("Google verification"));
  assert.ok(analysis.marketing.found.includes("Google Tag Manager"));
  assert.ok(analysis.operations.found.includes("ServiceTitan"));
  assert.ok(analysis.accessNeeded.some((item) => item.item === "GoDaddy access"));
  assert.ok(analysis.accessNeeded.some((item) => item.item === "WP Engine hosting access"));
  assert.ok(analysis.accessNeeded.some((item) => item.item === "CRM / booking / field-service access"));
  assert.ok(analysis.actionPlan.some((item) => item.label === "Confirm www launch URL"));
  assert.ok(analysis.launchChecklist.some((item) => item.item === "Canonical host"));
});

test("flags high email safety risk when MX exists without SPF or DMARC", () => {
  const analysis = analyzeProfile({
    domain: {
      apex: "client.example",
      hostname: "client.example",
    },
    rdap: {
      registrar: { name: "GoDaddy" },
      nameservers: ["ns01.domaincontrol.com"],
    },
    dns: {
      nameservers: ["ns01.domaincontrol.com"],
      cnames: [],
      addresses: ["192.0.2.10"],
      ipv6Addresses: [],
      mx: [{ priority: 10, exchange: "mail.client.example" }],
      txt: [],
      caa: [],
    },
    http: {
      reachable: true,
      finalUrl: "https://client.example/",
      headers: {},
      htmlSample: "",
      wordpress: {
        likely: false,
        signals: [],
      },
    },
  });

  assert.equal(analysis.email.provider, "Unknown");
  assert.equal(analysis.emailSafety.riskLevel, "High");
  assert.ok(analysis.emailSafety.warnings.some((warning) => warning.includes("no SPF")));
  assert.ok(analysis.emailSafety.warnings.some((warning) => warning.includes("no DMARC")));
  assert.ok(analysis.accessNeeded.some((item) => item.item === "Email/DNS safety review"));
  assert.ok(analysis.risks.some((risk) => risk.includes("MX records exist but no SPF")));
});

test("detects sender platforms from SPF and TXT records", () => {
  const analysis = analyzeProfile({
    domain: {
      apex: "client.example",
      hostname: "client.example",
    },
    rdap: {
      registrar: { name: "Namecheap" },
      nameservers: ["dns1.registrar-servers.com"],
    },
    dns: {
      nameservers: ["dns1.registrar-servers.com"],
      cnames: [],
      addresses: ["192.0.2.10"],
      ipv6Addresses: [],
      mx: [{ priority: 0, exchange: "client-example.mail.protection.outlook.com" }],
      txt: [
        "v=spf1 include:spf.protection.outlook.com include:sendgrid.net include:spf.mtasv.net include:servers.mcsv.net ~all",
        "amazonses=abc123",
      ],
      spf: "v=spf1 include:spf.protection.outlook.com include:sendgrid.net include:spf.mtasv.net include:servers.mcsv.net ~all",
      dmarc: "v=DMARC1; p=none",
      caa: [],
    },
    http: {
      reachable: true,
      finalUrl: "https://client.example/",
      headers: {},
      htmlSample: "",
      wordpress: {
        likely: false,
        signals: [],
      },
    },
  });

  assert.equal(analysis.email.provider, "Microsoft 365");
  assert.equal(analysis.emailSafety.riskLevel, "Medium");
  assert.equal(analysis.emailSafety.dmarc.policy, "none");
  assert.deepEqual(analysis.emailSafety.senderServices, [
    "Amazon SES",
    "Mailchimp",
    "Microsoft 365",
    "Postmark",
    "SendGrid",
  ]);
});

test("treats Cloudflare nameservers as DNS ownership and hides origin hosting", () => {
  const analysis = analyzeProfile({
    domain: {
      apex: "client.example",
      hostname: "client.example",
    },
    rdap: {
      registrar: { name: "Namecheap" },
      nameservers: ["rose.ns.cloudflare.com", "sid.ns.cloudflare.com"],
    },
    dns: {
      nameservers: ["rose.ns.cloudflare.com", "sid.ns.cloudflare.com"],
      cnames: [],
      mx: [],
      txt: [],
      caa: [],
    },
    http: {
      finalUrl: "https://client.example/",
      headers: {},
      htmlSample: "",
      wordpress: {
        likely: false,
        signals: [],
      },
    },
  });

  assert.equal(analysis.dnsProvider, "Cloudflare");
  assert.equal(analysis.cloudflare.status, "Yes");
  assert.equal(analysis.hosting.provider, "Hidden behind Cloudflare");
  assert.ok(analysis.accessNeeded.some((item) => item.item === "Cloudflare access"));
  assert.ok(analysis.actionPlan.some((item) => item.label === "Track down Cloudflare"));
});

test("detects common registrar, DNS, hosting, and field-service provider patterns", () => {
  const analysis = analyzeProfile({
    domain: {
      apex: "client.example",
      hostname: "client.example",
    },
    rdap: {
      registrar: { name: "Hostinger" },
      nameservers: ["ns1.dns-parking.com", "ns2.dns-parking.com"],
    },
    dns: {
      nameservers: ["ns1.dns-parking.com", "ns2.dns-parking.com"],
      cnames: ["client.hostingerapp.com"],
      mx: [{ priority: 10, exchange: "mx1.hostinger.com" }],
      txt: [],
      caa: [],
    },
    http: {
      reachable: true,
      finalUrl: "https://client.example/",
      headers: {
        server: "hcdn",
      },
      htmlSample: "<a href=\"https://client.housecallpro.com/book\">Book Online</a>",
      wordpress: {
        likely: false,
        signals: [],
      },
    },
  });

  assert.equal(analysis.registrar, "Hostinger");
  assert.equal(analysis.dnsProvider, "Hostinger");
  assert.equal(analysis.hosting.provider, "Hostinger");
  assert.ok(analysis.operations.found.includes("Housecall Pro"));
});

test("flags TLS and HTTP redirect risks from mocked website checks", () => {
  const analysis = analyzeProfile({
    domain: {
      apex: "client.example",
      hostname: "client.example",
    },
    rdap: {
      registrar: { name: "GoDaddy" },
      nameservers: ["ns01.domaincontrol.com"],
    },
    dns: {
      nameservers: ["ns01.domaincontrol.com"],
      cnames: [],
      mx: [],
      txt: [],
      caa: [],
    },
    http: {
      reachable: true,
      finalUrl: "https://client.example/",
      headers: {},
      htmlSample: "",
      wordpress: {
        likely: false,
        signals: [],
      },
      ssl: {
        available: true,
        valid: true,
        daysRemaining: 12,
      },
      redirects: [
        {
          startUrl: "http://client.example",
          reachable: true,
          finalUrl: "http://client.example/",
          status: 200,
          hops: [],
        },
      ],
    },
  });

  assert.ok(analysis.risks.some((risk) => risk.includes("TLS certificate expires in 12 day")));
  assert.ok(analysis.risks.some((risk) => risk.includes("HTTP does not appear to redirect to HTTPS")));
});

test("flags unresolved or misspelled domains clearly", () => {
  const analysis = analyzeProfile({
    domain: {
      apex: "spartplumbing.us",
      hostname: "spartplumbing.us",
    },
    rdap: {
      available: false,
      error: "RDAP lookup failed",
      registrar: null,
      nameservers: [],
    },
    dns: {
      nameservers: [],
      addresses: [],
      ipv6Addresses: [],
      cnames: [],
      mx: [],
      txt: [],
      caa: [],
      errors: {
        A: "DNS A lookup failed for spartplumbing.us",
      },
    },
    http: {
      reachable: false,
      finalUrl: null,
      headers: {},
      htmlSample: "",
      wordpress: {
        likely: false,
        signals: [],
      },
      ssl: {
        available: false,
        valid: false,
        error: "getaddrinfo ENOTFOUND spartplumbing.us",
      },
      redirects: [
        {
          startUrl: "https://spartplumbing.us",
          reachable: false,
          error: "fetch failed",
        },
      ],
    },
  });

  assert.equal(analysis.inputStatus.status, "Unresolved");
  assert.match(analysis.inputStatus.summary, /Check exact spelling/);
  assert.ok(analysis.actionPlan.some((action) => action.label === "Check exact domain spelling"));
  assert.ok(analysis.risks.some((risk) => risk.includes("spartplumbing.us")));
});
