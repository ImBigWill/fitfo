# Integrations

FITFO core should stay useful without paid services. Optional integrations can add depth, but the default scanner should still answer the onboarding question with public records:

- where the domain lives
- where DNS appears to live
- whether Cloudflare is obviously involved
- what hosting evidence is visible
- what accounts the client needs to track down

## Free Core

Keep these in core because they are public, low-friction, and do not require user accounts:

- RDAP registrar lookup
- DNS-over-HTTPS lookups
- SOA, NS, A, AAAA, CNAME, MX, TXT, CAA, DS
- reverse DNS/PTR lookups
- public ASN/network-owner hints
- TLS certificate checks
- HTTP headers and redirects
- robots.txt and XML sitemap checks
- shallow/deep local crawl
- static page extraction for forms, scripts, schema, headings, canonicals, and meta robots

## Free Optional Enrichment

These checks are still free/public, but should stay behind explicit modes because they call third-party services or add runtime.

| Provider | Flag / Mode | Best Use |
| --- | --- | --- |
| Internet Archive Wayback CDX API | `--wayback`; enabled by `fitfo onboard` | Compare recent homepage captures to spot title, H1, meta, form, phone, CTA, and tracking changes after agency/site handoffs. |

## Already Optional

Firecrawl-backed research belongs behind `--search` because it is about market context, competitor prompts, and kickoff planning rather than basic domain ownership.

Use it for:

- local competitor prompts
- service/category research
- review/directory/search-result signals
- positioning and keyword planning

## Future Optional Enrichment

These can make FITFO more powerful, but should not become required for the default scan.

| Provider | Best Use | Why Optional |
| --- | --- | --- |
| SecurityTrails | DNS history, older A records, hidden origin clues | Usually account/API based; historical data can have quotas or cost. |
| Wappalyzer | technology stack, analytics, CMS, ecommerce, widgets | Strong enrichment, but API access is paid/account based. |
| BuiltWith | current/historical technology stack and metadata | Strong enrichment, but API access is paid/account based. |
| PageSpeed Insights | Lighthouse performance/accessibility/SEO evidence | Useful for kickoff, not required for ownership handoff. |

## Product Rule

When an optional provider is added, FITFO should label the source clearly:

- `Observed`: direct DNS/HTTP/crawl evidence
- `Research`: Firecrawl/search result
- `Archived`: Internet Archive/Wayback evidence
- `Enriched`: optional paid/API provider
- `Ask Client`: not knowable from public records

This keeps the report honest when the client asks, "How do you know?"
