# Workflow Guidance

## Default record of work
- Prefer GitHub issues for task records, acceptance criteria, implementation notes, and progress updates.
- Link code changes to an issue when possible. For this workflow redesign, use issue #30 as the parent record unless a narrower issue exists.
- Prefer finishing work as a PR, not as an untracked local change set.

## When to use local markdown plans
- Use local markdown plans only for larger architectural work that does not fit cleanly in a single GitHub issue.
- Keep local plans scoped to design/architecture. Day-to-day task tracking should stay in GitHub.
- If a local plan exists, link it back to the relevant GitHub issue or PR.

## Working modes

### Interactive mode
Use this for normal request/response work with a human reviewing changes live.
- Confirm assumptions before non-trivial changes.
- Keep changes surgical and easy to review.
- Record acceptance criteria and progress in the linked GitHub issue or PR.

### Ralph-loop mode
Use this for tighter autonomous iteration loops when the task has already been framed.
- Start from a clear issue or other written task record.
- Keep each loop pointed at a concrete success condition.
- Post meaningful progress back to GitHub so the loop does not become local-only state.
- Escalate back to interactive mode when requirements are unclear or conflicting.

## Verification expectations
- Backend-only changes: use the smallest targeted CLI verification that proves the change works.
- UI-affecting changes: run Playwright flows that cover the changed behavior.
- For UI work, save screenshots and note:
  - what was tested
  - which flow was exercised
  - where screenshots were saved
- Verification notes belong in the PR and, when useful, in the linked issue.

## GitHub-first execution
- Prefer GitHub MCP for issue, PR, review, comment, and status operations when available.
- Keep issue and PR threads as the primary collaboration log.
- Prefer reviewable PR-sized slices of work over large local batches.
- When a task is complete, leave the repo in a PR-ready state with clear verification notes.


## Failure Modes to Avoid

1. Making wrong assumptions without checking
2. Not managing your own confusion
3. Not seeking clarifications when needed
4. Not surfacing inconsistencies you notice
5. Not presenting tradeoffs on non-obvious decisions
6. Not pushing back when you should
7. Being sycophantic ("Of course!" to bad ideas)
8. Overcomplicating code and APIs
9. Bloating abstractions unnecessarily
10. Not cleaning up dead code after refactors
11. Modifying comments/code orthogonal to the task
12. Removing things you don't fully understand


## Output Standards

### Code Quality
- No bloated abstractions
- No premature generalization
- No clever tricks without comments explaining why
- Consistent style with existing codebase
- Meaningful variable names (no `temp`, `data`, `result` without context)

### Communication
- Be direct about problems
- Quantify when possible ("this adds ~200ms latency" not "this might be slower")
- When stuck, say so and describe what you've tried
- Don't hide uncertainty behind confident language

### Change Description
After any modification, summarize:
```
CHANGES MADE:
- [file]: [what changed and why]

THINGS I DIDN'T TOUCH:
- [file]: [intentionally left alone because...]

POTENTIAL CONCERNS:
- [any risks or things to verify]
```