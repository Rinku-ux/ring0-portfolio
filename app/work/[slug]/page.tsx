import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getProject, getProjects } from "@/lib/projects";

export function generateStaticParams() {
  return getProjects().map((project) => ({ slug: project.slug }));
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);

  if (!project) {
    notFound();
  }

  return (
    <>
      <div className="detail">
        <img className="cover hud" src={project.cover} alt={`${project.title} cover`} />
        <aside className="stats hud">
          <p className="kind mono">{project.kind}</p>
          <h1 style={{ fontSize: 32 }}>{project.title}</h1>
          <dl>
            <dt className="mono">Year</dt>
            <dd>{project.year}</dd>
            <dt className="mono">Stack</dt>
            <dd>{project.stack.join(", ")}</dd>
            <dt className="mono">Status</dt>
            <dd>{project.status}</dd>
          </dl>
          <div className="actions">
            {project.playable && project.liveUrl ? (
              <a className="btn mono" href={project.liveUrl} target="_blank" rel="noreferrer">
                Play
              </a>
            ) : null}
            {project.repoUrl ? (
              <a className="btn ghost mono" href={project.repoUrl} target="_blank" rel="noreferrer">
                Code
              </a>
            ) : null}
          </div>
        </aside>
      </div>
      <article className="writeup">
        <MDXRemote source={project.body} />
      </article>
    </>
  );
}
