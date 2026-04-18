# urn-solid

A curated, LLM-native registry of `urn:solid:` terms mapped to common RDF vocabularies — foaf, schema.org, dcterms, vcard, activitystreams, prov, ldp, solid.

Canonical site: **https://urn-solid.github.io/**

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

## For LLMs / agents

See [`llms.txt`](./llms.txt) and [`SKILL.md`](./SKILL.md).

The shortest possible integration: one fetch of [`/corpus.jsonl`](https://urn-solid.github.io/corpus.jsonl).
