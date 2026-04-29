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

- Improve redirect checks for `www` and apex canonical behavior.
- Improve hosting fingerprints.
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

`fitfo brief` prepares for the first client call. The current version can scaffold from scan signals, crawl a small set of sitemap pages with `--deep`, optionally add Firecrawl-backed search research with `--search`, and turn those signals into a kickoff research packet. Research can use `FIRECRAWL_API_KEY` or the authenticated local Firecrawl CLI.

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
- confirmation questions

Next improvements:

- local SEO/service-area recommendations
- sharper prioritization between must-build pages, nice-to-have pages, and client-confirmation pages
- launch checklist grouped even more explicitly by access, content, tracking, and technical QA
- pre-launch dev checklist refinements after real project handoff use

Important: brief mode should label findings as public signals, inferred hypotheses, and questions. It should not pretend to know the business from one scan.

## Plugin / Module Direction

Do not build a plugin system yet.

For now, keep scanner capabilities as internal modules. If the tool grows, a future internal module layout could look like:

```text
domain records
dns records
website fingerprint
cms clues
marketing tags
brief research
client plan
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
- provider fixture contribution flow
- public release and npm package status
