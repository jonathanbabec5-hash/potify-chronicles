# The POTIFY Chronicles

[Complete repository directory tree](docs/DIRECTORY.md)

**Original Book I text, reader source and offline edition.** Give readers a clean, shareable entry to the story behind POTIFY.

### Setup and usage

Use Node.js 24 for the included checks. Use Python 3 for the local static preview.

```sh
python3 -m http.server 8000 --bind 127.0.0.1 --directory public
```

Read the opening pages. Open http://127.0.0.1:8000/ in a browser. 

### Developer entry points

The public sampler opens the website’s Book I source as an offline edition, preserving section identifiers and paragraph order. The original React reader component is retained as implementation reference. Explore `public/`, `reference/`, `src/`, `tests/` in the full tree.

### Verification

The reader includes the full website Book I material from the original source, with a test matching the offline section anchors to the canonical text.

```sh
node --test tests/project.test.mjs
node --test tests/book.test.mjs
```

### Release scope

The public Book I website text, including Chapters I–V, is included. Unreleased Book II and private branching manuscripts remain outside the edition. potify-first-cycle at `7bc29685d6decd1f3d1bbbb0216f837bc7701a51`. Verbatim public reading article from the First Cycle edition, with outbound reading links adapted. Authenticated potify-website main b40b28683e548a04619f1e018814dd91aec1256d provided the original Chronicle sections and reader component. The offline book is derived from those exact sections.

[Technical whitepaper](docs/WHITEPAPER.md) · [Marketing and sales plan](docs/MARKETING.md) · [Dated developer log](docs/BUILD-LOG.md)

Existing asset and code terms remain applicable. Public access to a recording, illustration, brand or manuscript does not itself grant commercial reuse rights.
