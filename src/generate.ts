import { join } from "node:path";
import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync, readdirSync } from "node:fs";
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

export function generate(cwd: string, skills: SkillFile[]) {
  // --- Opencode: .agents/skills/<name>/SKILL.md ---
  const agentsDir = join(cwd, ".agents", "skills");
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
  const githubDir = join(cwd, ".github");
  mkdirSync(githubDir, { recursive: true });
  writeFileSync(join(githubDir, "copilot-instructions.md"), copilotInstructions.trim() + "\n");

  // --- Write Opencode index ---
  writeFileSync(join(agentsDir, "README.md"), indexMd);

  // --- Write root SKILLS.md ---
  writeFileSync(join(cwd, "SKILLS.md"), indexMd);
}
