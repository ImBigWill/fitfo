# FITFO — agent usage guide

This file teaches an AI coding agent (OpenAI Codex, or any `AGENTS.md`-aware
assistant) how to drive the FITFO CLI. It is identical in intent to the Claude
`SKILL.md` in this folder and contains **no secrets** — only the public name of
the environment variable FITFO reads at runtime.

## What FITFO does

FITFO ("Find Infrastructure, Tech & Footprint Overview") is a zero-dependency
Node CLI that turns a public domain into a client-onboarding brief: registrar/
RDAP, DNS (MX/SPF/DMARC/DNSSEC), hosting, CMS, email clues, and subdomains.
Default output is Markdown.

## When to use it

Reach for FITFO when the user wants to onboard a new client, scan or audit a
domain's infrastructure, figure out who controls a domain, prep for a first
client call, or produce a build/launch plan from a domain name.

## Prerequisite

`fitfo` must be on PATH (`npm install -g fitfo`, or `npm link` from this repo).
Verify with `fitfo doctor`. Node >= 20 required.

## Choosing a mode (pick the lightest that fits)

| Intent | Command |
| --- | --- |
| Fast technical scan | `fitfo <domain>` |
| Light client-facing walkthrough | `fitfo snapshot <domain>` |
| First-call prep packet | `fitfo brief <domain>` |
| Build / launch plan | `fitfo plan <domain> --deep` |
| Full intake + saved Markdown note | `fitfo onboard <domain>` |
| Dry run (show plan only) | `fitfo <mode> <domain> --preview` |

## Useful flags

`--deep` (crawl), `--subdomains`, `--wayback`, `--client-safe`,
`--agent-ready` (pairs with `plan`), `--markdown` / `--json` / `--obsidian`,
`--save` / `--no-save`, `--vault <dir>`, `--out <file>`, `--quiet`,
`--export-tables <dir>`.

## Web research (`--search`) — user supplies their own key

`--search` enables live Firecrawl-backed research and requires the user's own
`FIRECRAWL_API_KEY` in the environment (or a logged-in Firecrawl CLI). This guide
never carries the key.

- If the key is unset, FITFO says so; rerun the command without `--search`. Every
  mode works fully without it — only the live-research enrichment is skipped.
- Never ask the user to paste an API key into chat. Point them to `.env.example`
  and `fitfo doctor` instead.

## Conventions

- Markdown is the default deliverable; Obsidian is a Markdown destination.
- Confirm before writing into a user's notes vault.
- Use `--preview` when the intended run is unclear.
