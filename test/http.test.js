import assert from "node:assert/strict";
import test from "node:test";
import { buildUrlStructureProfile } from "../src/lib/http.js";

test("builds a clean apex and www redirect matrix", () => {
  const profile = buildUrlStructureProfile("client.example", [
    hostCheck("client.example", [
      variant("https://client.example", "https://www.client.example/", 200),
      variant("http://client.example", "https://www.client.example/", 200, [
        hop("http://client.example", 301, "https://client.example/"),
        hop("https://client.example/", 301, "https://www.client.example/"),
      ]),
    ]),
    hostCheck("www.client.example", [
      variant("https://www.client.example", "https://www.client.example/", 200),
      variant("http://www.client.example", "https://www.client.example/", 200, [
        hop("http://www.client.example", 301, "https://www.client.example/"),
      ]),
    ]),
  ]);

  assert.equal(profile.preferredHost, "www.client.example");
  assert.equal(profile.preferredProtocol, "https:");
  assert.equal(profile.www, true);
  assert.equal(profile.matrix.length, 4);
  assert.equal(profile.matrix.every((row) => row.canonical), true);
  assert.deepEqual(profile.issues, []);
  assert.match(profile.recommendation, /Likely primary launch URL is HTTPS on www/);
});

test("flags split apex and www redirect behavior", () => {
  const profile = buildUrlStructureProfile("client.example", [
    hostCheck("client.example", [
      variant("https://client.example", "https://client.example/", 200),
      variant("http://client.example", "http://client.example/", 200),
    ]),
    hostCheck("www.client.example", [
      variant("https://www.client.example", "https://www.client.example/", 200),
      failedVariant("http://www.client.example", "fetch failed"),
    ]),
  ]);

  assert.equal(profile.issues.some((issue) => issue.code === "split_hosts"), true);
  assert.equal(profile.issues.some((issue) => issue.code === "http_not_forced"), true);
  assert.equal(profile.issues.some((issue) => issue.code === "dead_variants"), true);
  assert.match(profile.recommendation, /redirect behavior is split/);
});

function hostCheck(host, variants) {
  return { host, variants };
}

function variant(startUrl, finalUrl, status, hops = []) {
  return {
    startUrl,
    reachable: true,
    finalUrl,
    status,
    hops,
  };
}

function failedVariant(startUrl, error) {
  return {
    startUrl,
    reachable: false,
    finalUrl: null,
    status: null,
    hops: [],
    error,
  };
}

function hop(url, status, location) {
  return { url, status, location };
}
