#!/usr/bin/env node
// Validate every <Name>/index.json at repo root against schema/term.schema.json.

const fs = require("node:fs");
const path = require("node:path");
const Ajv = require("ajv/dist/2020");
const addFormats = require("ajv-formats");

const ROOT = path.resolve(__dirname, "..");
const SCHEMA = JSON.parse(fs.readFileSync(path.join(ROOT, "schema/term.schema.json"), "utf8"));

const RESERVED = new Set([
  "schema", "scripts", "node_modules", ".github", ".git", ".claude",
  "assets", "vendor",
]);

const isTermDir = (name) => {
  if (RESERVED.has(name)) return false;
  if (name.startsWith(".")) return false;
  if (!/^[A-Za-z][A-Za-z0-9_-]*$/.test(name)) return false;
  return fs.existsSync(path.join(ROOT, name, "index.json"));
};

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
const validate = ajv.compile(SCHEMA);

const names = fs.readdirSync(ROOT, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name)
  .filter(isTermDir)
  .sort();

const known = new Set(names);

// Every urn:solid:<Name> mentioned anywhere in a term file must be a registered term
// (urn:solid:vocab/ is the meta-predicate namespace, not a term).
const danglingRefs = (term) => {
  const refs = JSON.stringify(term).matchAll(/urn:solid:([A-Za-z][A-Za-z0-9_-]*)/g);
  return [...new Set([...refs].map(m => m[1]))].filter(n => n !== "vocab" && !known.has(n));
};

let failed = 0;
let ok = 0;

for (const name of names) {
  const p = path.join(ROOT, name, "index.json");
  const term = JSON.parse(fs.readFileSync(p, "utf8"));

  const dangling = danglingRefs(term);
  if (!validate(term) || dangling.length) {
    failed++;
    console.error(`[validate] FAIL ${p}`);
    for (const err of validate.errors || []) {
      console.error(`  ${err.instancePath || "/"} ${err.message}`);
    }
    for (const n of dangling) console.error(`  unknown term urn:solid:${n}`);
  } else {
    ok++;
  }
}

console.log(`[validate] ${ok} ok, ${failed} failed`);
process.exit(failed ? 1 : 0);
