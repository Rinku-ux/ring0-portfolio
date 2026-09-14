import Link from "next/link";
import type { Project } from "@/lib/types";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link className="slot" href={`/work/${project.slug}`}>
      <span className="select mono">Select</span>
      <img src={project.cover} alt="" />
      <p className="kind mono">{project.kind}</p>
      <h3>{project.title}</h3>
    </Link>
  );
}
