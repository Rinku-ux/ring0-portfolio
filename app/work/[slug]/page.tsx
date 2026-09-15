import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { MDXRemote } from "next-mdx-remote/rsc"
import { MediaFrame } from "@/components/MediaFrame"
import { getNeighbors, getProject, getProjects } from "@/lib/projects"
import { KIND_LABELS, STATUS_LABELS } from "@/lib/types"

type Params = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
	return getProjects().map((project) => ({ slug: project.slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
	const { slug } = await params
	const project = getProject(slug)

	if (!project) {
		return { title: "見つかりません" }
	}

	return {
		title: project.title,
		description: project.summary,
		alternates: { canonical: `/work/${project.slug}` },
		openGraph: { title: project.title, description: project.summary, images: [{ url: project.cover }] },
	}
}

export default async function ProjectPage({ params }: Params) {
	const { slug } = await params
	const project = getProject(slug)

	if (!project) {
		notFound()
	}

	const { prev, next } = getNeighbors(project.slug)

	return (
		<>
			<section className="page-head">
				<p className="mono">
					{KIND_LABELS[project.kind]} / {project.year}
				</p>
				<h1>{project.title}</h1>
				<p>{project.summary}</p>
			</section>
			<div className="grid-split">
				<div className="stack">
					<MediaFrame media={project.media} title={project.title} caption={project.mediaCaption} priority />
					<div className="prose">
						<MDXRemote source={project.body} />
					</div>
				</div>
				<aside className="panel">
					<p className="mono">detail</p>
					<div className="meta">
						<span className={`status status-${project.status}`}>{STATUS_LABELS[project.status]}</span>
					</div>
					<div className="meta">
						{project.stack.map((item) => (
							<span className="tag" key={item}>
								{item}
							</span>
						))}
					</div>
					{project.liveUrl ? (
						<a className="btn btn-primary" href={project.liveUrl} rel="noreferrer noopener" target="_blank">
							{project.playable ? "遊んでみる" : "開く"}
						</a>
					) : null}
					{project.repoUrl ? (
						<a className="btn" href={project.repoUrl} rel="noreferrer noopener" target="_blank">
							コードを見る
						</a>
					) : null}
				</aside>
			</div>
			<nav className="pager" aria-label="作品の移動">
				<span>{prev ? <Link href={`/work/${prev.slug}`}>← {prev.title}</Link> : null}</span>
				<span>{next ? <Link href={`/work/${next.slug}`}>{next.title} →</Link> : null}</span>
			</nav>
		</>
	)
}
