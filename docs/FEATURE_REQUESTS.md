# Feature Requests

This is a parking lot for ideas from the maintainer, users, and future contributors.

Items here are not commitments. They need shaping before implementation.

## Access Onboarding

- Add `www` vs apex canonical behavior.
- Improve TLS checks with SAN coverage and issuer-specific notes.
- Improve redirect chain checks across apex and `www`.
- Add domain expiration warning thresholds.
- Translate domain status codes into plain English.
- Improve registrar detection for unusual TLDs.
- Improve hosting detection for common WordPress hosts.
- Detect managed CDN layers separately from DNS-owned Cloudflare.
- Expand real-world subdomain fixture coverage after `--subdomains` passes.
- Add launch handling refinements for staging/dev/shop/client portal subdomain classes.

## Marketing / Analytics

- Detect GA4 IDs.
- Detect GTM container IDs.
- Detect Meta Pixel IDs.
- Detect Google Ads tags.
- Detect CallRail.
- Detect HubSpot forms/tracking.
- Detect Klaviyo/Mailchimp.
- Detect common WordPress form plugins.
- Add a marketing-access checklist.

## Brief Mode

- Pull homepage copy into a short summary.
- Generate copy/UX improvement notes.
- Improve service and location recommendations with more real-client passes.
- Add richer competitor-informed copy patterns.
- Add client-ready agenda templates by vertical.

## Redirect / Launch Matrix

- Refine future URL suggestions after real redirect-matrix exports.
- Add owner/status presets for WordPress rebuild workflows.
- Add redirect-rule format helpers for common hosts once enough launch cases are observed.

## Verticals

- Expand `--vertical plumbing` after private real-domain passes.
- Add vertical profiles for HVAC, electrical, roofing, legal, and local healthcare only after plumbing proves the profile contract.
- Add more fake fixtures for emergency CTA, call tracking, field-service widgets, service-area pages, and review-proof patterns.
- Keep vertical profiles in core until repeated extension points are obvious; do not build a public plugin system yet.

## CLI / UX

- Add compact report mode.
- Improve Obsidian note templates after real client use.
- Add JSON schema for `--json`.
- Improve terminal styling without sacrificing copy/paste quality.

## Agent Readiness

- Expand optional `fitfo plan --agent-ready` report layer after real-domain passes.
- Current first pass checks `robots.txt`, sitemap, canonical host, crawlable page content, accidental `noindex`, and explicit AI crawler policy.
- Add `.well-known` and protocol discovery checks for API/application sites when the use case is real.
- Keep emerging commerce checks parked until FITFO has a practical commerce workflow.
- Treat missing agent protocols as "not applicable" for normal local-business sites unless the client goal says otherwise.

## Packaging

- Publish pre-release package when ready.
- Add issue templates before public release.
- Add public-facing examples without exposing client data.
- Add `npm create` or one-command install notes after package publishing.
