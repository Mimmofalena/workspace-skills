import { homedir } from "node:os";
import { join, resolve, relative } from "node:path";
import { existsSync, mkdirSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import type { SkillSource } from "./skills.js";

const CACHE_ROOT = resolve(join(homedir(), ".workspace-skills", "cache"));

function isInside(parent: string, child: string): boolean {
  const p = resolve(parent).replace(/\\/g, "/").toLowerCase();
  const c = resolve(child).replace(/\\/g, "/").toLowerCase();
  return c === p || c.startsWith(p + "/");
}

function validateRepoName(repo: string): void {
  if (repo.includes("..") || repo.startsWith("/") || repo.startsWith("\\")) {
    throw new Error(`Invalid repo name: ${repo}`);
  }
}

function checkGit(): void {
  try {
    execFileSync("git", ["--version"], { stdio: "ignore" });
  } catch {
    console.error("Error: 'git' is not installed or not in PATH.");
    console.error("Please install git: https://git-scm.com/downloads");
    process.exit(1);
  }
}

export function ensureDownloaded(skill: SkillSource): string {
  checkGit();
  validateRepoName(skill.repo);

  const dir = resolve(CACHE_ROOT, skill.repo.replace(/\//g, "__"));
  const skillFile = resolve(dir, skill.path);

  // Safety: never operate outside the cache root
  if (!isInside(CACHE_ROOT, dir)) {
    throw new Error(`Safety check: cache dir ${dir} outside root`);
  }
  if (!isInside(CACHE_ROOT, skillFile)) {
    throw new Error(`Safety check: skill file ${skillFile} outside cache`);
  }

  // Incomplete cache (folder exists but not the specific file) -> clean & retry
  if (existsSync(dir) && !existsSync(skillFile)) {
    console.log(`Cache for ${skill.repo} incomplete. Cleaning...`);
    rmSync(dir, { recursive: true, force: true });
  }

  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
    const url = `https://github.com/${skill.repo}.git`;
    try {
      execFileSync("git", ["clone", "--depth", "1", url, "."], { cwd: dir, stdio: "ignore" });
    } catch {
      console.error(`\nFailed to download skill '${skill.name}' from ${url}`);
      console.error("Possible causes:");
      console.error("  - No internet connection");
      console.error("  - The repository was moved or deleted");
      console.error("  - GitHub rate limit (wait a few minutes)");
      process.exit(1);
    }
  }

  if (!existsSync(skillFile)) {
    console.error(`\nSkill file not found: ${skillFile}`);
    console.error("The repository structure may have changed.");
    process.exit(1);
  }

  return skillFile;
}
