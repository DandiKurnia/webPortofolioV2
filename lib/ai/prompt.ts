import { readdirSync, readFileSync } from "node:fs";
import { basename, join, relative } from "node:path";
import { prisma } from "@/lib/prisma";

const CONTENT_DIR = join(process.cwd(), "content", "ai");
const KNOWLEDGE_DIR = join(CONTENT_DIR, "knowledge");

function readMd(filename: string): string {
  try {
    return readFileSync(join(CONTENT_DIR, filename), "utf-8").trim();
  } catch {
    console.error(`[prompt] Failed to read ${filename}`);
    return "";
  }
}

function collectMdFiles(dir: string): string[] {
  let dirents;
  try {
    dirents = readdirSync(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  const out: string[] = [];
  const sorted = [...dirents].sort((a, b) => a.name.localeCompare(b.name));
  for (const entry of sorted) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...collectMdFiles(full));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      out.push(full);
    }
  }
  return out;
}

function readKnowledge(): string[] {
  const files = collectMdFiles(KNOWLEDGE_DIR);
  const sections: string[] = [];
  for (const file of files) {
    try {
      const content = readFileSync(file, "utf-8").trim();
      if (!content) continue;
      const rel = relative(KNOWLEDGE_DIR, file).replace(/\\/g, "/");
      const name = basename(rel, ".md");
      sections.push(`## Knowledge: ${name} (${rel})\n${content}`);
    } catch {
      console.error(`[prompt] Failed to read knowledge file ${file}`);
    }
  }
  return sections;
}

export const REFUSAL_EN =
  "I'm here to share about Dandi only. Want to know about his skills, projects, or experience?";

export const REFUSAL_ID =
  "Saya di sini khusus jawab soal Dandi aja ya. Mau tau apa nih — skill, project, atau pengalamannya?";

export const TOO_LONG_ID =
  "Pertanyaan kepanjangan, singkat aja ya — maksimal 300 karakter.";

export const RATE_LIMITED_MSG =
  "Slow down — max 10 questions per 5 minutes.";

export async function buildSystemPrompt(): Promise<string> {
  const rules = readMd("rules.md");
  const profile = readMd("profile.md");

  const [skills, certifications, projects] = await Promise.all([
    prisma.skill.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.certification.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.project.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  const sections: string[] = [];

  if (rules) sections.push(rules);
  if (profile) sections.push(profile);

  sections.push(...readKnowledge());

  if (certifications.length > 0) {
    const list = certifications
      .map((c) => `- ${c.title} (${c.company}${c.years ? `, ${c.years}` : ""})`)
      .join("\n");
    sections.push(`## Certifications (from database)\n${list}`);
  }

  if (skills.length > 0) {
    const list = skills.map((s) => `- ${s.title}: ${s.description}`).join("\n");
    sections.push(`## Skills (from database)\n${list}`);
  }

  if (projects.length > 0) {
    const list = projects
      .map(
        (p) =>
          `- ${p.title}: ${p.description}${p.technologies.length > 0 ? ` [${p.technologies.join(", ")}]` : ""}`
      )
      .join("\n");
    sections.push(`## Projects (from database)\n${list}`);
  }

  return sections.join("\n\n");
}
