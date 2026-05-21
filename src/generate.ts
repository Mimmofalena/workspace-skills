import { join, resolve } from "node:path";
import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import matter from "gray-matter";

export interface SkillFile {
  name: string;
  filePath: string;
}

function cleanSkill(raw: string): string {
  const parsed = matter(raw);
  let body = parsed.content;
  body = body.replace(/<skill_content[^>]*>[\s\S]*?<\/skill_content>/g, "");
  return body.trim();
}

function isInside(parent: string, child: string): boolean {
  const p = resolve(parent).replace(/\\/g, "/").toLowerCase();
  const c = resolve(child).replace(/\\/g, "/").toLowerCase();
  return c === p || c.startsWith(p + "/");
}

export function generate(cwd: string, skills: SkillFile[], target: "opencode" | "copilot" | "both") {
  const resolvedCwd = resolve(cwd);

  // --- opencode ---
  if (target === "opencode" || target === "both") {
    const agentsDir = resolve(join(cwd, ".agents", "skills"));
    if (!isInside(resolvedCwd, agentsDir)) {
      throw new Error("Safety check: agents dir outside project");
    }
    if (existsSync(agentsDir)) {
      rmSync(agentsDir, { recursive: true, force: true });
    }
    mkdirSync(agentsDir, { recursive: true });

    for (const s of skills) {
      const body = cleanSkill(readFileSync(s.filePath, "utf-8"));
      const skillDir = join(agentsDir, s.name);
      mkdirSync(skillDir, { recursive: true });
      writeFileSync(join(skillDir, "SKILL.md"), body);
    }
  }

  // --- copilot ---
  if (target === "copilot" || target === "both") {
    const githubSkillsDir = resolve(join(cwd, ".github", "skills"));
    if (!isInside(resolvedCwd, githubSkillsDir)) {
      throw new Error("Safety check: github/skills dir outside project");
    }
    if (existsSync(githubSkillsDir)) {
      rmSync(githubSkillsDir, { recursive: true, force: true });
    }
    mkdirSync(githubSkillsDir, { recursive: true });

    for (const s of skills) {
      const body = cleanSkill(readFileSync(s.filePath, "utf-8"));
      const skillDir = join(githubSkillsDir, s.name);
      mkdirSync(skillDir, { recursive: true });
      writeFileSync(join(skillDir, "SKILL.md"), body);
    }
  }
}
