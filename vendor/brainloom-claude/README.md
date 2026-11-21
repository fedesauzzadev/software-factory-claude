# brainloom-claude

Lightweight brainloom for Claude Code, built to **spend fewer tokens**: persistent memory in plain markdown, size-based routing, and subagents only when they pay for themselves.

## Install (once)

```bash
node install.mjs          # agents + skill into ~/.claude (aborts on collisions, --force to overwrite)
node init.mjs <project>   # per project: brain/ + CLAUDE.md, zero LLM tokens
node scripts/validate-brain.mjs <project>   # optional structure check
```

## How it saves tokens

| Mechanism | Effect |
|---|---|
| Refined tasks skip the brain entirely | no index/node reads for "change X in file Y" |
| `brain/index.md` + pointers | no re-exploring the project each session |
| `scout` on Haiku | big reads happen outside the main context |
| `verifier` (Sonnet) / `planner` (Opus) only for L or risky work | no subagent for S/M |
| `init.mjs` is a script | onboarding costs nothing |
| Short, stable `CLAUDE.md` | cheap prefix, stays cached |

## Recommended model setup

Main session on **Sonnet**; the agents pin their own model in their frontmatter (`scout` haiku, `verifier` sonnet, `planner` opus). Move the main session up only for hard problems, and back down after.

## Layout

```
agents/      scout, verifier, planner (Claude Code subagents)
skills/      brainloom (M flow + close)
templates/   CLAUDE.md and brain/ copied into projects
scripts/     validate-brain.mjs (from the original brainloom kit)
```

Derived from the original brainloom kit; the heavy parts (mandatory verifier per node, refuter, fuzzing on every task, update plugin) are now opt-in.

## Third-party

`templates/CLAUDE.md` embeds the compact ruleset from [ponytail](https://github.com/DietrichGebert/ponytail) (MIT, (c) its author): write the smallest complete change, reuse before adding. Only the prompt text is used. Its plugin (session hooks, status band, local board) is not installed; add it yourself with `/plugin marketplace add DietrichGebert/ponytail` if you want those extras.
