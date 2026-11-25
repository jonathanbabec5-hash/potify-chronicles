# November 25, 2026 · The POTIFY Chronicles

**Question.** Give readers a clean, shareable entry to the story behind POTIFY.

**Source and change.** potify-first-cycle at `7bc29685d6decd1f3d1bbbb0216f837bc7701a51`. Verbatim public reading article from the First Cycle edition, with outbound reading links adapted. Authenticated potify-website main b40b28683e548a04619f1e018814dd91aec1256d provided the original Chronicle sections and reader component. The offline book is derived from those exact sections.

**Observed result.** The reader includes the full website Book I material from the original source, with a test matching the offline section anchors to the canonical text.

```sh
node --test tests/project.test.mjs
node --test tests/book.test.mjs
```

**Next acceptance check.** Read the Cultivator’s Note and Introduction offline, then follow the authorized reading destination.

**Owner and decision.** Chance owns the public release and approves campaign copy. The public Book I website text, including Chapters I–V, is included. Unreleased Book II and private branching manuscripts remain outside the edition.

This dated record describes the developer package. Verify remote commit and tree in the publication receipt before announcing a GitHub release.
