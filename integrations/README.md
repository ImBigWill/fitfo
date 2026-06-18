# FITFO agent integrations

Drop-in instructions that teach AI coding agents how to drive the FITFO CLI.
Both files describe the **same** key-agnostic usage — they differ only in the
wrapper each agent expects.

| File | For | Format |
| --- | --- | --- |
| `SKILL.md` | Claude Code | YAML frontmatter (`name`, `description`) + body |
| `AGENTS.md` | OpenAI Codex and other `AGENTS.md`-aware agents | plain Markdown |

## Security: no API keys live here

These files reference only the **name** of the environment variable FITFO reads
at runtime — `FIRECRAWL_API_KEY` — never its value. FITFO loads the key from the
environment (`process.env.FIRECRAWL_API_KEY`) when you pass `--search`. Keep your
key in your own untracked `.env` (already gitignored) or shell environment. Every
FITFO mode works without a key; only the `--search` enrichment needs one.

## Install for Claude Code

Personal (available in every project on your machine):

```bash
ln -s "$(pwd)/integrations" ~/.claude/skills/fitfo
```

Or copy instead of symlink if you prefer a frozen snapshot:

```bash
mkdir -p ~/.claude/skills/fitfo && cp SKILL.md ~/.claude/skills/fitfo/
```

Project-scoped (committed, fires inside whatever repo you do client work in):

```bash
mkdir -p .claude/skills/fitfo && cp /path/to/fitfo/integrations/SKILL.md .claude/skills/fitfo/
```

## Install for Codex

Codex reads `AGENTS.md`. Reference or copy this folder's `AGENTS.md` into the
repo where you run onboarding, or into your global Codex config, e.g.:

```bash
cp AGENTS.md ~/.codex/AGENTS.md   # or merge into an existing one
```

## Add your own Firecrawl key (optional)

Only needed for `--search`. See the repo's `.env.example`:

```bash
echo 'FIRECRAWL_API_KEY=fc-your-own-key' >> .env
fitfo doctor   # confirms detection
```
