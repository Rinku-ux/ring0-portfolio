import fs from "node:fs"
import path from "node:path"
import { ReadonlyStoreError } from "./notes/types"
import { isWritable } from "./store"

import { REPERTOIRE_STATES, type Music, type Practicing, type Recording, type RepertoireItem, type RepertoireState } from "./music-types"

// 型とラベルは lib/music-types.ts に置いている（クライアントからも使うため）。
export { REPERTOIRE_LABELS, REPERTOIRE_STATES } from "./music-types"
export type { Music, Practicing, Recording, RepertoireItem, RepertoireState } from "./music-types"

const FILE = path.join(process.cwd(), "content/music.json")
const EMPTY: Music = { recordings: [], repertoire: [] }
const JSON_INDENT = 2

// 壊れた JSON でページごと落とさない。
export function getMusic(): Music {
	try {
		const parsed = JSON.parse(fs.readFileSync(FILE, "utf8")) as Music

		return { practicing: parsed.practicing, recordings: parsed.recordings ?? [], repertoire: parsed.repertoire ?? [] }
	} catch {
		return EMPTY
	}
}

function write(music: Music): void {
	if (!isWritable()) {
		throw new ReadonlyStoreError()
	}

	fs.writeFileSync(FILE, `${JSON.stringify(music, null, JSON_INDENT)}\n`, "utf8")
}

function text(value: unknown): string {
	return typeof value === "string" ? value.trim() : ""
}

function asState(value: unknown): RepertoireState {
	return REPERTOIRE_STATES.includes(value as RepertoireState) ? (value as RepertoireState) : "learning"
}

/*
 * 録音の一覧。/admin から配列ごと差し替える。
 * src が空なら「録音準備中」として曲名だけ並ぶ。
 */
export function setRecordings(input: unknown): Recording[] {
	const rows = Array.isArray(input) ? input : []
	const recordings = rows
		.map((row, index) => {
			const raw = row as Partial<Recording>
			const title = text(raw?.title)

			if (!title) {
				return null
			}

			const src = text(raw?.src)
			const note = text(raw?.note)

			return {
				id: text(raw?.id) || `rec-${Date.now()}-${index}`,
				title,
				composer: text(raw?.composer),
				recordedAt: text(raw?.recordedAt) || new Date().toISOString().slice(0, 10),
				...(src ? { src } : {}),
				...(note ? { note } : {}),
			}
		})
		.filter((item): item is Recording => item !== null)
		.sort((a, b) => b.recordedAt.localeCompare(a.recordedAt))

	write({ ...getMusic(), recordings })

	return recordings
}

// レパートリー。状態ごとの並びは表示側で分けるので、ここでは一列で持つ。
export function setRepertoire(input: unknown): RepertoireItem[] {
	const rows = Array.isArray(input) ? input : []
	const repertoire = rows
		.map((row) => {
			const raw = row as Partial<RepertoireItem>
			const title = text(raw?.title)

			return title ? { title, composer: text(raw?.composer), state: asState(raw?.state) } : null
		})
		.filter((item): item is RepertoireItem => item !== null)

	write({ ...getMusic(), repertoire })

	return repertoire
}

/*
 * 「いま練習している曲」の差し替え。
 * piece が空なら欄ごと消す（トップと /music から消える）。
 */
export function setPracticing(input: unknown): Practicing | undefined {
	const raw = input as Partial<Practicing> | null
	const music = getMusic()
	const piece = text(raw?.piece)

	if (!piece) {
		write({ ...music, practicing: undefined })

		return undefined
	}

	const note = text(raw?.note)
	const practicing: Practicing = {
		piece,
		composer: text(raw?.composer),
		since: text(raw?.since) || new Date().toISOString().slice(0, 10),
		...(note ? { note } : {}),
	}

	write({ ...music, practicing })

	return practicing
}
