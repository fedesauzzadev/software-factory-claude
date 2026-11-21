---
name: brainloom
description: Build an M-sized feature or close L-sized work with memory - criteria first in a node, thin vertical build, real verification, brain update. Use for a new feature/slice in a project that has brain/.
---

# brainloom (M flow + close)

## 1. Node first
- Copy `brain/node.md` template as the next free `brain/nodes/N-XXXX.md` (check the folder). Fill `acceptance_criteria` as observable behavior BEFORE any code. Body under 40 lines.
- Add one row to `brain/index.md`. Check `brain/conventions.md` for what already exists; reuse it.
- More than one node, or a new architecture? Walking skeleton first: the thinnest end-to-end path, with explicit extension points instead of options "for later".

## 2. Build thin
- Minimum that satisfies the criteria across ALL layers. No drive-by refactors, no speculative flexibility.
- Stop and report if the diff passes `limits` in `brain/config.yaml`, or if a shared contract used by other slices must change (that is L: plan + approval first).

## 3. Verify for real
- Run `commands.test`; then run the thing (`commands.run` or directly) once per criterion.
- Code that parses external input: add a seeded property/fuzz check (empty, huge, malformed, hostile unicode); keep the seed. Skip and say so if there is no input surface.
- L-size or high risk: spawn `verifier` ONCE with all the nodes' criteria. Otherwise verify yourself.
- Failure → the node stays `implemented`; fix and re-run.

## 4. Close (no node update → not done)
- `verification`: tests result, functional result, `level`, evidence (one inline line is enough). Write the exact commands in `verify:` the first time.
- `status`: `implemented` until evidence exists, then `verified`. `shipped` only after the user commits/deploys.
- Fill `code:` pointers (`path -> symbol`), refresh the index row, add a decision in `brain/decisions/` for any non-obvious assumption, add to `conventions.md` if a pattern repeated.
- Final report: what was built, evidence, assumptions, next step. Short.
