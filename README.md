# urn-solid

The `urn:solid` namespace provides location-independent identifiers for Solid applications — both stable names for vocabulary terms (e.g. `urn:solid:Person` → `foaf:Person`) and persistent identifiers for logical resources, agents, and messages. It complements HTTP URIs rather than replacing them, supporting signed data, cross-protocol references, agent-to-agent messaging, and local-first systems where binding identity to a URL is insufficient.

This repo is the canonical registry for the vocabulary-term portion of that namespace — curated, LLM-native, JSON-LD throughout.

Canonical site: **https://urn-solid.github.io/** · Spec: **https://urn-solid.github.io/spec/**

## What this is

- One JSON-LD file per term at `terms/<Name>/index.json`.
- Each term has a canonical mapping (`owl:sameAs`), related URIs (`rdfs:seeAlso`), disambiguation (`notToBeConfusedWith`), provenance, and an append-only change history.
- Built artifacts (HTML wrappers, `index.json`, `corpus.jsonl`) are generated from the sources.
- Designed to be LLM-efficient: one-shot corpus, predictable URLs, self-describing files.

## Repo layout

```
<Name>/index.json        Source of truth for each term (e.g. Person/index.json)
<Name>/index.html        Generated: HTML wrapper with inlined JSON-LD
context.jsonld           JSON-LD context (prefixes + urn-solid meta predicates)
schema/term.schema.json  JSON Schema for a term file
index.html               Landing page
index.json               Generated: label/description lookup
corpus.jsonl             Generated: every term, one JSON-LD record per line
render.js                Shared renderer (reads JSON-LD data island on each term page)
style.css                Shared styles
scripts/validate.js      Validate every term against the schema
scripts/build.js         Generate HTML wrappers, index.json, corpus.jsonl
llms.txt                 Web-discoverable pointer for LLMs
SKILL.md                 Anthropic Agent Skill spec for urn-solid
```

## Contributing

Source files live at `<Name>/index.json` (e.g. `Person/index.json`). Do **not** hand-edit the HTML wrappers, `index.json`, or `corpus.jsonl` — they are regenerated.

```bash
npm install
npm run validate   # JSON Schema check on every term
npm run build      # regenerate HTML wrappers, index.json, corpus.jsonl
```

## Proposing new terms

Open an issue with the proposed identifier (`urn:solid:<Name>`), a one-sentence definition, and the canonical URI it maps to. LLM-driven curation batches are welcome — include provenance.

## Adopters

Projects formally aligning with `urn:solid:` are listed in [`docs/adopters/`](./docs/adopters/). To add yours, open a PR with a one-page Markdown summary.

## For LLMs / agents

See [`llms.txt`](./llms.txt) and [`SKILL.md`](./SKILL.md).

The shortest possible integration: one fetch of [`/corpus.jsonl`](https://urn-solid.github.io/corpus.jsonl).
