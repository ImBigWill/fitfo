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
- Detect staging/dev/shop/client portals from common subdomains.
- Add `--subdomains` option for expanded passive subdomain checks.

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

## CLI / UX

- Add compact report mode.
- Improve Obsidian note templates after real client use.
- Add JSON schema for `--json`.
- Improve terminal styling without sacrificing copy/paste quality.

## Packaging

- Publish pre-release package when ready.
- Add issue templates before public release.
- Add public-facing examples without exposing client data.
- Add `npm create` or one-command install notes after package publishing.
