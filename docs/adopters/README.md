# Adopters

External projects formally aligning with `urn:solid:` — using `owl:sameAs` links, registering new terms, or building on the registry as part of a public design decision.

This is the social layer on top of the technical registry: who's actually using these names, and where, and why.

To add your project: open a PR with a Markdown file here named `<project>.md`. Suggested shape:

- **What you do** (one sentence)
- **What you align with** (which `urn:solid:` terms; new terms you'd like registered)
- **Where it's documented** (link to your ADR / RFC / blog post)
- **Status** (proposed / in development / shipped)

We won't gatekeep on size — early-stage projects welcome. The point is to make the alignment visible, not to vet anyone.

## Current adopters

- [VisionClaw](visionclaw.md) — knowledge-graph platform aligning OntologyClass entries with `urn:solid:` via `owl:sameAs`, publishing per-user `corpus.jsonl`, and proposing `urn:solid:KGNode`.
