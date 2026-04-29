# Interactive Onboarding

FITFO can run as a guided onboarding wizard from:

```bash
fitfo
```

This is the best mode when you are starting a client intake and do not want to remember flags.

## Current Flow

The wizard asks what kind of output you want:

- quick domain scan
- client onboarding handoff
- kickoff research brief
- client build plan

Then it asks for the domain. You can enter either:

```text
example.com
https://www.example.com
```

FITFO normalizes the input to the domain it should scan.

## Recommended Client Intake Flow

For a first pass:

```bash
fitfo
```

Choose the quick scan or onboarding handoff. This gives the registrar, DNS, hosting, CMS, email, subdomain, analytics, CRM, and access checklist view.

For first-call prep:

```bash
fitfo
```

Choose kickoff research brief or client build plan. If search is enabled, FITFO may ask for a location so it can build better local keyword, competitor, and service-area research.

Fast path equivalents:

```bash
fitfo clientdomain.com
fitfo brief clientdomain.com --deep --search --location "City, ST"
fitfo plan clientdomain.com --deep --search --location "City, ST"
fitfo onboard clientdomain.com
```

## One-Command Full Intake

Use `onboard` when you want the whole run without remembering the full flag stack:

```bash
fitfo onboard clientdomain.com
```

This runs the complete action-plan path:

- domain, DNS, hosting, CMS, email, analytics, CRM, and subdomain scan
- deep website crawl
- Firecrawl-backed market/search research
- plan-mode recommendations and launch checklist
- Obsidian-ready action-plan note
- CSV/JSON sidecar table exports in `fitfo-exports/`

The saved action plan labels recommendations as `Observed`, `Research`, `Inferred`, or `Ask Client` so the kickoff call does not blur facts and assumptions.

When run in a normal terminal, `onboard` asks for missing details before the scan starts:

- `LOCAL`: market/location for local keyword and competitor research
- `VAULT`: Obsidian vault or folder where the action-plan note should go

If the location is unknown, press Enter to skip it. If you press Enter at the vault prompt, FITFO uses `fitfo-reports/`.

If a vault is configured, FITFO saves:

```text
clientdomain.com-onboard.md
```

One-off vault destination:

```bash
fitfo onboard clientdomain.com --location "City, ST" --vault ~/Obsidian/Clients
```

Recommended default setup:

```bash
fitfo config set vault ~/Obsidian/Clients
fitfo config set location "City, ST"
```

Preview the full run before scanning:

```bash
fitfo onboard clientdomain.com --preview
```

Run terminal-only without writing the Obsidian note or CSV/JSON table exports:

```bash
fitfo onboard clientdomain.com --no-save
```

## End-Of-Run Save Prompt

When a normal interactive text report finishes and no output file was already requested, FITFO asks whether to save the findings.

Current save choices:

- `desktop`: save a Markdown file to the Desktop
- `obsidian`: save a Markdown/Obsidian note to a vault or folder
- `custom`: provide the exact output path

FITFO uses simple domain filenames for prompted saves:

```text
clientdomain.com.md
```

If the suggested path is correct, press Enter. If you type `yes` at the final path prompt, FITFO treats that as accepting the suggested path.

## Obsidian Workflow

One-off Obsidian save:

```bash
fitfo brief clientdomain.com --obsidian --vault ~/Obsidian/Clients
```

Set a default vault:

```bash
fitfo config set vault ~/Obsidian/Clients
fitfo config set format obsidian
```

Then run:

```bash
fitfo brief clientdomain.com --deep --search --location "City, ST"
```

The saved note includes frontmatter, tags, checklists, client-call questions, action items, keyword tables, competitor/reputation notes, content inventory, and page recommendations when those signals are available.

## Defaults

Show current defaults:

```bash
fitfo config
```

Useful local defaults:

```bash
fitfo config set vault ~/Obsidian/Clients
fitfo config set location "Richmond, VA"
fitfo config set format obsidian
fitfo config set deep true
fitfo config set search true
```

## What Still Needs Polish

- Save prompt wording after more real use.
- Obsidian folder presets for client intake vs internal project notes.
- A compact interactive mode for quick repeated scans.
- Clearer labels for when FITFO is using observed facts, Firecrawl research, or inferred hypotheses.
