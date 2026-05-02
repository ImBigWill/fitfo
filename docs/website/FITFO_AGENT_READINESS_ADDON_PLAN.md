# FITFO Agent-Ready Add-On Plan

Working idea: make agent readiness a future add-on or optional report layer, not part of the default onboarding command yet.

Reference point: Cloudflare's `isitagentready.com` scanner checks whether a site exposes signals that help AI agents discover, read, authenticate with, or transact with the site. Its categories include discoverability, content accessibility, bot access rules, protocol discovery, and commerce-related agent standards.

## Product Fit

FITFO already answers:

- who controls the domain
- where DNS and hosting live
- what the site is built on
- what access is needed before redesign or launch
- what current pages, redirects, subdomains, tools, and risks need architectural handling

An agent-readiness add-on would answer:

- can AI agents understand and access the site safely?
- does the site expose machine-readable discovery paths?
- are AI crawler rules intentional?
- are there modern protocol hooks worth adding before launch?
- what simple changes would improve agent compatibility without disrupting SEO, security, or client operations?

This fits best as a forward-looking launch/readiness module after the core onboarding and architectural state map are stable.

## Proposed Commands

Short-term shape:

```bash
fitfo plan example.com --agent-ready
```

Later shape if it earns its own workflow:

```bash
fitfo agent-ready example.com
```

The first version should be report-only and deterministic. It should avoid claiming support for emerging protocols unless the public evidence is explicit.

## Initial Check Set

### Discoverability

- `robots.txt` exists and is reachable
- `sitemap.xml` exists or is referenced from `robots.txt`
- homepage and canonical URL return clean `200` responses
- canonical host is clear across apex, `www`, HTTP, and HTTPS
- response headers expose useful discoverability signals where relevant

### Content Accessibility

- important pages are reachable without script-only rendering
- page titles, H1s, meta descriptions, and canonical tags are present
- sitemap URLs are crawlable
- content is not blocked by accidental `noindex`, robots rules, auth walls, or broken redirects
- future check: markdown content negotiation if the site intentionally supports it

### Bot Access Rules

- AI crawler rules in `robots.txt` are intentional and documented
- search crawler rules and AI crawler rules do not conflict with the client's goals
- Cloudflare or other bot controls are noted when they may affect legitimate agents
- content usage signals are surfaced as "present", "missing", or "needs strategy", not automatically good or bad

### Protocol Discovery

- API catalog or `.well-known` discovery endpoints if the site is an app/API
- OAuth discovery and protected resource metadata if the site has authenticated resources
- MCP server card only when the site intentionally exposes one
- Agent Skills, WebMCP, and A2A agent card checks as emerging optional signals

### Commerce

- x402, MPP, UCP, and ACP checks should stay parked until FITFO has a real commerce use case
- initial output should explain "not applicable" cleanly for normal local-business sites

## Output Sections

Add one optional report section:

```text
Agent Readiness Snapshot
```

Suggested table:

| Area | Signal | Status | Why It Matters | Recommended Action |
| --- | --- | --- | --- | --- |
| Discoverability | robots.txt | Found | Agents and crawlers need clear access rules | Review AI crawler policy |
| Discoverability | sitemap.xml | Missing | Agents need reliable URL discovery | Publish or reference sitemap |
| Content | Important pages readable | Confirm | Agents need extractable page content | Keep critical copy server-rendered |
| Bot Access | AI bot rules | Unknown | The client may want allow/block rules | Decide policy before launch |
| Protocols | MCP server card | Not applicable | Useful for apps/APIs, rarely needed for basic sites | Revisit if FITFO becomes API-enabled |

The add-on should also add a short checklist:

- publish or confirm `robots.txt`
- publish or confirm sitemap
- decide AI crawler policy
- avoid blocking important public content unintentionally
- preserve canonical URL strategy
- only add protocol/commerce signals when there is a real product reason

## Fit With Redesign Planning

Agent readiness belongs in the future-state and launch phases of the architectural strategy plan:

1. **Current state**
   - inspect existing robots, sitemap, headers, canonical URLs, and bot rules
   - flag accidental blockers and unclear crawler policy

2. **Future state**
   - decide whether the new site should be more readable to agents
   - define AI crawler policy for the redesigned site
   - decide whether markdown negotiation or protocol discovery belongs in scope

3. **Launch**
   - verify robots and sitemap after DNS cutover
   - confirm canonical host, redirects, sitemap URLs, and important pages are accessible
   - document any AI bot rules so the client and future developer understand the intent

## Implementation Plan

### Phase 1: Planning And Report Shape

- Add roadmap docs and feature-request entry.
- Define the report table schema.
- Keep the feature off by default.

### Phase 2: Low-Risk Checks

- Reuse existing HTTP, robots, sitemap, canonical, redirect, and crawl signals.
- Add deterministic findings to `plan` when `--agent-ready` is passed.
- Add fixtures for normal WordPress/local-business sites.

### Phase 3: Emerging Standards

- Add `.well-known` and protocol discovery checks.
- Add markdown negotiation checks only when the request/response behavior can be verified.
- Add app/API checks separately from content-site checks.

### Phase 4: Website Positioning

- Mention the add-on as a future capability on the FITFO one-page site.
- Do not sell it as a finished feature until the CLI can produce the report.
- Use fake domains and fake outputs only.

## Guardrails

- Do not make the default scan slower.
- Do not treat every missing emerging protocol as a failure.
- Do not recommend commerce or auth standards for simple brochure/local-service sites.
- Do not blur SEO crawler policy, AI crawler policy, security, and app authentication into one score.
- Do not copy Cloudflare's scanner directly; use it as category inspiration and keep FITFO focused on client onboarding and launch planning.
