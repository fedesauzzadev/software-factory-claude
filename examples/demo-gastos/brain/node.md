---
id: N-0001
title: (one line, imperative)
type: feature        # feature | fix | refactor | chore | spike
size: M              # S | M | L
status: planned      # planned | in-progress | implemented | verified | shipped | superseded
slice:
depends_on: []
affects: []
contracts_touched: []
code: []             # pointers, not copies: ["src/app.js -> greet"]
decisions: []
acceptance_criteria: []   # observable behavior, written BEFORE coding
verify: []           # exact commands to re-verify this node
verification:
  level: ""          # full = tests + functional run | smoke = structure only (specs/config)
  tests: ""
  functional: ""
  evidence: ""       # short inline result, or a path under brain/evidence/
date: YYYY-MM-DD
---

## Context
(Why this exists. Max 5 lines. Body under 40 lines.)
