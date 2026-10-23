---
name: finish-task
description: Wraps up a finished feature, fix or chore once the whole approved plan is implemented. Use when the user says the work is done or before preparing a PR — runs the project's check commands, a code review and (for UI changes) a browser check, then marks the plan and the optional done-log and roadmap items as done.
---

Run this once, after every task of the approved plan is implemented (not after each task).

0. Read the project config `.claude/dev-workflow.md`. If it does not exist, stop and offer to create it with the start-task skill's step 0. Below, `config.<field>` means a field of this config. Report in `config.language`. `config.roadmapFile`, `config.doneLogFile` and `config.backlogFile` are optional: when one is empty or missing, skip only the sub-steps that read or change that file (or use the fallback given there); the rest of every step still runs.
1. Run every command in `config.checkCommands`. If any fails, report the output and stop; do not fix code that the plan does not cover.
2. Run the checks below in parallel, each in its own subagent so their output stays out of the main context:
   - **Code review:** the `code-review` skill at level `config.codeReviewLevel` in a `general-purpose` subagent, on the branch changes (`<config.mainBranch>...HEAD` plus uncommitted changes). The subagent changes no files and returns only verified findings, each with its location, failure scenario and severity.
   - **Browser check, only if the changes touch a file matching `config.uiPaths`** (skip it when `config.uiPaths` is empty): the `dev-workflow:browser-checker` agent, with the scenarios from the plan's browser-check item (for a `chore` type: from the plan file if there is one, otherwise from the plan in the chat). Pass them as an addition to the agent's standard check, not as a replacement for it. It reuses a dev server already listening on `config.devServer.port` and never starts a second one; it stops only a server it started itself and deletes `.playwright-mcp/`. If it started a server, confirm in the report that it is stopped.
3. If there are no findings, go to step 4. Otherwise report them, each with a recommendation: fix now, move to the backlog, or reject (with the reason), and stop for the user's decision. Then:
   - fixes are a plan revision: add them to the plan as a new task (for a `chore` type without a plan file, list them in the chat);
   - before fixing, save the list of findings being fixed and the files each fix touches, and copy those files to the scratchpad as a snapshot; then implement the fixes;
   - rerun `config.checkCommands`, and rerun the browser check if the fixes touch UI;
   - review the fixes: a `low`-level review by hand in a `general-purpose` subagent, with the same rules as in step 2, scoped to the saved list of fixes: `git diff --no-index` of each file against its snapshot (the `code-review` skill reviews the whole branch diff and cannot be scoped to a snapshot). This review runs once: report its findings the same way (fix now, backlog or reject). Fixes made for them still get the check commands and, if they touch UI, the browser check; only the review is not repeated. Name them in the report;
   - add backlog items to `config.backlogFile` (without a backlog file, list them in the report);
   - continue with step 4.
4. **`code` types only** (see `config.branchTypes`; `chore` types have no done-log items, skip to step 6):
   find the matching item in `config.doneLogFile`:
   - mark it `[x]`;
   - add a short description of what was done under it, in `config.language`, matching the style of neighbouring entries, so it covers the final code including review fixes.
5. **`code` types only:** find the matching item in `config.roadmapFile`:
   - mark it `[x]` and link the plan file from `config.plansDir` if it is not linked yet;
   - if every item of the step is done, mark the step as done in the style the file already uses.
6. **If the task has a plan file** in `config.plansDir` (a `code` type, or a postponed `chore` type): in it, mark the finished checkboxes `[x]`. Leave unchecked any item that was not done and name it in the report.
7. Report to the user: check results, what was marked. Stop and wait for confirmation before committing.

If the code changes after the task was closed, run this skill again: update the existing description in `config.doneLogFile` instead of adding a duplicate entry, and mark the new plan checkboxes.

Do not commit, push or create a PR.
