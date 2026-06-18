---
name: fitfo
description: >-
  Run the FITFO CLI to kickstart client website onboarding from a domain name.
  Use when the user wants to onboard a new client, audit or scan a domain's
  infrastructure (registrar/RDAP, DNS, MX/SPF/DMARC/DNSSEC, hosting, CMS, email
  clues, subdomains), prep for a first client call, or produce a build/launch
  plan. Triggers on "onboard <domain>", "scan this domain", "who controls this
  domain", "client handoff", "first-call brief", "build plan for <site>", or any
  request to turn a public domain into a working Markdown brief.
---

# FITFO — client domain onboarding scanner

FITFO ("Find Infrastructure, Tech & Footprint Overview") is a zero-dependency
Node CLI that turns a public domain into a structured onboarding brief: who
controls the domain, where DNS lives, what hosting/CMS/email is detectable, what
subdomains exist, and what access the client needs to collect. Default output is
Markdown.

## Prerequisite

`fitfo` must be on PATH (`npm install -g fitfo`, or `npm link` from the repo).
Verify with `fitfo doctor`. Node >= 20 is required.

## Choosing a mode

Pick the lightest mode that answers the request — do not default to the heaviest.

| User intent | Command |
| --- | --- |
| Fast technical scan / "what is this domain" | `fitfo <domain>` |
| Light, client-facing walkthrough | `fitfo snapshot <domain>` |
| First-call prep packet | `fitfo brief <domain>` |
| Build / launch planning report | `fitfo plan <domain> --deep` |
| Full intake + saved Markdown note | `fitfo onboard <domain>` |
| Just show the run plan, do nothing | `fitfo <mode> <domain> --preview` |

## Useful flags

- `--deep` — crawl the site for deeper signals.
- `--subdomains` — expanded passive subdomain checks.
- `--wayback` — compare recent archived versions for site changes.
- `--client-safe` — phrase output for a client-facing audience.
- `--agent-ready` — append an agent-readiness add-on (pairs with `plan`).
- `--markdown` / `--json` / `--obsidian` — pick output format (Markdown is default).
- `--save` / `--no-save` — `onboard` saves a timestamped note by default; other
  modes save only when asked.
- `--vault <dir>` — write the Markdown note into a specific notes/Obsidian vault.
- `--out <file>` / `--quiet` — write to a specific file / suppress terminal output.
- `--export-tables <dir>` — emit CSV/JSON sidecars.

## Web research enrichment (`--search`) — bring your own key

`--search` enables live web research (SERP, reviews, competitor signals) via
Firecrawl. It requires a **Firecrawl API key that the user provides in their own
environment** as `FIRECRAWL_API_KEY` (or a logged-in Firecrawl CLI). This skill
never carries or needs the key value.

- Before adding `--search`, assume the key may be unset. If FITFO reports the key
  is missing, run the same command **without** `--search` — every mode works
  fully without it; only the live-research enrichment is skipped.
- Never ask the user to paste their API key into the conversation. If they want
  search and it is not configured, point them to `.env.example` and `fitfo doctor`.

## Conventions

- Default deliverable is Markdown. Treat Obsidian as a destination for Markdown,
  not a separate format.
- Confirm the destination before writing into a user's notes vault.
- Prefer `--preview` first when the user is unsure what a run will do.
