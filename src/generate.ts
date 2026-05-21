import { join, resolve } from "node:path";
import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import matter from "gray-matter";

export interface SkillFile {
  name: string;
  filePath: string;
}

function cleanSkill(raw: string): { body: string; description: string } {
  const parsed = matter(raw);
  let body = parsed.content;
  body = body.replace(/<skill_content[^>]*>[\s\S]*?<\/skill_content>/g, "");
  body = body.trim();
  return {
    body,
    description: parsed.data.description || "",
  };
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
      const raw = readFileSync(s.filePath, "utf-8");
      const { body } = cleanSkill(raw);
      const skillDir = join(agentsDir, s.name);
      mkdirSync(skillDir, { recursive: true });
      writeFileSync(join(skillDir, "SKILL.md"), body);
    }
  }

  // --- copilot ---
  if (target === "copilot" || target === "both") {
    const githubDir = resolve(join(cwd, ".github"));
    if (!isInside(resolvedCwd, githubDir)) {
      throw new Error("Safety check: github dir outside project");
    }
    mkdirSync(githubDir, { recursive: true });

    let instructions = `# Copilot Instructions\n\n`;
    instructions += `The following skills are available for this project. `;
    instructions += `When a task matches a skill, follow its guidance.\n\n`;

    for (const s of skills) {
      const raw = readFileSync(s.filePath, "utf-8");
      const { body, description } = cleanSkill(raw);
      instructions += `---\n\n## Skill: ${s.name}\n\n`;
      if (description) instructions += `*${description}*\n\n`;
      instructions += `${body}\n\n`;
    }

    const copilotPath = join(githubDir, "copilot-instructions.md");
    if (!isInside(resolvedCwd, copilotPath)) throw new Error("Safety check: copilot path outside project");
    writeFileSync(copilotPath, instructions.trim() + "\n");
  }
}
