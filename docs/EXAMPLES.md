# Examples

These examples use fake domains and fake paths. Do not publish real client reports without review.

## One-Command Client Intake

```bash
fitfo onboard example-plumbing.test --location "Richmond, VA" --vault ~/Obsidian/Clients
```

FITFO will:

- show the onboard run summary
- scan domain, DNS, email, subdomains, redirects, TLS, CMS, analytics, CRM, and hosting clues
- crawl the site when reachable
- run Firecrawl-backed search research when available
- compare recent Wayback homepage captures
- save a Markdown plan note
- optionally export CSV/JSON planning tables to `fitfo-exports/`

Preview first:

```bash
fitfo onboard example-plumbing.test --location "Richmond, VA" --vault ~/Obsidian/Clients --preview
```

Terminal-only:

```bash
fitfo onboard example-plumbing.test --location "Richmond, VA" --no-save
```

## Markdown Note Shape

Saved onboard notes use this rough structure:

```markdown
---
title: "FITFO Plan - example-plumbing.test"
domain: "example-plumbing.test"
generated_at: "2026-04-29T12:00:00.000Z"
report_type: "obsidian-plan"
tags:
  - fitfo
  - client-plan
  - site-structure
---

# FITFO Plan - example-plumbing.test

**Kickstarting onboarding.**

## Evidence Labels

- **Observed:** Found in DNS, HTTP, sitemap/page crawl, or visible site signals.
- **Research:** Found through Firecrawl-backed web/search results.
- **Inferred:** Reasonable planning hypothesis that needs validation.
- **Ask Client:** Do not assume; confirm with client or previous developer.

## Wayback Recent Versions

| Captured | URL | Title | H1 | Words | Forms | Phones | Tools |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 2026-04-01 12:00 UTC | https://example-plumbing.test/ | Example Plumbing | Example Plumbing | 420 | 0 | 555-123-4567 | Google Tag Manager |
| 2025-12-01 12:00 UTC | https://example-plumbing.test/ | Old Example Plumbing | Emergency Plumbing | 650 | 1 | 555-123-4567 | Google Tag Manager, CallRail |

### Wayback Change Flags

| Signal | Previous Capture | Latest Capture | Note |
| --- | --- | --- | --- |
| Forms | 1 | 0 | -1 from previous capture. |

## Unknowns Blocking Work

| Blocker | Severity | Owner | Evidence | Ask |
| --- | --- | --- | --- | --- |
| Origin hosting | High | Client / Previous Developer | Hosting is hidden behind Cloudflare. | Confirm where files, backups, deployment, and emergency restore access live. |
| Lead routing / CRM | Medium | Client | No CRM, booking, or field-service tool was detected publicly. | Confirm where form fills, calls, bookings, estimates, and notifications go. |

## Call One Workflow

| Area | Found | Need | Risk | Ask | Owner | Audience |
| --- | --- | --- | --- | --- | --- | --- |
| Domain | GoDaddy | Get GoDaddy login, owner invite, billing contact, renewal status, and transfer-lock status. | No ownership, renewal, transfer lock, or nameserver changes without registrar access. | Who owns the GoDaddy account? | Client | Client-facing |
| Internal next step | Public scan complete | Turn unknowns into assigned follow-up tasks before proposal, sitemap, or launch planning. | Planning based on assumptions can miss DNS/email/lead-routing dependencies. | Which items block our next milestone? | Us | Internal |

## Why FITFO Thinks This

| Area | Finding | Confidence | Why FITFO Thinks This | Client Follow-Up |
| --- | --- | --- | --- | --- |
| Registrar | GoDaddy | High | Public domain records identify GoDaddy. | Ask for GoDaddy owner/admin access or a delegated invite. |
| Hosting | WP Engine | Medium | CNAME and HTTP hints point toward WP Engine. | Confirm WP Engine account ownership, backups, deployment process, and billing owner. |

## Go Get These Logins

| Login / Access | Current Public Status | Owner | What Client Needs To Get |
| --- | --- | --- | --- |
| Domain registrar | GoDaddy | Client | Get GoDaddy login, owner invite, billing contact, renewal status, and transfer-lock status. |
| Hosting | WP Engine | Client / Previous Developer | Get WP Engine hosting access, backups, deployment notes, SFTP/SSH or dashboard access, and billing owner. |

## Do Not Touch Until Confirmed

| Area | Do Not Touch | Why It Matters |
| --- | --- | --- |
| DNS zone | Do not change nameservers or delete records until the full DNS zone is documented. | Website, email, verification, tracking, booking, and CRM services may depend on records that are easy to miss. |
| Email | Do not change MX, SPF, DKIM, or DMARC until the email provider and sender platforms are confirmed. | Email continuity depends on DNS records that may not be obvious to the client. |

## Focus First

- **Access and ownership:** Secure domain, DNS, hosting, CMS, email, analytics, forms, and previous-developer handoff before changing anything.
- **Measurement:** Confirm GA4, Search Console, Tag Manager, call tracking, form routing, CRM, and campaign ownership early.

## Prioritized Action Report

| Priority | Source | Owner | Action | Detail |
| --- | --- | --- | --- | --- |
| High | Ask Client | Client | Confirm priority services and markets | Use detected service and location themes as prompts. |
| High | Inferred | Us | Map keywords to pages | Decide which existing pages should be improved and which new pages should be scoped. |
```

