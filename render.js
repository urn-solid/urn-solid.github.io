(() => {
  const root = document.getElementById("term");
  if (!root) return;

  const dataTag = document.querySelector('script[type="application/ld+json"]');
  if (!dataTag) return;

  let term;
  try { term = JSON.parse(dataTag.textContent); }
  catch (e) { root.textContent = "Malformed JSON-LD."; return; }

  const el = (tag, attrs = {}, children = []) => {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === "class") n.className = v;
      else if (k === "html") n.innerHTML = v;
      else n.setAttribute(k, v);
    }
    for (const c of [].concat(children)) {
      if (c == null) continue;
      n.append(typeof c === "string" ? document.createTextNode(c) : c);
    }
    return n;
  };

  const termPath = (urn) => "/" + urn.replace(/^urn:solid:/, "") + "/";
  const isSolidTerm = (s) => typeof s === "string" && s.startsWith("urn:solid:");

  const linkFor = (uri) => {
    if (isSolidTerm(uri)) {
      return el("a", { href: termPath(uri), class: "urn", "data-urn": uri }, uri);
    }
    return el("a", { href: uri, rel: "external noopener" }, uri);
  };

  const list = (items) => el("ul", {}, items.map(it => el("li", {}, [linkFor(it)])));

  const section = (title, body) => body == null
    ? null
    : el("section", {}, [el("h2", {}, title), body]);

  // Title block
  root.append(el("div", { class: "hero" }, [
    el("div", { class: "urn-id" }, term["@id"]),
    el("h1", {}, term["rdfs:label"]),
    el("div", { class: "kind" }, term["@type"]),
    term.status ? el("span", { class: "status status-" + term.status }, term.status) : null,
  ]));

  root.append(el("p", { class: "comment" }, term["rdfs:comment"]));

  // Canonical mapping
  if (term["owl:sameAs"]) {
    root.append(section("Canonical mapping",
      el("p", {}, [el("code", {}, "owl:sameAs"), " ", linkFor(term["owl:sameAs"])])
    ));
  }

  // Related
  if (Array.isArray(term["rdfs:seeAlso"]) && term["rdfs:seeAlso"].length) {
    root.append(section("Related", list(term["rdfs:seeAlso"])));
  }

  // Domain / range
  const dr = [];
  if (term["rdfs:domain"]) dr.push(el("li", {}, [el("strong", {}, "domain: "), linkFor(term["rdfs:domain"])]));
  if (term["rdfs:range"]) dr.push(el("li", {}, [el("strong", {}, "range: "), linkFor(term["rdfs:range"])]));
  if (dr.length) root.append(section("Domain / range", el("ul", {}, dr)));

  // Disambiguation
  if (Array.isArray(term.notToBeConfusedWith) && term.notToBeConfusedWith.length) {
    root.append(section("Not to be confused with", list(term.notToBeConfusedWith)));
  }

  // Notes (plain text, newline preserving)
  if (term.notes) {
    root.append(section("Notes", el("p", { class: "notes" }, term.notes)));
  }

  // Examples
  if (Array.isArray(term.examples) && term.examples.length) {
    const blocks = term.examples.map(ex => el("figure", {}, [
      el("figcaption", {}, ex.title || "Example"),
      el("pre", {}, el("code", {}, JSON.stringify(ex.jsonld, null, 2))),
    ]));
    root.append(section("Examples", el("div", {}, blocks)));
  }

  // History
  if (Array.isArray(term.history) && term.history.length) {
    const items = term.history.map(h => el("li", {}, [
      el("time", { datetime: h.at }, h.at.slice(0, 10)),
      " — ",
      el("strong", {}, h.event),
      h.note ? " — " + h.note : "",
      h.by ? " (" + h.by + ")" : "",
    ]));
    root.append(section("History", el("ul", { class: "history" }, items)));
  }

  // Provenance
  if (term.provenance) {
    const parts = [];
    if (term.provenance.curatedBy) parts.push(el("p", {}, "Curated by " + term.provenance.curatedBy));
    if (Array.isArray(term.provenance.sources) && term.provenance.sources.length) {
      parts.push(el("p", {}, "Sources:"));
      parts.push(list(term.provenance.sources));
    }
    if (parts.length) root.append(section("Provenance", el("div", {}, parts)));
  }

  // Raw JSON-LD
  root.append(section("Raw JSON-LD",
    el("pre", { class: "raw" }, el("code", {}, JSON.stringify(term, null, 2)))
  ));

  // Hover enrichment for urn:solid links, using /index.json (fetched once)
  let indexPromise;
  const loadIndex = () => indexPromise ||= fetch("/index.json").then(r => r.ok ? r.json() : {}).catch(() => ({}));

  document.addEventListener("mouseover", async (ev) => {
    const a = ev.target.closest("a.urn[data-urn]");
    if (!a || a.dataset.hydrated) return;
    a.dataset.hydrated = "pending";
    const idx = await loadIndex();
    const entry = idx[a.dataset.urn];
    if (entry) {
      a.title = entry.label + " — " + entry.description;
      a.dataset.hydrated = "done";
    }
  });
})();
