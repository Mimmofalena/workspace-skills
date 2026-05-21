import { homedir } from "node:os";
import { join, resolve, relative } from "node:path";
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

export function generate(cwd: string, skills: SkillFile[]) {
  const resolvedCwd = resolve(cwd);

  // Safety: refuse to run in home or root directory
  const home = resolve(homedir());
  const root = resolve(process.platform === "win32" ? process.cwd().split("\\")[0] + "\\" : "/");
  if (resolvedCwd === home || resolvedCwd === root) {
    console.error("Safety check: refusing to run in home or root directory.");
    console.error("Please cd into a project directory first.");
    process.exit(1);
  }

  // --- Opencode: .agents/skills/<name>/SKILL.md ---
  const agentsDir = resolve(join(cwd, ".agents", "skills"));
  if (!isInside(resolvedCwd, agentsDir)) {
    throw new Error("Safety check: agents dir outside project");
  }
  if (existsSync(agentsDir)) {
    rmSync(agentsDir, { recursive: true, force: true });
  }
  mkdirSync(agentsDir, { recursive: true });

  // --- Copilot buffer ---
  let copilotInstructions = `# Copilot Instructions\n\n`;
  copilotInstructions += `This project has the following AI skills installed via workspace-skills. `;
  copilotInstructions += `When a task matches a skill, follow its guidance. `;
  copilotInstructions += `You can also ask the user to activate a specific skill (e.g., "use caveman").\n\n`;

  // --- Index buffer ---
  let indexMd = `# Project AI Skills\n\n`;
  indexMd += `The following skills are installed in this workspace. `;
  indexMd += `Reference them when relevant to the current task.\n\n`;
  indexMd += `## Available Skills\n\n`;

  for (const s of skills) {
    const raw = readFileSync(s.filePath, "utf-8");
    const { body, description } = cleanSkill(raw);

    // Opencode
    const skillDir = join(agentsDir, s.name);
    mkdirSync(skillDir, { recursive: true });
    writeFileSync(join(skillDir, "SKILL.md"), body);

    // Copilot
    copilotInstructions += `---\n\n## Skill: ${s.name}\n\n`;
    if (description) {
      copilotInstructions += `*${description}*\n\n`;
    }
    copilotInstructions += `${body}\n\n`;

    // Index
    indexMd += `### ${s.name}\n`;
    if (description) indexMd += `${description}\n`;
    indexMd += `- **Path**: \`.agents/skills/${s.name}/SKILL.md\`\n`;
    indexMd += `- **Use when**: `;
    if (s.name === "caveman") indexMd += `the user asks for compressed/token-saving communication\n`;
    else if (s.name === "brainstorming") indexMd += `starting creative or design work\n`;
    else if (s.name === "frontend-design") indexMd += `building UI, components, or pages\n`;
    else if (s.name === "grill-me") indexMd += `the user wants to stress-test a plan or design\n`;
    else if (s.name === "ui-ux-pro-max") indexMd += `designing or reviewing UI/UX\n`;
    else if (s.name === "vercel-react-best-practices") indexMd += `writing or refactoring React/Next.js code\n`;
    else indexMd += `relevant to the task at hand\n`;
    indexMd += `\n`;
  }

  // --- Write Copilot instructions ---
  const githubDir = resolve(join(cwd, ".github"));
  if (!isInside(resolvedCwd, githubDir)) {
    throw new Error("Safety check: github dir outside project");
  }
  mkdirSync(githubDir, { recursive: true });
  const copilotPath = join(githubDir, "copilot-instructions.md");
  if (!isInside(resolvedCwd, copilotPath)) throw new Error("Safety check: copilot path outside project");
  writeFileSync(copilotPath, copilotInstructions.trim() + "\n");

  // --- Write Opencode index ---
  const readmePath = join(agentsDir, "README.md");
  if (!isInside(resolvedCwd, readmePath)) throw new Error("Safety check: readme path outside project");
  writeFileSync(readmePath, indexMd);

  // --- Write root SKILLS.md ---
  const skillsMdPath = resolve(join(cwd, "SKILLS.md"));
  if (!isInside(resolvedCwd, skillsMdPath)) {
    throw new Error("Safety check: SKILLS.md path outside project");
  }
  writeFileSync(skillsMdPath, indexMd);
}
