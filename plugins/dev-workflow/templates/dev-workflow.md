---
# Language for questions, reports, plans and docs written by the dev-workflow skills and agents.
language: en
# Branch that new task branches start from and that PRs target.
mainBranch: main
# Branches where the hook blocks Edit/Write/NotebookEdit on project files that git does not ignore (including new files).
protectedBranches: [main, master]
# Branch / task types. "code" types change app behaviour and get a plan file;
# "chore" types (tooling, docs, config) get a chat plan unless postponed.
branchTypes:
  code: [feat, fix]
  chore: [chore, docs]
# Folder for plan files, one per task.
plansDir: docs/plans
# Optional. Roadmap file with per-step checklists; omit to skip roadmap updates.
roadmapFile:
# Optional. Stage plan with a done-log of finished items; omit to skip done-log updates.
doneLogFile:
# Optional. Backlog of postponed items; omit to skip backlog checks.
backlogFile:
# Commands that must pass before a task is closed.
checkCommands: [npm run lint, npm run typecheck]
# Globs of files whose changes need a browser check; leave empty to never run one.
uiPaths: ["src/**/*.vue", "src/**/*.css"]
# Dev server used by the browser-checker agent.
devServer:
  command: npm run dev
  port: 3000
# Viewport widths (px) the browser-checker agent always checks.
viewportWidths: [390, 768, 1024, 1280]
# Level passed to the code-review skill from finish-task (low | medium | high | xhigh | max).
codeReviewLevel: medium
---

# Project notes for dev-workflow

Free-form notes that the skills and the browser-checker agent read. Describe what is
not obvious from the code, for example:

- Rendering: client-only SPA / SSR, where data lives, how to wait for a page to render.
- Styling: where CSS lives, class naming, CSS custom properties, breakpoints.
- Themes: how the dark theme is switched (class on `<html>`, toggle component,
  localStorage key) and how the first visit picks a theme.
- Components and states worth checking after UI changes (modals, native inputs).
