---
name: pr-description
description: Writes pull request descriptions. Use when creating a PR, writing a PR, or when the user asks to summarize changes for a pull request.
---

When writing a PR description:

0. Take the base branch from `mainBranch` in `.claude/dev-workflow.md`; without the config, use the repository's default branch (`git symbolic-ref --short refs/remotes/origin/HEAD`, minus the `origin/` prefix). If `origin/HEAD` is not set, use `main` when that branch exists, otherwise ask the user. Below it is called `<base>`.
1. Run `git status`. If there are uncommitted changes, they are not part of `<base>...HEAD`: commit them first if the user asked for a commit, otherwise stop and ask.
2. Run `git diff <base>...HEAD` to see all changes on this branch.
3. Write the description in English, following this format:

## What
One sentence explaining what this PR does.

## Why
Brief context on why this change is needed

## Changes
- Bullet points of specific changes made
- Group related changes together
- Mention any files deleted or renamed

## Verification
- Checks that were run (check commands, code review, browser check) and their result
- Say plainly what was not verified, e.g. changes made after the last browser check

4. Title: the commit subject for a single-commit branch, otherwise a short imperative summary of the whole branch.
5. To create the PR, push the branch, save the description to a file in the scratchpad directory and run `gh pr create --base <base> --title "<title>" --body-file <file>`. End the description with the attribution line the session requires, if any.
