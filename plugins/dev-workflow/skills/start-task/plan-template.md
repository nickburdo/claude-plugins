<!-- Write the plan in the project's config.language: translate the headings and fixed wording below too. -->
# <Task name> — implementation plan

> **Status:** ⏳ Awaiting user approval.
>
> **For executing agents:** use superpowers:executing-plans (if available) to carry out the plan task by task. Steps use checkbox syntax (`- [ ]`). **No TDD**: automated tests are not written unless explicitly requested. Code review and the browser check (if UI is touched) are done by the finish-task skill in the last task.
>
> **Stops (mandatory):** tasks run back to back. Stop, report briefly and wait for explicit user confirmation only: (1) after a task marked `**Stop:** yes` (app logic, data, hooks and other risky changes); (2) on a deviation from the plan or an open question — before continuing; (3) before an irreversible step (deletion; a commit too, unless the commit policy below makes it). With `manual` commits, finish-task stops before the commit.
>
> **Commits:** <one of: `manual` — no commits, the user commits after finish-task / `per-step` — one commit after each task: Task 0 once the plan is approved; a task marked `**Stop:** yes` only after the user confirms it, with any rework in the same commit; the last task gets no commit of its own, finish-task makes the final one / `at-end` — one commit at the end of finish-task>. Commit messages: <the project's rules, or `<type>: <short summary>` with the branch type>. Never amend, reset or squash existing commits. Never push or create a PR.

**Goal:** <one or two sentences: what the user gets>

**Architecture:** <where the logic lives, which modules and components change and why>

**Tech:** <libraries and APIs used; "No new dependencies" if so>

## User decisions

- **<Topic>:** <the user's answer from the clarifying questions>.
- **Branch:** `<type>/<name>` from an up-to-date `<config.mainBranch>`.

## Open proposals (approved together with the plan)

1. **<Proposal>:** <what and why; technical details the user may object to>.

---

### Task 0: Branch and documentation

- [x] Create branch `<type>/<name>` from an up-to-date `<config.mainBranch>`.
- [x] Create this plan file.
- [x] Add a `[ ]` item to `<config.roadmapFile>`. <!-- only if config.roadmapFile is set -->
- [x] Add a `[ ]` item to `<config.doneLogFile>` (<stage>). <!-- only if config.doneLogFile is set -->
- (If any) Backlog item "<item>": <delete / narrow / mark as partly done> — a `- [ ]` step in the task that changes the docs.

### Task 1: <Name>

**Stop:** yes <!-- only for tasks with app logic, data, hooks or other risky changes; otherwise omit the line -->
**Files:** Create: `<path>`. Modify: `<path>`
**Why:** <one sentence> <!-- required for tasks that change CLAUDE.md or project docs -->

- [ ] <Small concrete step.>
- [ ] <Small concrete step.>
- [ ] <Delete / narrow / mark as partly done> the backlog item "<item>" in `<config.backlogFile>`. <!-- only in the task that changes the docs, when a backlog item was found -->


### Task N: Verification and wrap-up

Done by the finish-task skill once, after all plan tasks.

- [ ] Check commands: <config.checkCommands>.
- [ ] Code review of the branch changes (separate subagent); go through the findings with the user: fix, backlog or reject.
- [ ] Browser check by the browser-checker agent (only if UI is touched) — scope: <one of: `full` (scenarios: <scenarios, narrow screen, both themes>) / `short` (scenarios: <scenarios, with widths and themes if they matter>) / `none` (reason: <why no browser check is needed>)>. <!-- leave the scope out if the user was not asked; `none` only from the user's answer; mark each scenario that changes app data as `changes data: <what>` -->
- [ ] Mark completion in `<config.doneLogFile>` and `<config.roadmapFile>`. <!-- only for the files config sets -->
