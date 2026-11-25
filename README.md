# The POTIFY Chronicles

[Complete repository directory tree](docs/DIRECTORY.md)

**Public Book I excerpt edition.** Give readers a clean, shareable entry to the story behind POTIFY.

### Setup and usage

Use Node.js 24 for the included checks. Use Python 3 for the local static preview.

```sh
python3 -m http.server 8000 --bind 127.0.0.1 --directory public
```

Read the opening pages. Open http://127.0.0.1:8000/ in a browser. 

### Developer entry points

The reader extracts the published opening pages from the First Cycle frontend, retaining their order and the link to the complete reading destination. Explore `public/`, `tests/` in the full tree.

### Verification

The public entry page returned HTTP 200 and rendered local content in Chromium at a 390 × 844 viewport.

```sh
node --test tests/project.test.mjs
```

### Release scope

This edition contains the public opening. Unreleased Book II and branching manuscripts stay with their author. potify-first-cycle at `7bc29685d6decd1f3d1bbbb0216f837bc7701a51`. Verbatim public reading article from the First Cycle edition, with outbound reading links adapted.

[Technical whitepaper](docs/WHITEPAPER.md) · [Marketing and sales plan](docs/MARKETING.md) · [Dated developer log](docs/BUILD-LOG.md)

Existing asset and code terms remain applicable. Public access to a recording, illustration, brand or manuscript does not itself grant commercial reuse rights.
