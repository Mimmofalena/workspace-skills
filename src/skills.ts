export interface SkillSource {
  name: string;
  repo: string;
  path: string;
}

export const DEFAULT_SKILLS: SkillSource[] = [
  {
    name: "caveman",
    repo: "juliusbrussee/caveman",
    path: "skills/caveman/SKILL.md",
  },
  {
    name: "brainstorming",
    repo: "obra/superpowers",
    path: "skills/brainstorming/SKILL.md",
  },
  {
    name: "frontend-design",
    repo: "anthropics/skills",
    path: "skills/frontend-design/SKILL.md",
  },
  {
    name: "grill-me",
    repo: "mattpocock/skills",
    path: "skills/productivity/grill-me/SKILL.md",
  },
  {
    name: "ui-ux-pro-max",
    repo: "nextlevelbuilder/ui-ux-pro-max-skill",
    path: ".claude/skills/ui-ux-pro-max/SKILL.md",
  },
  {
    name: "vercel-react-best-practices",
    repo: "vercel-labs/agent-skills",
    path: "skills/react-best-practices/SKILL.md",
  },
];
