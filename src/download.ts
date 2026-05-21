import { homedir } from "node:os";
import { join } from "node:path";
import { existsSync, mkdirSync } from "node:fs";
import { execSync } from "node:child_process";
import type { SkillSource } from "./skills.js";

const CACHE_ROOT = join(homedir(), ".workspace-skills", "cache");

export function ensureDownloaded(skill: SkillSource): string {
  const dir = join(CACHE_ROOT, skill.repo.replace("/", "__"));

  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
    const url = `https://github.com/${skill.repo}.git`;
    execSync(`git clone --depth 1 ${url} .`, { cwd: dir, stdio: "ignore" });
  }

  return join(dir, skill.path);
}
