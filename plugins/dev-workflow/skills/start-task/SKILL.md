---
name: start-task
description: Starts a new feature, bug fix or improvement before any code is written. Use when the user asks to build, add, change or fix something — clarifies requirements, creates the task branch, writes the plan (a plan file, plus optional roadmap and done-log items), then waits for plan approval.
---

When the user asks for new work:

0. Read the project config `.claude/dev-workflow.md` (YAML frontmatter plus project notes). If it does not exist, stop: offer to create it from [the config template](../../templates/dev-workflow.md) (paths are relative to this skill's directory), filled in from what the project shows (package scripts, docs layout, dev server), and continue only after the user confirms it. Below, `config.<field>` means a field of this config.
   - Write every question, report and plan in `config.language`. Code and code comments stay in English unless the project says otherwise.
   - `config.roadmapFile`, `config.doneLogFile` and `config.backlogFile` are optional: when one is empty or missing, skip only the sub-steps and questions that read or change that file; the rest of every step still runs.
   - The hook lets you create or edit `.claude/dev-workflow.md` on a protected branch; other files wait for the task branch.
1. Decide the task type from `config.branchTypes`: a `code` type (app behaviour changes, e.g. `feat` / `fix`) or a `chore` type (tooling, docs, config, e.g. `chore` / `docs`).
2. Clarify requirements with `AskUserQuestion`. In the same call:
   - ask to confirm a proposed branch name: `<type>/<short-kebab-name>`;
   - for a `code` type, if it is not obvious, ask which step of `config.roadmapFile` and which stage of `config.doneLogFile` the item belongs to.
3. If the working tree has uncommitted changes, stop and ask what to do with them. Then:
   - switch to `config.mainBranch`;
   - update it with `git fetch` and then `git merge --ff-only '@{u}'` (keep the quotes: PowerShell parses a bare `@{u}` as a hashtable). Do not use `git pull`: it follows the user's `pull.*` settings and fails with `pull.rebase` on a dirty tree;
   - create the confirmed branch from it. Never reuse a merged or unrelated branch.

   If any of these commands fails, stop and report its output; do not stash, reset or rebase on your own.
4. Check `config.backlogFile` for an item that matches or overlaps the task. If one is found, the plan names it and the action for it (delete / narrow / mark as partly done): for a `code` type as a `- [ ]` step in the plan task that changes the docs (add such a task if there is none), for a `chore` type in the chat plan.
5. Write the plan:
   - **`code` type:**
     - create `<config.plansDir>/<short-name>-plan.md` from [plan-template.md](plan-template.md), in `config.language` (translate the template's headings and fixed wording too), with tasks broken into the smallest concrete steps;
     - add an unchecked item to the chosen step in `config.roadmapFile`, with a link to the plan;
     - add an unchecked item to the chosen stage in `config.doneLogFile`.
   - **`chore` type:** write a short plan in the chat (steps, files, what is not covered), ending with finish-task: code review and, if UI is touched (`config.uiPaths`), a browser check with the scenarios to cover. Create no plan files. Exception: if the implementation is postponed to another session, save the plan to `<config.plansDir>/<short-name>-plan.md` from [plan-template.md](plan-template.md), without roadmap and done-log items: delete the template lines about these two files (in Task 0 and in the final task). If an approved chat plan is postponed later, save it to the file at that moment, with its approval status.
   - Delete template lines for optional files the config does not set.
   - Every task that changes `CLAUDE.md` or project docs has a `**Why:**` line with one sentence on why the change is needed.
   - Every risky task (app logic, data, hooks, or other risky changes) is marked `**Stop:** yes`, in chat plans too; execution stops after it for the user's confirmation.
6. Report to the user and stop. List any open proposals that need an explicit answer.
7. After the user approves, set the plan status to `✅ Approved by the user <YYYY-MM-DD>` (plans saved to a file only).

Do not write code before the plan is approved. Do not commit or push.
