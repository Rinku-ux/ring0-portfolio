import fs from "node:fs"
import path from "node:path"
import { resolveStoreMode } from "../store"
import { ReadonlyStoreError, asNoteTag, type Note, type NoteDraft, type RemoveResult, type StoreMode } from "./types"

const FILE = path.join(process.cwd(), "content/notes.json")
const JSON_INDENT = 2
const ID_PREFIX = "note-"

export type NoteStore = {
	mode: StoreMode
	list: () => Note[]
	create: (draft: NoteDraft) => Note
	remove: (id: string) => RemoveResult
}

function read(): Note[] {
	try {
		const parsed = JSON.parse(fs.readFileSync(FILE, "utf8")) as Note[]

		return parsed.map((note) => ({ ...note, tag: asNoteTag(note.tag) })).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
	} catch {
		return []
	}
}

function write(notes: Note[]): void {
	fs.writeFileSync(FILE, `${JSON.stringify(notes, null, JSON_INDENT)}\n`, "utf8")
}

export function getNoteStore(): NoteStore {
	const mode: StoreMode = resolveStoreMode()

	const guard = () => {
		if (mode === "readonly") {
			throw new ReadonlyStoreError()
		}
	}

	return {
		mode,
		list: read,
		create: (draft) => {
			guard()

			const note: Note = {
				id: `${ID_PREFIX}${Date.now()}`,
				createdAt: new Date().toISOString(),
				tag: asNoteTag(draft.tag),
				body: draft.body,
			}

			write([note, ...read()])

			return note
		},
		remove: (id) => {
			guard()

			const notes = read()
			const next = notes.filter((note) => note.id !== id)

			if (next.length === notes.length) {
				return "missing"
			}

			write(next)

			return "removed"
		},
	}
}
