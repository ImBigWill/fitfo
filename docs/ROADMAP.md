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

## Near-Term

- Improve redirect checks for `www` and apex canonical behavior.
- Improve hosting fingerprints.
- Improve DNS provider fingerprints.
- Improve analytics and marketing tag detection.
- Improve Markdown report templates after real Obsidian use.
- Add `fitfo config` for saved defaults.
- Add fixture-based tests for known real-world domain/hosting patterns.

## Onboarding Scanner Ideas

- Domain expiration warning.
- Plain-English domain status interpretation.
- Registrar/DNS mismatch explanation.
- Cross-host redirect map for apex, `www`, HTTP, and HTTPS.
- `robots.txt` and `sitemap.xml` presence.
- Known WordPress plugin/theme/page builder clues.
- Better form and lead-routing detection.
- Better email service detection from SPF/DKIM/TXT records.
- Known call tracking and CRM clues.

## Brief Mode Ideas

`fitfo brief` prepares for the first client call. The current version can scaffold from scan signals, crawl a small set of sitemap pages with `--deep`, and optionally add Firecrawl-backed search research with `--search`.

Possible sections:

- website summary
- homepage title/meta/H1
- visible CTAs
- navigation and page structure
- local SEO signals
- schema markup
- keyword hypotheses
- positioning hypotheses
- obvious copy opportunities
- obvious conversion opportunities
- questions for the client to confirm, deny, or improve

## Plan Mode Ideas

`fitfo plan` should answer what to focus on and what to build.

Current sections:

- focus priorities
- recommended site structure
- build workstreams
- confirmation questions

Next improvements:

- stronger service/location page recommendations
- competitor-informed structure suggestions
- local SEO/service-area recommendations
- content inventory and proof-asset requests
- launch checklist grouped by access, content, tracking, and technical QA

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
