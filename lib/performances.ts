import fs from "node:fs"
import path from "node:path"
import { ReadonlyStoreError } from "./notes/types"
import { isWritable } from "./store"
import { parseYouTubeId, youTubeThumb } from "./youtube"

/*
 * 演奏映像。ピアノは意匠ではなくコンテンツとして扱うので、
 * 作品（projects）と同じ「メディアが主役」の形に揃えている。
 * /admin から追加・編集・削除できる。
 */
export type ClipMedia = { type: "video"; src: string; poster: string } | { type: "youtube"; videoId: string; poster: string }

export type Clip = {
	id: string
	title: string
	composer: string
	date: string
	lengthLabel?: string
	note?: string
	media: ClipMedia
}

export type ClipDraft = {
	title: string
	composer: string
	date: string
	lengthLabel?: string
	note?: string
	media: ClipMedia
}

const FILE = path.join(process.cwd(), "content/performances.json")
const JSON_INDENT = 2
const ID_PREFIX = "clip-"
const FALLBACK_POSTER = "/media/placeholder-reel.png"

function isMedia(value: unknown): value is ClipMedia {
	const media = value as ClipMedia | undefined

	if (!media) {
		return false
	}

	return (media.type === "video" && typeof media.src === "string") || (media.type === "youtube" && typeof media.videoId === "string")
}

function text(value: unknown, fallback = ""): string {
	return typeof value === "string" && value.trim() !== "" ? value.trim() : fallback
}

// 壊れた JSON や書きかけの項目でページごと落とさない。
export function getClips(): Clip[] {
	try {
		const parsed = JSON.parse(fs.readFileSync(FILE, "utf8")) as { clips?: Clip[] }

		return (parsed.clips ?? [])
			.filter((clip) => typeof clip?.id === "string" && typeof clip.title === "string" && isMedia(clip.media))
			.sort((a, b) => b.date.localeCompare(a.date))
	} catch {
		return []
	}
}

function write(clips: Clip[]): void {
	if (!isWritable()) {
		throw new ReadonlyStoreError()
	}

	fs.writeFileSync(FILE, `${JSON.stringify({ clips }, null, JSON_INDENT)}\n`, "utf8")
}

// 入力は必ずここを通してから保存する。空文字のキーは持たせない。
export function normalizeDraft(input: unknown): ClipDraft | null {
	const raw = input as Partial<ClipDraft> & { media?: Partial<ClipMedia> & { type?: string } }
	const title = text(raw?.title)
	const media = raw?.media

	if (!title || !media) {
		return null
	}

	let normalized: ClipMedia | null = null

	if (media.type === "youtube") {
		// URL を貼っただけでも通す。サムネは未指定なら YouTube のものを使う。
		const videoId = parseYouTubeId((media as { videoId?: unknown }).videoId)
		normalized = videoId ? { type: "youtube", videoId, poster: text(media.poster, youTubeThumb(videoId)) } : null
	}

	if (media.type === "video") {
		const src = text((media as { src?: unknown }).src)
		normalized = src ? { type: "video", src, poster: text(media.poster, FALLBACK_POSTER) } : null
	}

	if (!normalized) {
		return null
	}

	const draft: ClipDraft = {
		title,
		composer: text(raw?.composer, "original"),
		date: text(raw?.date, new Date().toISOString().slice(0, 10)),
		media: normalized,
	}
	const lengthLabel = text(raw?.lengthLabel)
	const note = text(raw?.note)

	return { ...draft, ...(lengthLabel ? { lengthLabel } : {}), ...(note ? { note } : {}) }
}

export function createClip(draft: ClipDraft): Clip {
	const clip: Clip = { id: `${ID_PREFIX}${Date.now()}`, ...draft }
	write([clip, ...getClips()])

	return clip
}

export function updateClip(id: string, draft: ClipDraft): Clip | null {
	const clips = getClips()
	const found = clips.find((clip) => clip.id === id)

	if (!found) {
		return null
	}

	const next: Clip = { id, ...draft }
	write(clips.map((clip) => (clip.id === id ? next : clip)))

	return next
}

export function removeClip(id: string): boolean {
	const clips = getClips()
	const next = clips.filter((clip) => clip.id !== id)

	if (next.length === clips.length) {
		return false
	}

	write(next)

	return true
}
