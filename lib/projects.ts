import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { KINDS, STATUSES, type Kind, type Project, type Status } from "./types";

const DIR = path.join(process.cwd(), "content/projects");

function asKind(value: unknown): Kind {
  if (typeof value === "string" && (KINDS as readonly string[]).includes(value)) {
    return value as Kind;
  }
  throw new Error(`Invalid kind: ${String(value)}`);
}

function asStatus(value: unknown): Status {
  if (typeof value === "string" && (STATUSES as readonly string[]).includes(value)) {
    return value as Status;
  }
  throw new Error(`Invalid status: ${String(value)}`);
}

export function getProjects(): Project[] {
  if (!fs.existsSync(DIR)) {
    return [];
  }

  return fs
    .readdirSync(DIR)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => {
      const raw = fs.readFileSync(path.join(DIR, file), "utf8");
      const { data, content } = matter(raw);
      const stack = Array.isArray(data.stack)
        ? data.stack.filter((item) => typeof item === "string")
        : [];

      return {
        slug: String(data.slug),
        title: String(data.title),
        kind: asKind(data.kind),
        year: Number(data.year),
        summary: String(data.summary),
        stack,
        liveUrl: data.liveUrl ? String(data.liveUrl) : undefined,
        repoUrl: data.repoUrl ? String(data.repoUrl) : undefined,
        cover: String(data.cover),
        playable: Boolean(data.playable),
        featured: Boolean(data.featured),
        status: asStatus(data.status),
        body: content.trim(),
      } satisfies Project;
    })
    .sort((left, right) => right.year - left.year);
}

export function getProject(slug: string): Project | undefined {
  return getProjects().find((project) => project.slug === slug);
}
