// PreToolUse hook: blocks Edit/Write/NotebookEdit on project files while the current branch is protected.
// Protected branches come from `protectedBranches` in .claude/dev-workflow.md (default: main, master).
// Exit 0 lets the tool call proceed; exit 2 blocks it and shows stderr to Claude.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const DEFAULT_PROTECTED_BRANCHES = ['main', 'master'];
const CONFIG_FILE = path.join('.claude', 'dev-workflow.md');

function allowWithWarning(message) {
  process.stderr.write(`dev-workflow hook: ${message}; edit allowed.\n`);
  process.exit(0);
}

function git(cwd, args) {
  // LC_ALL=C keeps git messages in English, so errors can be matched by text.
  return execFileSync('git', ['-C', cwd, ...args], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, LC_ALL: 'C' },
  }).trim();
}

function unquote(value) {
  return value.trim().replace(/^(['"])(.*)\1$/, '$2');
}

// Reads `protectedBranches` from the YAML frontmatter without a YAML dependency.
// Supports a flow list (`[main, release]`, also split over several lines), a block list
// (`- main` lines, indented or not, with blank and comment lines between) and a single value.
function readProtectedBranches(projectDir) {
  const configPath = path.join(projectDir, CONFIG_FILE);
  if (!existsSync(configPath)) {
    return DEFAULT_PROTECTED_BRANCHES;
  }

  const text = readFileSync(configPath, 'utf8').replace(/^﻿/, '');
  const frontmatter = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!frontmatter) {
    return DEFAULT_PROTECTED_BRANCHES;
  }

  const lines = frontmatter[1].split(/\r?\n/).map(line => line.replace(/(^|\s+)#.*$/, ''));
  const index = lines.findIndex(line => /^protectedBranches\s*:/.test(line));
  if (index === -1) {
    return DEFAULT_PROTECTED_BRANCHES;
  }

  let inline = lines[index].replace(/^protectedBranches\s*:/, '').trim();
  if (inline.startsWith('[')) {
    for (let next = index + 1; !inline.includes(']') && next < lines.length; next++) {
      inline += ` ${lines[next].trim()}`;
    }
    return inline.replace(/^\[|\].*$/g, '').split(',').map(unquote).filter(Boolean);
  }
  if (inline) {
    return [unquote(inline)];
  }

  const branches = [];
  for (const line of lines.slice(index + 1)) {
    if (!line.trim()) {
      continue;
    }
    const item = line.match(/^\s*-\s*(.+)$/);
    if (!item) {
      break;
    }
    branches.push(unquote(item[1]));
  }
  return branches.length ? branches : DEFAULT_PROTECTED_BRANCHES;
}

let input;
try {
  input = JSON.parse(readFileSync(0, 'utf8'));
} catch {
  allowWithWarning('could not parse hook input');
}

const filePath = input?.tool_input?.file_path ?? input?.tool_input?.notebook_path;
if (!filePath) {
  allowWithWarning('no file path in tool input');
}

const projectDir = path.resolve(process.env.CLAUDE_PROJECT_DIR || input?.cwd || process.cwd());
const target = path.resolve(projectDir, filePath);
const relative = path.relative(projectDir, target);

// Files outside the project (memory, scratchpad, ~/.claude) are not guarded.
if (relative === '' || relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
  process.exit(0);
}

// The config itself is always editable: start-task creates it before any task branch exists.
const normalize = value => (process.platform === 'win32' ? value.toLowerCase() : value);
if (normalize(relative) === normalize(CONFIG_FILE)) {
  process.exit(0);
}

// Run git from the file's nearest existing folder, so a git worktree inside the project is judged by its own branch.
let gitDir = path.dirname(target);
while (!existsSync(gitDir) && gitDir !== projectDir) {
  gitDir = path.dirname(gitDir);
}

let branch;
try {
  branch = git(gitDir, ['branch', '--show-current']);
} catch (error) {
  // Not a git repository: nothing to protect. Any other failure (e.g. git missing) is reported.
  if (/not a git repository/i.test(String(error.stderr ?? ''))) {
    process.exit(0);
  }
  allowWithWarning('could not read the current git branch');
}

let protectedBranches;
try {
  protectedBranches = readProtectedBranches(projectDir);
} catch {
  allowWithWarning(`could not read ${CONFIG_FILE.replaceAll('\\', '/')}`);
}

// Any other branch, or a detached HEAD (empty name), is fine.
if (!protectedBranches.includes(branch)) {
  process.exit(0);
}

// Ignored files never reach a commit, so editing them on a protected branch is harmless.
try {
  git(gitDir, ['check-ignore', '-q', '--', target]);
  process.exit(0);
} catch (error) {
  // Exit 1 means the file is not ignored; anything else is a git failure.
  if (error.status !== 1) {
    allowWithWarning('could not check .gitignore');
  }
}

process.stderr.write(
  `Edits on the protected branch "${branch}" are blocked (${relative.replaceAll('\\', '/')}). `
  + 'Create a task branch first (for example with the dev-workflow:start-task skill). '
  + 'For an urgent edit on this branch, ask the user to disable the dev-workflow plugin temporarily.\n',
);
process.exit(2);
