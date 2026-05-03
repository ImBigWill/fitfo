# Roadmap

FITFO starts as a private CLI tool and should become public once the default scan and docs are stable.

## Product Shape

FITFO has two intended jobs:

1. **Access onboarding**
   - What is where?
   - Who controls it?
   - What does the client need to track down?

2. **Client call prep**
   - What does the existing website suggest?
   - What should be improved?
   - What questions should we ask on the first call?

3. **Architectural state mapping**
   - What exists today across pages, redirects, subdomains, and domain variants?
   - What should stay in place, be reworked, be deprecated, or be redirected?
   - What needs to happen during redesign, at launch, and after launch?

The default command should stay fast and operational:

```bash
fitfo clientdomain.com
```

The deeper research mode starts as a separate command:

```bash
fitfo brief clientdomain.com
```

The build recommendation layer now starts as:

```bash
fitfo plan clientdomain.com --deep --search --location "City, ST"
```

The full-intake path is:

```bash
fitfo onboard clientdomain.com
```

## Near-Term

- Turn redirect/canonical checks into an architectural state map for redesign and rebuild planning.
- Improve hosting fingerprints while keeping core free; see [Integrations](INTEGRATIONS.md) for optional enrichment boundaries.
- Improve DNS provider fingerprints.
- Improve analytics and marketing tag detection.
- Improve Markdown report templates after real Obsidian use.
- Expand fixture coverage as real-world misses show up.
- Improve save-flow wording after more Desktop and Obsidian usage.
- Keep GitHub repo metadata current while the project is private.

## Onboarding Scanner Ideas

- Domain expiration warning.
- Plain-English domain status interpretation.
- Registrar/DNS mismatch explanation.
- Cross-host redirect map for apex, `www`, HTTP, and HTTPS.
- Primary launch URL recommendation for apex/non-www vs `www`.
- `robots.txt` and `sitemap.xml` presence.
- Known WordPress plugin/theme/page builder clues.
- Better form and lead-routing detection.
- Deeper DKIM selector guidance once sender platforms are known.
- Known call tracking and CRM clues.
- Common field-service tools such as ServiceTitan, Housecall Pro, Jobber, FieldEdge, Service Fusion, ServiceM8, Workiz, Podium, and Birdeye.

## Brief Mode Ideas

`fitfo brief` prepares for the first client call. The current version can scaffold from scan signals, crawl a small set of sitemap pages with `--deep`, optionally add Firecrawl-backed search research with `--search`, optionally compare recent Wayback captures with `--wayback`, and turn those signals into a kickoff research packet. Research can use `FIRECRAWL_API_KEY` or the authenticated local Firecrawl CLI.

Current kickoff research sections:

- current site read
- market snapshot
- keyword and page opportunities
- positioning hypotheses
- kickoff call agenda
- detailed action report
- proof-asset request list
- content inventory by page type
- keyword clusters
- competitor/review/directory classification
- Wayback recent-version evidence and change flags
- competitor-informed structure suggestions
- service/location page recommendations
- review/reputation summary
- kickoff confirmation script
- keyword-to-page map
- CSV/JSON table sidecar exports

Next set:

- sharper local keyword clustering
- competitor-informed copy and sitemap pattern extraction
- questions for the client to confirm, deny, or improve
- real-domain passes that turn missed service, location, review, and CRM patterns into fixtures

## Plan Mode Ideas

`fitfo plan` should answer what to focus on and what to build.

Current sections:

- focus priorities
- recommended site structure
- build workstreams
- launch checklist
- kickoff research game plan
- competitor-informed structure
- review/reputation summary
- kickoff confirmation script
- prioritized action report
- keyword page map
- optional agent-readiness snapshot via `--agent-ready`
- confirmation questions

Next improvements:

- current-state architecture map from public domain structure, crawl inventory, redirects, subdomains, and canonical signals
- future-state handling plan that labels pages/URLs/subdomains as keep, rework, deprecate, redirect, or confirm
- launch redirect strategy refinements after real redirect-matrix exports
- expanded subdomain classification refinements after real-domain passes with `--subdomains`
- deeper agent-readiness checks for `.well-known`, app/API protocol discovery, and markdown negotiation when there is a real use case
- local SEO/service-area recommendations
- sharper prioritization between must-build pages, nice-to-have pages, and client-confirmation pages
- launch checklist grouped even more explicitly by access, content, tracking, and technical QA
- pre-launch dev checklist refinements after real project handoff use

Important: brief mode should label findings as public signals, inferred hypotheses, and questions. It should not pretend to know the business from one scan.

## Architectural State Map

For redesigns and rebuilds, FITFO should treat the current domain as a system to preserve and intentionally reshape, not just a set of pages to audit.

The intended workflow:

1. **Current state assessment**
   - capture apex, `www`, HTTP, HTTPS, redirect behavior, preferred canonical host, TLS state, and common subdomains
   - crawl sitemap/robots/pages when `--deep` is enabled
   - inventory current URLs, page types, metadata, canonical tags, forms, CTAs, phone numbers, schema, and tool signals

2. **Architectural decisions**
   - classify current URLs and subdomains as keep, rework, deprecate, redirect, or confirm with client/previous developer
   - identify content that must survive because it supports service intent, location intent, proof, citations, lead flow, or technical dependencies
   - flag risky areas such as split apex/`www` behavior, HTTP variants, staging/portal subdomains, missing canonical tags, and unclear lead-routing tools

3. **Redesign phase**
   - use the current map to decide sitemap, navigation, service/location pages, proof assets, forms, tracking, and internal links
   - mark pages that need rewrite, consolidation, replacement, redirect targets, or client content

4. **Launch and post-launch redirect strategy**
   - define what must be handled before launch, on launch day, and after launch
   - preserve link equity and traffic by mapping important old URLs to future URLs
   - verify apex/`www`, HTTP/HTTPS, sitemap, Search Console, analytics, forms, and tracking after launch

FITFO should eventually render this as an explicit plan section and table export so a redesign starts from evidence-backed current state, not a blank sitemap.

## Plugin / Module Direction

Do not build a plugin system yet.

For now, keep scanner capabilities as internal modules. Vertical intelligence should follow the same rule: ship focused vertical profiles in core before designing public extension points. The first vertical profile is `plumbing`, which can be requested with:

```bash
fitfo plan clientdomain.com --deep --search --location "City, ST" --vertical plumbing
```

The plumbing profile adds plumber/home-services service terms, proof-asset prompts, homeowner emergency UX checks, field-service/tool awareness, and role-specific kickoff questions. It should remain generic enough for open-source use and should not include real client scan outputs or private agency playbooks.

If the tool grows, a future internal module layout could look like:

```text
domain records
dns records
website fingerprint
cms clues
marketing tags
brief research
client plan
vertical profiles
report renderers
```

A public plugin architecture is premature until we know which extension points are actually useful.

## Website / Docs Site

No project website is needed while FITFO is private.

When the project is closer to public release, consider a small docs site or landing page that explains:

- what `fitfo onboard` does
- what FITFO can and cannot detect
- install and configuration steps
- example Obsidian/report output using fake data
- logo, wordmark, palette, and social-preview direction from the imported concept sheet
- provider fixture contribution flow
- public release and npm package status

Future website planning docs:

- [FITFO one-page website brief](website/FITFO_ONE_PAGE_WEBSITE_BRIEF.md)
- [WordPress one-page build plan](website/FITFO_WORDPRESS_BUILD_PLAN.md)
- [Agent-ready add-on plan](website/FITFO_AGENT_READINESS_ADDON_PLAN.md)
