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
- save a Markdown onboarding note

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
title: "FITFO Onboard - example-plumbing.test"
domain: "example-plumbing.test"
generated_at: "2026-04-29T12:00:00.000Z"
report_type: "obsidian-onboard"
tags:
  - fitfo
  - client-onboarding
  - full-intake
---

# FITFO Onboard - example-plumbing.test

**Kickstarting onboarding.**

## How To Use This Onboarding Note

- Start with **Unknowns Blocking Work** and **Call One Workflow** to assign ownership before changing anything.
- Use **Infrastructure Snapshot**, **Login / Access Checklist**, and **Do Not Touch Until Confirmed** as the day-one access checklist.
- Use **Architectural State Map** and **Redirect Matrix** to guide redesign, rebuild, and launch decisions.

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
