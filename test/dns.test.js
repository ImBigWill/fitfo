import assert from "node:assert/strict";
import test from "node:test";
import { classifySubdomain } from "../src/lib/dns.js";

test("classifies risky launch subdomain categories", () => {
  assert.equal(classifySubdomain("staging.client.example", "client.example").category, "Staging / legacy");
  assert.equal(classifySubdomain("portal.client.example", "client.example").category, "Portal / app");
  assert.equal(classifySubdomain("shop.client.example", "client.example").category, "Commerce / billing");
  assert.equal(classifySubdomain("autodiscover.client.example", "client.example").category, "Email");
  assert.equal(classifySubdomain("cpanel.client.example", "client.example").category, "Technical admin / infrastructure");
  assert.equal(classifySubdomain("cdn.client.example", "client.example").category, "Content / delivery");
});
