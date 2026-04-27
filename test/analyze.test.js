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
      txt: ["google-site-verification=abc123"],
      caa: [],
    },
    http: {
      finalUrl: "https://www.client.example/",
      headers: {
        server: "nginx",
      },
      htmlSample: "<html><head><script src=\"https://www.googletagmanager.com/gtm.js?id=GTM-ABC123\"></script></head></html>",
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
  assert.ok(analysis.connectedServices.includes("Google verification"));
  assert.ok(analysis.marketing.found.includes("Google Tag Manager"));
  assert.ok(analysis.accessNeeded.some((item) => item.item === "GoDaddy access"));
  assert.ok(analysis.accessNeeded.some((item) => item.item === "WP Engine hosting access"));
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
