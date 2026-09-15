export const NOTE_TAGS = ["log", "dev", "music", "idea"] as const

export type NoteTag = (typeof NOTE_TAGS)[number]

export const NOTE_TAG_LABELS: Record<NoteTag, string> = { log: "日誌", dev: "開発", music: "ピアノ", idea: "アイデア" }

export type Note = { id: string; createdAt: string; tag: NoteTag; body: string }
export type NoteDraft = { tag: NoteTag; body: string }
export type StoreMode = "file" | "readonly"
export type RemoveResult = "removed" | "missing"

// 書き込みを保持できない環境で投げる。
export class ReadonlyStoreError extends Error {
	constructor() {
		super("notes store is readonly")
		this.name = "ReadonlyStoreError"
	}
}

export function asNoteTag(value: unknown): NoteTag {
	return NOTE_TAGS.includes(value as NoteTag) ? (value as NoteTag) : "log"
}
