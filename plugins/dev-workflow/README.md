# dev-workflow

A plan-first development workflow for Claude Code: every task starts with clarified
requirements, a dedicated branch and an approved plan, and ends with checks, a code review,
a browser check for UI changes and an updated plan.

## What's inside

| Component | Name in Claude Code | What it does |
| --- | --- | --- |
| Skill | `dev-workflow:start-task` | Clarifies requirements, creates the task branch, writes the plan (plan file, optional roadmap and done-log items) and waits for approval. |
| Skill | `dev-workflow:finish-task` | Runs the check commands, a code review and (for UI changes) a browser check, then marks the plan, done-log and roadmap items. |
| Skill | `dev-workflow:pr-description` | Writes a PR description from the branch diff and creates the PR with `gh`. |
| Agent | `dev-workflow:browser-checker` | Checks the running app in a real browser via Playwright MCP: widths, light/dark theme, overflow, console errors. Never edits code. |
| Hook | `PreToolUse` on `Edit\|Write\|NotebookEdit` | Blocks edits to project files that git does not ignore (including new files) while a protected branch (default `main`, `master`) is checked out. |

## Install

```text
/plugin marketplace add nickburdo/claude-plugins
/plugin install dev-workflow@nickburdo-plugins
```

To enable it for everyone working on a repository, add to the project's `.claude/settings.json`:

```json
{
  "extraKnownMarketplaces": {
    "nickburdo-plugins": {
      "source": { "source": "github", "repo": "nickburdo/claude-plugins" }
    }
  },
  "enabledPlugins": {
    "dev-workflow@nickburdo-plugins": true
  }
}
```

Note: the hook runs in every project where the plugin is enabled.

## Project config

The skills and the agent read `.claude/dev-workflow.md` in the project (commit it). If it is
missing, the skills offer to create it from [templates/dev-workflow.md](templates/dev-workflow.md)
and stop until it exists; the hook falls back to protecting `main` and `master`.

The YAML frontmatter holds the settings; the Markdown body holds free-form project notes
for the browser-checker agent (rendering, styling, themes, components worth checking).

| Field | Meaning |
| --- | --- |
| `language` | Language of questions, reports, plans and docs written by the workflow. |
| `mainBranch` | Branch that task branches start from and PRs target. |
| `protectedBranches` | Branches where the hook blocks edits. Default `[main, master]`. |
| `branchTypes` | `code` types (get a plan file) and `chore` types (get a chat plan). |
| `plansDir` | Folder for plan files. |
| `roadmapFile` | Optional roadmap with per-step checklists. |
| `doneLogFile` | Optional stage plan with a done-log. |
| `backlogFile` | Optional backlog of postponed items. |
| `checkCommands` | Commands that must pass before a task is closed. |
| `uiPaths` | Globs of files whose changes need a browser check. |
| `devServer` | `command` and `port` of the dev server for the browser check. |
| `viewportWidths` | Widths (px) the browser check always covers. |
| `codeReviewLevel` | Level passed to the `code-review` skill. |
| `commitMode` | When the workflow commits: `manual` (default; never, the user commits after finish-task), `per-step` (after each plan task) or `at-end` (one commit at the end of finish-task). The skills never push or create PRs. If the project's own instructions set a different commit policy, start-task asks which one the task follows and writes it into the plan. |

A complete real-world example: [templates/dev-workflow.health-monitor.md](templates/dev-workflow.health-monitor.md).

## Requirements

- Node.js on `PATH` (the hook is a Node script) and git.
- [Playwright MCP](https://github.com/microsoft/playwright-mcp) configured as the `playwright` server, for the browser-checker agent.
- The `code-review` skill, used by finish-task.
- The GitHub CLI (`gh`), used by pr-description to create PRs.
- Optional: the [superpowers](https://github.com/obra/superpowers) plugin; plans refer to its `executing-plans` skill.

## Hook details

The hook allows the edit when:

- the file is outside the project directory (memory, scratchpad, `~/.claude`);
- the file is the config `.claude/dev-workflow.md` itself (start-task creates it before any task branch exists);
- the project is not a git repository;
- the current branch is not protected, or HEAD is detached;
- the file is ignored by git.

Any other file, tracked or new, is blocked on a protected branch: the hook exits with code 2
and asks Claude to create a task branch first. If git fails for another reason (for example,
git is not on `PATH`), the hook prints a warning and allows the edit. For an urgent
edit on a protected branch, disable the plugin temporarily (`/plugin`).