## Advanced Table Exports

Pass `--export-tables` when you also want CSV/JSON sidecars:

```bash
fitfo onboard example-plumbing.test --location "Richmond, VA" --vault ~/Obsidian/Clients --export-tables fitfo-exports
```

```text
fitfo-exports/
  example-plumbing.test-action-items.csv
  example-plumbing.test-call-one-workflow.csv
  example-plumbing.test-competitors.csv
  example-plumbing.test-content-inventory.csv
  example-plumbing.test-hosting-evidence.csv
  example-plumbing.test-infrastructure-snapshot.csv
  example-plumbing.test-login-checklist.csv
  example-plumbing.test-subdomains.csv
  example-plumbing.test-wayback-changes.csv
  example-plumbing.test-wayback-versions.csv
  example-plumbing.test-keyword-page-map.csv
  example-plumbing.test-launch-checklist.csv
  example-plumbing.test-redirect-matrix.csv
  example-plumbing.test-top-local-competitors.csv
  example-plumbing.test-research-tables.json
  example-plumbing.test-unknown-blockers.csv
```

Use these for Sheets, kickoff docs, or internal planning views.

## Expanded Subdomain Checks

Use this before redesign, DNS cleanup, or launch planning when old staging, portal, shop, booking, CRM, mail, admin, or app hosts may exist.

```bash
fitfo plan example-plumbing.test --subdomains
```

The scan still uses passive DNS lookups only. It does not crawl or brute-force arbitrary hostnames.

Subdomain findings are classified for launch handling:

- staging / legacy
- portal / app
- operations / support
- commerce / billing
- email
- technical admin / infrastructure
- content / delivery
- unknown

Table exports include:

```text
fitfo-exports/
  example-plumbing.test-subdomains.csv
```

## Redirect Matrix Export

Use this when a redesign needs a current-to-future URL handling worksheet:

```bash
fitfo plan example-plumbing.test --deep --subdomains --export-tables fitfo-exports
```

This adds:

```text
fitfo-exports/
  example-plumbing.test-redirect-matrix.csv
```

The matrix includes current target, current state, keep/rework/create/redirect/confirm decision, future target, launch phase, owner, status, and evidence. Use it to decide what stays, what gets rebuilt, what needs redirect rules, and what must be confirmed before DNS or launch work.

## Agent Readiness Add-On

Use this when launch planning needs a first-pass read on whether the site is easy for crawlers and AI agents to discover and interpret.

```bash
fitfo plan example-plumbing.test --deep --agent-ready
```

The add-on checks:

- `robots.txt`
- sitemap discovery
- canonical host clarity
- readable public pages
- accidental `noindex` directives
- explicit AI crawler rules in `robots.txt`
- app/API and commerce protocol applicability

Missing emerging protocols are not treated as failures for normal local-business sites. FITFO reports them as not applicable unless the site has a real app, API, authentication, or commerce workflow.

Export it for Sheets or a launch QA checklist:

```bash
fitfo plan example-plumbing.test --deep --agent-ready --export-tables fitfo-exports
```

This adds:

```text
fitfo-exports/
  example-plumbing.test-agent-readiness.csv
```

The combined JSON bundle also includes an `agentReadiness` array.
