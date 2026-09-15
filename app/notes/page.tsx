import type { Metadata } from "next"
import { formatDate } from "@/lib/format"
import { getNoteStore } from "@/lib/notes/store"
import { NOTE_TAGS, NOTE_TAG_LABELS, asNoteTag } from "@/lib/notes/types"
import Link from "next/link"

const ALL = "all"

export const metadata: Metadata = {
	title: "ノート",
	description: "ピアノと開発の短いログ。",
	alternates: { canonical: "/notes", types: { "application/rss+xml": "/feed.xml" } },
}

export default async function NotesPage({ searchParams }: { searchParams: Promise<{ tag?: string }> }) {
	const { tag } = await searchParams
	const active = tag && tag !== ALL ? asNoteTag(tag) : ALL
	const notes = getNoteStore()
		.list()
		.filter((note) => active === ALL || note.tag === active)

	return (
		<>
			<section className="page-head">
				<p className="mono">notes</p>
				<h1>ノート</h1>
				<p>
					練習と開発の記録。<a href="/feed.xml">RSS</a> でも読めます。
				</p>
			</section>
			<div className="filters">
				<Link className="tag" href="/notes" aria-current={active === ALL ? "page" : undefined}>
					すべて
				</Link>
				{NOTE_TAGS.map((item) => (
					<Link className="tag" key={item} href={`/notes?tag=${item}`} aria-current={item === active ? "page" : undefined}>
						{NOTE_TAG_LABELS[item]}
					</Link>
				))}
			</div>
			{notes.length === 0 ? (
				<p className="empty">まだノートがありません。</p>
			) : (
				<div className="feed">
					{notes.map((note) => (
						<article className="note" key={note.id}>
							<p className="mono">
								{NOTE_TAG_LABELS[note.tag]} / {formatDate(note.createdAt)}
							</p>
							<p>{note.body}</p>
						</article>
					))}
				</div>
			)}
		</>
	)
}
