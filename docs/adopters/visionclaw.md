# VisionClaw

Knowledge-graph platform building on Solid pods with sovereignty-first defaults.

## What they align on

From [ADR-054 — URN-Solid + solid-schema + Solid-Apps Ecosystem Alignment](https://github.com/DreamLab-AI/VisionClaw/blob/main/docs/adr/ADR-054-urn-solid-and-solid-apps-alignment.md), ratified 2026-04-19:

1. **`OntologyClass` → `owl:sameAs urn:solid:<Name>`** — their internal vocabulary classes (e.g. `bc:Person`, `bc:Document`) emit `owl:sameAs` triples pointing at the corresponding URN-Solid term during ingest. Maintained as a mapping table at `docs/reference/urn-solid-mapping.md` in their repo.
2. **Per-user `corpus.jsonl` at `./public/kg/corpus.jsonl`** — same format and consumption pattern as URN-Solid's own `/corpus.jsonl`. Crawlable in one HTTP request per user.
3. **JSON-LD content negotiation in `solid-pod-rs`** — Phase 2 of their Rust Solid server.
4. **Proposed new term: `urn:solid:KGNode`** — they want a registry-blessed canonical name for knowledge-graph nodes; their schema would live on each user's pod at `./public/schema/kg-node.schema.json` and be the upstream contribution path back into solid-schema.

## Status

Ratified — implementation tracked under their compliance criteria. Term registration for `urn:solid:KGNode` open as a follow-up here.

## Why this matters to URN-Solid

- First external project to formally adopt `urn:solid:` for `owl:sameAs` linking.
- Validates the value of stable per-user corpus files — a pattern URN-Solid pioneered for the registry itself.
- Proposes a concrete new term (`KGNode`) that makes sense to register.
- Demonstrates the "ecosystem alignment, not lock-in" framing: they call out neither URN-Solid nor solid-schema as a *dependency*, just as opportunities.

## Links

- ADR: <https://github.com/DreamLab-AI/VisionClaw/blob/main/docs/adr/ADR-054-urn-solid-and-solid-apps-alignment.md>
- Project: <https://github.com/DreamLab-AI/VisionClaw>
