# Project State

Last updated during the initial private build.

## Current State

FITFO is a private, GPL-2.0-or-later CLI tool.

It can:

- scan a domain from the terminal
- render a styled onboarding report
- render plain output for copying/saving
- output JSON
- output Markdown
- save Obsidian-ready Markdown notes with frontmatter, tags, checklists, and client-call questions
- save reports when explicitly requested
- print the current version
- run a local `doctor` environment check
- run fast dependency-free tests with `npm test`
- infer registrar, DNS, hosting, Cloudflare/CDN, CMS, email, analytics, and common subdomain clues
- generate a practical access checklist
- generate a starter previous-developer request

## Current Branch

Default branch:

```text
master
```

## Current Repository Posture

- Private GitHub repository first.
- Intended to become open source later.
- GPL-2.0-or-later license from the beginning.
- No client reports or scan outputs should be committed.
- Generated report folders are ignored.

## What Belongs In Core

Core should focus on fast onboarding discovery:

- domain records
- DNS records
- hosting/CMS/email clues
- common passive subdomain checks
- analytics/tag clues
- access checklist
- previous developer/client handoff questions

## What Probably Does Not Belong In Core

These may become separate commands or modules:

- deeper website/content analysis
- keyword research
- competitor research
- positioning strategy
- crawling many pages
- aggressive subdomain enumeration
- vulnerability scanning
- credential testing

## Next Sensible Commit Candidates

- Add SSL certificate checks.
- Add redirect checks.
- Add `docs/RELEASE.md`.
- Add GitHub Actions syntax check.
- Refine Obsidian templates after a few real scans.
- Add network fixture tests for real-world scanner edge cases without depending on live DNS during normal test runs.
