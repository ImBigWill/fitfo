import assert from "node:assert/strict";
import test from "node:test";
import { normalizeDomainInput } from "../src/lib/domain.js";

test("normalizes full URLs and keeps the apex domain", () => {
  const domain = normalizeDomainInput("https://www.example.com/path?utm=fitfo");

  assert.equal(domain.input, "https://www.example.com/path?utm=fitfo");
  assert.equal(domain.hostname, "www.example.com");
  assert.equal(domain.apex, "example.com");
  assert.deepEqual(domain.candidates, ["example.com", "www.example.com"]);
});

test("handles known second-level TLDs such as co.ai", () => {
  const domain = normalizeDomainInput("portal.client.co.ai");

  assert.equal(domain.hostname, "portal.client.co.ai");
  assert.equal(domain.apex, "client.co.ai");
  assert.ok(domain.candidates.includes("client.co.ai"));
  assert.ok(domain.candidates.includes("portal.client.co.ai"));
});

test("handles plain .af domains without treating nested variants as public suffixes", () => {
  const domain = normalizeDomainInput("www.example.af");

  assert.equal(domain.hostname, "www.example.af");
  assert.equal(domain.apex, "example.af");
});

test("rejects inputs that are not real domains", () => {
  assert.throws(() => normalizeDomainInput("localhost"), /Expected a real domain/);
});
