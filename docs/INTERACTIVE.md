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
