import { homedir } from "node:os";
import { join } from "node:path";
import { existsSync, mkdirSync, rmSync } from "node:fs";
import { execSync } from "node:child_process";
import type { SkillSource } from "./skills.js";

const CACHE_ROOT = join(homedir(), ".workspace-skills", "cache");

function checkGit(): void {
  try {
    execSync("git --version", { stdio: "ignore" });
  } catch {
    console.error("Error: 'git' is not installed or not in PATH.");
    console.error("Please install git: https://git-scm.com/downloads");
    process.exit(1);
  }
}

export function ensureDownloaded(skill: SkillSource): string {
  checkGit();

  const dir = join(CACHE_ROOT, skill.repo.replace(/\//g, "__"));
  const skillFile = join(dir, skill.path);

  // If the dir exists but the skill file doesn't, the previous clone failed.
  // Remove the broken cache and retry.
  if (existsSync(dir) && !existsSync(skillFile)) {
    console.log(`Cache for ${skill.repo} is incomplete. Cleaning and re-downloading...`);
    rmSync(dir, { recursive: true, force: true });
  }

  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
    const url = `https://github.com/${skill.repo}.git`;
    try {
      execSync(`git clone --depth 1 ${url} .`, { cwd: dir, stdio: "ignore" });
    } catch (e) {
      console.error(`\nFailed to download skill '${skill.name}' from ${url}`);
      console.error("Possible causes:");
      console.error("  - No internet connection");
      console.error("  - The repository was moved or deleted");
      console.error("  - GitHub rate limit (wait a few minutes)");
      process.exit(1);
    }
  }

  if (!existsSync(skillFile)) {
    console.error(`\nSkill file not found after download: ${skillFile}`);
    console.error("The repository might have changed its structure.");
    process.exit(1);
  }

  return skillFile;
}
