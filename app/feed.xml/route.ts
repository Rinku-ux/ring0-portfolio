import { getNoteStore } from "@/lib/notes/store"
import { NOTE_TAG_LABELS } from "@/lib/notes/types"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
const TITLE = "ring0 / notes"
const TITLE_MAX = 60
const CACHE_SECONDS = 3600

function escapeXml(value: string): string {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&apos;")
}

export function GET() {
	const notes = getNoteStore().list()
	const items = notes
		.map((note) => {
			const head = note.body.length > TITLE_MAX ? `${note.body.slice(0, TITLE_MAX)}...` : note.body

			return [
				"<item>",
				`<title>${escapeXml(`[${NOTE_TAG_LABELS[note.tag]}] ${head}`)}</title>`,
				`<link>${SITE_URL}/notes</link>`,
				`<guid isPermaLink="false">${note.id}</guid>`,
				`<pubDate>${new Date(note.createdAt).toUTCString()}</pubDate>`,
				`<description>${escapeXml(note.body)}</description>`,
				"</item>",
			].join("")
		})
		.join("")

	const body = [
		'<?xml version="1.0" encoding="UTF-8"?>',
		'<rss version="2.0">',
		"<channel>",
		`<title>${TITLE}</title>`,
		`<link>${SITE_URL}/notes</link>`,
		"<description>ピアノと開発の短いログ。</description>",
		"<language>ja</language>",
		items,
		"</channel>",
		"</rss>",
	].join("")

	return new Response(body, {
		headers: {
			"content-type": "application/rss+xml; charset=utf-8",
			"cache-control": `s-maxage=${CACHE_SECONDS}, stale-while-revalidate`,
		},
	})
}
