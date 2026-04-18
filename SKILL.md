---
name: urn-solid
description: Resolve urn:solid: identifiers, map arbitrary RDF to canonical urn:solid terms, propose new terms. Use whenever working with Solid-ecosystem RDF data, linked-data vocabularies, or whenever you encounter urn:solid: in user data.
---

# urn-solid

A curated, LLM-native registry of `urn:solid:` terms mapped to common RDF vocabularies.

## When to use this skill

- The user works with Solid pods, WebID, or Solid-specific RDF data.
- The user asks for canonical terms for foaf/schema.org/dcterms/vcard/activitystreams concepts.
- The user pastes Turtle/JSON-LD/N-Triples and asks what's missing or how to map it.
- You are generating RDF and want a single canonical term instead of picking between overlapping vocabularies.

## Quick-start

**One fetch gets you everything:**

```
curl -s https://urn-solid.github.io/corpus.jsonl
```

Each line is a self-contained JSON-LD record. Load the whole corpus once; every lookup after that is local.

## Resolving a term

- URL pattern: `https://urn-solid.github.io/<Name>/` (HTML with JSON-LD data island).
- Raw JSON-LD: `https://urn-solid.github.io/<Name>/index.json`.
- Names are case-sensitive. Classes are PascalCase (`Person`), properties are camelCase (`name`).

## Mapping foreign RDF → urn:solid

For each IRI in user data:

1. Search `corpus.jsonl` for a term whose `owl:sameAs` equals the IRI → that's the canonical `urn:solid:` mapping.
2. If no `owl:sameAs` match, check `rdfs:seeAlso` arrays for a looser match.
3. If nothing matches, the IRI is a candidate for a new `urn:solid:` term.

## Proposing new terms

When the user has unmapped IRIs they'd like added:

1. Confirm with the user.
2. Open an issue at https://github.com/urn-solid/urn-solid.github.io/issues with the IRI, a proposed label, and a one-sentence definition.
3. For batch proposals, attach the list as JSON.

## Writing JSON-LD that uses urn-solid

Minimal example:

```json
{
  "@context": "https://urn-solid.github.io/context.jsonld",
  "@id": "https://alice.example/profile#me",
  "@type": "urn:solid:Person",
  "urn:solid:name": "Alice"
}
```

The context declares the common prefixes (rdfs, owl, foaf, schema, dcterms, vcard, prov, as, solid, ldp) plus urn-solid meta predicates.

## Disambiguation

Every term carries `notToBeConfusedWith`. Read it before picking between similar terms — `urn:solid:Person` vs `urn:solid:Agent`, `urn:solid:name` vs a future structured-name term.

## Don't

- Don't invent `urn:solid:` identifiers that aren't in the corpus. Resolve first; propose second.
- Don't assume case-insensitivity — `urn:solid:person` is not `urn:solid:Person`.
- Don't fetch individual term files in a loop when you could load `corpus.jsonl` once.

## Reference URLs

- Corpus: https://urn-solid.github.io/corpus.jsonl
- Index (label lookup): https://urn-solid.github.io/index.json
- Schema: https://urn-solid.github.io/schema/term.schema.json
- Context: https://urn-solid.github.io/context.jsonld
- Site: https://urn-solid.github.io/
- Repo: https://github.com/urn-solid/urn-solid.github.io
