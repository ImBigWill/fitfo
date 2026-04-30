# Provider Fixtures

Provider detection should improve from real misses, not guesses.

When FITFO misses a registrar, DNS provider, host, email service, CRM, booking tool, or marketing platform:

1. Capture the public signal that should have identified it.
2. Remove client-specific or sensitive context.
3. Add a focused fixture to `test/fixtures/provider-patterns.js`.
4. Add or update provider logic in `src/lib/analyze.js`.
5. Run:

   ```bash
   npm test
   npm run check
   ```

## Fixture Guidelines

- Keep fixtures small and readable.
- Use fake domains.
- Include only public DNS/HTTP/header/body clues.
- Do not add credentials, private client names, API keys, account IDs, or copied private report content.
- Prefer one missed pattern per fixture.
- If RDAP misses a registrar but nameservers imply one, add a fixture that proves FITFO labels it as likely and still asks for manual confirmation.
- For hosting misses, include the public clue that should have helped: CNAME, HTTP headers, SOA, reverse DNS/PTR, ASN/network owner, or visible page/script evidence.

## Current Priority Providers

Provider coverage should keep improving around the most common client handoff patterns:

- registrars: GoDaddy, Namecheap, Cloudflare Registrar, Squarespace Domains, Hostinger, Porkbun, Name.com
- DNS/CDN: Cloudflare, GoDaddy DNS, WP Engine DNS, Kinsta DNS, Netlify DNS, Vercel, DNSimple
- WordPress hosts: WP Engine, Kinsta, SiteGround, Bluehost, Hostinger, A2 Hosting, IONOS
- hosted builders: Wix, Squarespace, Webflow, Shopify
- email: Google Workspace, Microsoft 365, Zoho, Rackspace, Titan
- CRM/field service: ServiceTitan, Housecall Pro, Jobber, FieldEdge, Service Fusion, Workiz, Podium, Birdeye

The goal is not perfect attribution. The goal is to tell the client what to track down next with enough confidence to be useful.
