# Roadmap

FITFO starts as a private CLI tool and should become public once the default scan and docs are stable.

## Product Shape

FITFO has two intended jobs:

1. **Access onboarding**
   - What is where?
   - Who controls it?
   - What does the client need to track down?

2. **Client call prep**
   - What does the existing website suggest?
   - What should be improved?
   - What questions should we ask on the first call?

The default command should stay fast and operational:

```bash
fitfo clientdomain.com
```

The deeper research mode should become a separate command:

```bash
fitfo brief clientdomain.com
```

## Near-Term

- Improve install and release documentation.
- Add SSL certificate checks.
- Add redirect checks for `http`, `https`, `www`, and apex behavior.
- Improve hosting fingerprints.
- Improve DNS provider fingerprints.
- Improve analytics and marketing tag detection.
- Add clearer saved report formats.
- Add package metadata for future npm publishing.

## Onboarding Scanner Ideas

- Domain expiration warning.
- Plain-English domain status interpretation.
- Registrar/DNS mismatch explanation.
- SSL issuer and expiration.
- Homepage redirect chain.
- `robots.txt` and `sitemap.xml` presence.
- Known WordPress plugin/theme/page builder clues.
- Better form and lead-routing detection.
- Better email service detection from SPF/DKIM/TXT records.
- Known call tracking and CRM clues.

## Brief Mode Ideas

`fitfo brief` should prepare for the first client call.

Possible sections:

- website summary
- homepage title/meta/H1
- visible CTAs
- navigation and page structure
- local SEO signals
- schema markup
- keyword hypotheses
- positioning hypotheses
- obvious copy opportunities
- obvious conversion opportunities
- questions for the client to confirm, deny, or improve

Important: brief mode should label findings as public signals, inferred hypotheses, and questions. It should not pretend to know the business from one scan.

## Plugin / Module Direction

Do not build a plugin system yet.

For now, keep scanner capabilities as internal modules. If the tool grows, a future internal module layout could look like:

```text
domain records
dns records
website fingerprint
cms clues
marketing tags
brief research
report renderers
```

A public plugin architecture is premature until we know which extension points are actually useful.
