# FITFO WordPress One-Page Build Plan

## Recommendation

Build the one-page FITFO site in WordPress first, then keep the strategy and theme/pattern source versioned in GitHub.

Use Obsidian for working notes and GitHub for the canonical implementation plan, theme source, and public-release-safe docs.

## Site Architecture

This should start as a single page, not a full site.

Recommended URL structure:

- `/` or `/fitfo/`: main one-page product page
- `/docs/`: optional later, only if FITFO moves toward public release
- `/examples/`: optional later, fake/demo outputs only

If this lives on a subdomain, use something simple:

- `fitfo.lghq.com`
- `tools.lghq.com/fitfo`
- `fitfo.lovablegazelle.com`

For now, WordPress is the better choice if visual editing and iterative copy are more important than static docs hosting. Cloudflare Pages can come later for generated docs or examples.

## WordPress Build Approach

Use a lightweight block-theme approach if we want GitHub version control:

```text
fitfo-site-theme/
├── theme.json
├── style.css
├── functions.php
├── templates/
│   └── front-page.html
├── parts/
│   ├── header.html
│   └── footer.html
└── patterns/
    ├── hero.php
    ├── report-modes.php
    ├── architecture-map.php
    ├── risk-prevention.php
    └── install-status.php
```

Keep PHP minimal. Most content should be editable block markup or registered patterns.

## Visual Direction

FITFO should feel like a practical operator console.

Design rules:

- black surface
- hot pink `#FF00AA`
- electric blue `#00DCFF`
- white and gray text
- compact panels
- technical but client-readable
- no purple
- no generic SaaS hero

Typography:

- use a distinctive display font for headings
- use a readable body font
- avoid huge type beyond practical hero use
- keep layout dense enough to feel like a working tool

## Section Plan

### 1. Header

Content:

- FITFO wordmark / text logo
- nav anchors:
  - What it maps
  - Reports
  - Architecture
  - Install
  - Status

### 2. Hero

Goal:

Make the tool clear in the first few seconds.

Blocks:

- heading: `FITFO`
- subheading: `Find Infrastructure, Tech & Footprint Overview`
- paragraph explaining client website handoff discovery
- command example
- GitHub/status buttons
- terminal/report preview image or block-styled mock

### 3. What It Maps

Use a grid of concise cards:

- registrar and domain provider
- DNS and nameservers
- Cloudflare / CDN
- hosting and CMS
- email safety
- analytics and tracking
- CRM / booking / field-service tools
- subdomains
- redirects and canonical host

### 4. Report Modes

Use four horizontal rows or cards:

- Snapshot
- Brief
- Plan
- Onboard

Each row should show command, purpose, and when to use it.

### 5. Architectural State Map

This is the differentiating section.

Explain:

- current state assessment
- future-state planning
- keep / rework / create / redirect / confirm decisions
- pre-launch, launch, and post-launch handling

Visual:

A simplified table:

| Current | Decision | Redesign | Launch |
| --- | --- | --- | --- |
| `/services/drain-cleaning/` | Rework | Improve proof + CTA | Keep URL |
| `staging.example.com` | Confirm | Identify owner | Do not remove DNS |
| HTTP apex | Redirect | Choose canonical | Force HTTPS |

### 6. Why It Matters

Frame the operational risks:

- email breaks during DNS cutover
- hidden host behind Cloudflare
- forms stop routing leads
- tracking disappears
- service pages lose equity
- old URLs go unredirected
- launch happens without rollback path

### 7. Install / Status

Show:

```bash
npm link
fitfo doctor
fitfo onboard clientdomain.com
```

Status bullets:

- private-first
- GPL-2.0-or-later
- Node >=20
- dependency-free
- fixture-driven provider detection
- public release later

### 8. Footer

Content:

- project status
- GitHub link
- license
- no client data disclaimer

## GitHub Integration

Keep these in GitHub:

- website brief
- WordPress build plan
- theme source if we create a custom block theme
- fake/demo screenshots
- README image assets

Do not commit:

- real client scan outputs
- private screenshots
- Obsidian vault internals
- local-only exports
- credentials or `.env`

## Obsidian Integration

Keep a copy of the planning docs in:

```text
LGHQ/FITFO
```

Use Obsidian for:

- copy drafts
- design notes
- launch checklist
- content revisions
- image selection notes

Use GitHub for:

- final plan docs
- code/theme source
- public-safe examples
- release-ready assets

## Build Phases

### Phase 1: Planning

- finalize one-page copy outline
- choose domain/subdomain
- pick WordPress vs static hosting
- select fake screenshots or SVG mocks

### Phase 2: WordPress Theme / Page

- create lightweight block theme or page pattern set
- build hero and key sections
- add responsive styling
- test mobile and desktop

### Phase 3: Assets

- capture or design terminal previews
- import only public-safe assets
- add alt text
- optimize file sizes

### Phase 4: Launch

- connect domain/subdomain
- set redirects if needed
- configure Cloudflare DNS/caching
- verify forms/analytics if added
- update README with final site URL when ready

## Open Decisions

- final domain or subdomain
- whether the page lives on existing WordPress or a new WordPress install
- whether to build a custom block theme or use an existing theme with custom patterns
- which fake/demo screenshots should become canonical README/site assets
- whether the GitHub repo should include a `/website` package later

