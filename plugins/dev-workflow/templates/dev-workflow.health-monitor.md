---
language: ru
mainBranch: main
protectedBranches: [main]
branchTypes:
  code: [feat, fix]
  chore: [chore, docs]
plansDir: docs/plans
roadmapFile: docs/plans/next-update.md
doneLogFile: docs/specifications/Health_Monitor_plan.md
backlogFile: docs/specifications/Health_Monitor_BACKLOG.md
checkCommands: [npm run lint, npm run typecheck]
uiPaths: ["app/components/**", "app/pages/**", "app/layouts/**", "app/assets/**", "**/*.vue"]
devServer:
  command: npm run dev
  port: 3030
viewportWidths: [390, 641, 900, 1001, 1280]
codeReviewLevel: medium
---

# Project notes for dev-workflow

- Rendering: Nuxt 4 SPA (`ssr: false`), data lives in IndexedDB. Pages render client-side:
  after navigation, wait until the target element exists before measuring.
- Styling: custom `.health-*` classes and CSS tokens on `:root` in `app/assets/css/main.css`.
  Read the relevant components and `main.css` to find selectors, tokens and breakpoints.
- Themes: the dark theme overrides tokens in `:root.dark` (class `dark` on `<html>`, toggled by
  `ThemeToggle.vue`, stored in localStorage key `nuxt-color-mode`). First visit follows the OS theme.
- Look for leftover hardcoded white backgrounds in the dark theme.
- Check the quick entry modal and native inputs (`datetime-local`, `number`, `select`) when a change touches them.
