---
name: finish-task
description: Wraps up a finished feature, fix or chore once the whole approved plan is implemented. Use when the user says the work is done or before preparing a PR — runs the project's check commands, a code review and (for UI changes) a browser check, then marks the plan and the optional done-log and roadmap items as done.
---

Run this once, after every task of the approved plan is implemented (not after each task).

0. Read the project config `.claude/dev-workflow.md`. If it does not exist, stop and offer to create it with the start-task skill's step 0. Below, `config.<field>` means a field of this config. Report in `config.language`. `config.roadmapFile`, `config.doneLogFile` and `config.backlogFile` are optional: when one is empty or missing, skip only the sub-steps that read or change that file (or use the fallback given there); the rest of every step still runs. The commit policy is the plan's `**Commits:**` line (in the plan file, or in the chat plan for a `chore` type without one). Without such a line, use `config.commitMode` (`manual` when empty or missing); if the project's instructions (for example `CLAUDE.md`) set a commit policy that contradicts it, ask which one to follow.
1. Run every command in `config.checkCommands`, all of them even after a failure. Then sort each failure as new or probably pre-existing (already failing on `config.mainBranch`):
   - take the files named in its output and the files changed on the branch (`git diff --name-only <config.mainBranch>...HEAD` plus uncommitted and untracked files); before comparing, bring both lists to paths relative to the repository root (output may use absolute paths, paths relative to a subfolder, `./` or backslashes);
   - if any failing file is changed on the branch, the failure is new, even if the file also has older errors;
   - if none is, the failure is probably pre-existing;
   - if the output names no files, the user decides.

   If any failure is new, report the output and stop; do not fix code that the plan does not cover. Otherwise ask once with `AskUserQuestion` about all the remaining failures, with their output. Warn that a failure in an unchanged file can still come from the branch's changes (for example a test or a caller of changed code), and name such a link if you see one. Answers: continue — the failures are accepted as pre-existing; or stop. Remember each accepted failure (command and failing files): it is a backlog candidate in step 3 and goes into the report.
2. Run the checks below in parallel, each in its own subagent so their output stays out of the main context:
   - **Code review:** the `code-review` skill at level `config.codeReviewLevel` in a `general-purpose` subagent, on the branch changes (`<config.mainBranch>...HEAD` plus uncommitted changes). The subagent changes no files and returns only verified findings, each with its location, failure scenario and severity. Tell it the commit policy: commits on the branch made under it are expected and are not findings. Issues that already exist on `config.mainBranch` (not introduced by the branch) are not findings either: it returns them as a separate "Pre-existing" list, verified the same way (location, failure scenario, severity).
   - **Browser check, only if the changes touch a file matching `config.uiPaths`** (skip it when `config.uiPaths` is empty): the `dev-workflow:browser-checker` agent, with the scenarios from the plan's browser-check item (for a `chore` type: from the plan file if there is one, otherwise from the plan in the chat). Pass them as an addition to the agent's standard check, not as a replacement for it. It reuses a dev server already listening on `config.devServer.port` and never starts a second one; it stops only a server it started itself and deletes `.playwright-mcp/`. If it started a server, confirm in the report that it is stopped.
3. If there are no findings and no backlog candidates (the "Pre-existing" list from step 2 and the failures accepted as pre-existing in step 1), go to step 4. Otherwise report them and stop for the user's decision:
   - each finding with a recommendation: fix now, move to the backlog, or reject (with the reason);
   - each backlog candidate: add to the backlog or reject. Skip candidates that are already in `config.backlogFile` or that the user already rejected for this task.

   Then, for the findings to fix:
   - fixes are a plan revision: add them to the plan as a new task (for a `chore` type without a plan file, list them in the chat);
   - before fixing, save the list of findings being fixed and the files each fix touches, and copy those files to the scratchpad as a snapshot; then implement the fixes;
   - rerun `config.checkCommands` with the rules of step 1; a failure already accepted as pre-existing (same command, same failing files) is not asked about again, but a failure whose output names no files always is. Offer failures newly accepted here as backlog candidates right away (add to the backlog or reject). Rerun the browser check if the fixes touch UI;
   - review the fixes: a `low`-level review by hand in a `general-purpose` subagent, with the same rules as in step 2 but without a "Pre-existing" list, scoped to the saved list of fixes: `git diff --no-index` of each file against its snapshot (the `code-review` skill reviews the whole branch diff and cannot be scoped to a snapshot). This review runs once: report its findings the same way (fix now, backlog or reject). Fixes made for them still get the check commands and, if they touch UI, the browser check; only the review is not repeated. Name them in the report;
   - with `per-step` commits, commit the fixes as a separate commit once their checks pass.

   Finally, add the findings and candidates accepted for the backlog to `config.backlogFile` (without a backlog file, list them in the report) and continue with step 4.
4. **`code` types only** (see `config.branchTypes`; `chore` types have no done-log items, skip to step 6):
   find the matching item in `config.doneLogFile`:
   - mark it `[x]`;
   - add a short description of what was done under it, in `config.language`, matching the style of neighbouring entries, so it covers the final code including review fixes.
5. **`code` types only:** find the matching item in `config.roadmapFile`:
   - mark it `[x]` and link the plan file from `config.plansDir` if it is not linked yet;
   - if every item of the step is done, mark the step as done in the style the file already uses.
6. **If the task has a plan file** in `config.plansDir` (a `code` type, or a postponed `chore` type): in it, mark the finished checkboxes `[x]`. Leave unchecked any item that was not done and name it in the report.
7. Report to the user: check results, what was marked, and in a separate section the pre-existing issues — check failures accepted as pre-existing and the "Pre-existing" review list — each with what was decided (backlog or rejected). Then follow the commit policy:
   - `manual`: stop; do not commit.
   - `per-step`: commit everything this skill changed that is not committed yet (plan revision and checkboxes, done-log, roadmap, backlog) as a final commit, then stop.
   - `at-end`: stop for the user's confirmation of the report, then make one commit with all the task's changes.

   Commit messages follow the project's rules; without them, `<type>: <short summary>` with the branch type.

If the code changes after the task was closed, run this skill again: update the existing description in `config.doneLogFile` instead of adding a duplicate entry, and mark the new plan checkboxes. With `per-step` or `at-end` commits, the rerun makes one new commit with everything changed since the last commit, at the end of step 7 (for `at-end`, after the user's confirmation); with `per-step`, review fixes from step 3 still get their own commit before it. Never amend, reset or squash existing commits.

Commit only as the commit policy says; never push or create a PR.
