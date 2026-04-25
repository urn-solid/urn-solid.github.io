#!/usr/bin/env node
// Build step: read <Name>/index.json at repo root, validate structure, emit HTML wrappers + index.json + corpus.jsonl.
// Idempotent: only writes a file if its content actually changed (avoids commit noise).

const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");

// Root-level names that are NOT terms.
const RESERVED = new Set([
  "schema", "scripts", "node_modules", ".github", ".git", ".claude",
  "assets", "vendor", "spec",
]);

const isTermDir = (name) => {
  if (RESERVED.has(name)) return false;
  if (name.startsWith(".")) return false;
  if (!/^[A-Za-z][A-Za-z0-9_-]*$/.test(name)) return false;
  return fs.existsSync(path.join(ROOT, name, "index.json"));
};

const writeIfChanged = (file, content) => {
  if (fs.existsSync(file) && fs.readFileSync(file, "utf8") === content) return false;
  fs.writeFileSync(file, content);
  return true;
};

const escapeForScriptTag = (json) => json.replace(/<\/script/gi, "<\\/script");

const htmlShell = (term, jsonText) => {
  const id = term["@id"];
  const name = id.replace(/^urn:solid:/, "");
  const comment = (term["rdfs:comment"] || "").replace(/"/g, "&quot;");
  const absUrl = `https://urn-solid.com/${name}/`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${id} — urn-solid</title>
<meta name="description" content="${comment}">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="/style.css">
<link rel="canonical" href="${absUrl}">
<link rel="alternate" type="application/ld+json" href="/${name}/index.json">
<link rel="icon" type="image/svg+xml" href="/assets/favicon.svg">
<link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32.png">
<link rel="apple-touch-icon" sizes="180x180" href="/assets/favicon-180.png">

<meta property="og:type" content="article">
<meta property="og:site_name" content="urn-solid">
<meta property="og:title" content="${id}">
<meta property="og:description" content="${comment}">
<meta property="og:url" content="${absUrl}">
<meta property="og:image" content="https://urn-solid.com/assets/og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${id}">
<meta name="twitter:description" content="${comment}">
<meta name="twitter:image" content="https://urn-solid.com/assets/og.png">

<script type="application/ld+json">
${escapeForScriptTag(jsonText)}
</script>
</head>
<body>
<header class="site-header">
  <a href="/" class="site-name">urn-solid</a>
  <nav>
    <a href="/corpus.jsonl">corpus</a>
    <a href="/schema/term.schema.json">schema</a>
    <a href="/llms.txt">llms.txt</a>
  </nav>
</header>
<main id="term"></main>
<script src="/render.js"></script>
</body>
</html>
`;
};

// Case-sensitive filesystem assumed. RDF vocabularies routinely distinguish
// `Type` (PascalCase class) from `predicate` (camelCase property) — both are
// legitimate term names and we accept both. Linux and web URLs are
// case-sensitive; macOS / Windows contributors need a case-sensitive
// filesystem (APFS case-sensitive volume, WSL2, devcontainer, etc.).
// See CONTRIBUTING.md.
//
// We still WARN on collisions so the build log surfaces them — useful for
// spotting accidental duplicates in PR review — but no longer fail the build.
const reportCaseCollisions = (names) => {
  const lower = new Map();
  for (const n of names) {
    const key = n.toLowerCase();
    if (lower.has(key) && lower.get(key) !== n) {
      console.warn(`[build] case-collision warning: "${lower.get(key)}" and "${n}" differ only in case (intentional Class/property pairs are fine; check this isn't an accidental duplicate)`);
    } else {
      lower.set(key, n);
    }
  }
};

const main = () => {
  const names = fs.readdirSync(ROOT, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)
    .filter(isTermDir)
    .sort();

  reportCaseCollisions(names);

  const index = {};
  const reverseIndex = {};
  const corpusLines = [];
  let htmlChanged = 0;

  for (const name of names) {
    const srcPath = path.join(ROOT, name, "index.json");
    const jsonText = fs.readFileSync(srcPath, "utf8");

    let term;
    try { term = JSON.parse(jsonText); }
    catch (e) {
      console.error(`[build] ${srcPath}: malformed JSON — ${e.message}`);
      process.exit(1);
    }

    const expectedId = `urn:solid:${name}`;
    if (term["@id"] !== expectedId) {
      console.error(`[build] ${srcPath}: @id "${term["@id"]}" does not match directory name (expected "${expectedId}").`);
      process.exit(1);
    }

    if (writeIfChanged(path.join(ROOT, name, "index.html"), htmlShell(term, jsonText))) htmlChanged++;

    index[term["@id"]] = {
      label: term["rdfs:label"],
      description: term["rdfs:comment"],
      type: term["@type"],
      status: term.status,
      path: `/${name}/`,
    };

    const sameAs = term["owl:sameAs"];
    const sameAsList = Array.isArray(sameAs) ? sameAs : (typeof sameAs === "string" ? [sameAs] : []);
    for (const iri of sameAsList) {
      if (reverseIndex[iri] && reverseIndex[iri] !== term["@id"]) {
        console.error(`[build] duplicate owl:sameAs "${iri}" — already mapped to ${reverseIndex[iri]}, also claimed by ${term["@id"]}`);
        process.exit(1);
      }
      reverseIndex[iri] = term["@id"];
    }

    corpusLines.push(JSON.stringify(term));
  }

  const indexChanged = writeIfChanged(path.join(ROOT, "index.json"), JSON.stringify(index, null, 2) + "\n");
  const reverseChanged = writeIfChanged(path.join(ROOT, "reverse-index.json"), JSON.stringify(reverseIndex, null, 2) + "\n");
  const corpusChanged = writeIfChanged(path.join(ROOT, "corpus.jsonl"), corpusLines.join("\n") + "\n");

  console.log(`[build] ${names.length} terms — ${htmlChanged} html updated, index.json ${indexChanged ? "updated" : "unchanged"}, reverse-index.json ${reverseChanged ? "updated" : "unchanged"}, corpus.jsonl ${corpusChanged ? "updated" : "unchanged"}`);
};

main();
