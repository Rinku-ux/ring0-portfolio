import Link from "next/link";
import { ProjectCard } from "@/components/ProjectCard";
import { getProjects } from "@/lib/projects";
import { KINDS, type Kind } from "@/lib/types";

function isKind(value: string | undefined): value is Kind {
  return Boolean(value && (KINDS as readonly string[]).includes(value));
}

export default async function WorkPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string }>;
}) {
  const { kind } = await searchParams;
  const selected = isKind(kind) ? kind : undefined;
  const projects = getProjects().filter((project) =>
    selected ? project.kind === selected : true,
  );

  return (
    <>
      <h1>Work</h1>
      <p className="tagline" style={{ marginBottom: 24 }}>
        公開できる個人作品だけ。
      </p>
      <div className="filters">
        <Link className={`chip mono ${selected ? "" : "on"}`.trim()} href="/work">
          All
        </Link>
        {KINDS.map((item) => (
          <Link
            key={item}
            className={`chip mono ${selected === item ? "on" : ""}`.trim()}
            href={`/work?kind=${item}`}
          >
            {item}
          </Link>
        ))}
      </div>
      <div className="work-grid">
        {projects.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>
    </>
  );
}
