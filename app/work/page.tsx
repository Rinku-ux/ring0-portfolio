import type { Metadata } from "next"
import Link from "next/link"
import { ProjectCard } from "@/components/ProjectCard"
import { getProjects } from "@/lib/projects"
import { KINDS, KIND_LABELS, type Kind } from "@/lib/types"

const ALL = "all"
const PRIORITY_COUNT = 2
const FILTERS = [ALL, ...KINDS] as const

type Filter = (typeof FILTERS)[number]

export const metadata: Metadata = { title: "作品", description: "ゲーム、ツール、音楽、実験の一覧。" }

function asFilter(value: string | undefined): Filter {
	return FILTERS.includes(value as Filter) ? (value as Filter) : ALL
}

function labelOf(filter: Filter): string {
	return filter === ALL ? "すべて" : KIND_LABELS[filter as Kind]
}

function hrefFor(filter: Filter): string {
	return filter === ALL ? "/work" : `/work?kind=${filter}`
}

export default async function WorkPage({ searchParams }: { searchParams: Promise<{ kind?: string }> }) {
	const { kind } = await searchParams
	const filter = asFilter(kind)
	const projects = getProjects().filter((project) => filter === ALL || project.kind === filter)

	return (
		<>
			<section className="page-head">
				<p className="mono">work</p>
				<h1>Work</h1>
				<p>遊べるもの、使えるもの、試したものを並べています。</p>
			</section>
			<div className="filters">
				{FILTERS.map((item) => (
					<Link className="tag" key={item} href={hrefFor(item)} aria-current={item === filter ? "page" : undefined}>
						{labelOf(item)}
					</Link>
				))}
			</div>
			{projects.length === 0 ? (
				<p className="empty">この種類の作品はまだありません。</p>
			) : (
				<div className="grid-cards">
					{projects.map((project, index) => (
						<ProjectCard key={project.slug} project={project} priority={index < PRIORITY_COUNT} />
					))}
				</div>
			)}
		</>
	)
}
