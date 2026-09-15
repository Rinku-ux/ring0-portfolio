import fs from "node:fs"
import path from "node:path"
import { ReadonlyStoreError } from "./notes/types"
import { isWritable } from "./store"
import { parseYouTubeId, youTubeThumb } from "./youtube"

/*
 * トップと /music の「文字と映像」だけを持つ設定。
 * 名前や連絡先（lib/site.ts）と違って、ここは /admin から書き換える前提。
 */
/*
 * トップの大きい枠。優先順位は youtubeId > src（mp4）> 静止画だけ。
 * YouTube は限定公開でも埋め込み再生できる（非公開は不可）。
 */
export type Reel = { youtubeId: string; src: string; poster: string; title: string; note: string }

export type SiteContent = {
	/* トップの大きい映像。src が空なら静止画のまま「reel 準備中」と出る。 */
	reel: Reel
	/* ヒーロー上部の小さなバッジ。 */
	status: string
	/* Piano セクションの前振り。 */
	pianoLede: string
}

const FILE = path.join(process.cwd(), "content/site.json")
const JSON_INDENT = 2

export const SITE_CONTENT_DEFAULTS: SiteContent = {
	reel: { youtubeId: "", src: "", poster: "/media/placeholder-reel.png", title: "Showreel 2026", note: "latest work" },
	status: "新しい制作と演奏、受付中",
	pianoLede: "練習の記録として、弾けたものから順に映像で残しています。",
}

function text(value: unknown, fallback: string): string {
	return typeof value === "string" && value.trim() !== "" ? value.trim() : fallback
}

// 足りないキーは既定値で埋める。壊れた JSON でページを落とさない。
export function getSiteContent(): SiteContent {
	let parsed: Partial<SiteContent> = {}

	try {
		parsed = JSON.parse(fs.readFileSync(FILE, "utf8")) as Partial<SiteContent>
	} catch {
		parsed = {}
	}

	const reel: Partial<Reel> = parsed.reel ?? {}
	const videoId = parseYouTubeId(reel.youtubeId)

	return {
		reel: {
			youtubeId: videoId,
			// src だけは「空にする」を許す（映像を下げたいとき）。
			src: typeof reel.src === "string" ? reel.src.trim() : SITE_CONTENT_DEFAULTS.reel.src,
			poster: text(reel.poster, videoId ? youTubeThumb(videoId) : SITE_CONTENT_DEFAULTS.reel.poster),
			title: text(reel.title, SITE_CONTENT_DEFAULTS.reel.title),
			note: text(reel.note, SITE_CONTENT_DEFAULTS.reel.note),
		},
		status: text(parsed.status, SITE_CONTENT_DEFAULTS.status),
		pianoLede: text(parsed.pianoLede, SITE_CONTENT_DEFAULTS.pianoLede),
	}
}

export function setSiteContent(input: unknown): SiteContent {
	if (!isWritable()) {
		throw new ReadonlyStoreError()
	}

	const patch = (input ?? {}) as Partial<SiteContent>
	const current = getSiteContent()
	const reel: Partial<Reel> = patch.reel ?? {}
	// YouTube は URL を貼られても ID だけ残す。空文字なら「YouTube をやめる」の意味。
	const videoId = typeof reel.youtubeId === "string" ? parseYouTubeId(reel.youtubeId) : current.reel.youtubeId
	const posterFallback = videoId && videoId !== current.reel.youtubeId ? youTubeThumb(videoId) : current.reel.poster
	const next: SiteContent = {
		reel: {
			youtubeId: videoId,
			src: typeof reel.src === "string" ? reel.src.trim() : current.reel.src,
			poster: text(reel.poster, posterFallback),
			title: text(reel.title, current.reel.title),
			note: text(reel.note, current.reel.note),
		},
		status: text(patch.status, current.status),
		pianoLede: text(patch.pianoLede, current.pianoLede),
	}

	fs.writeFileSync(FILE, `${JSON.stringify(next, null, JSON_INDENT)}\n`, "utf8")

	return next
}
