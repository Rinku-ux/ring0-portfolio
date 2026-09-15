"use client"

import { useCallback, useEffect, useState } from "react"
import { formatDate } from "@/lib/format"
import type { Note, NoteTag } from "@/lib/notes/types"
import { NOTE_TAGS, NOTE_TAG_LABELS } from "@/lib/notes/types"
import { CONFLICT, send } from "./helpers"

const BODY_MAX = 600

export function NotesPanel({ onReadonly }: { onReadonly: () => void }) {
	const [notes, setNotes] = useState<Note[]>([])
	const [tag, setTag] = useState<NoteTag>("log")
	const [body, setBody] = useState("")
	const [error, setError] = useState("")
	const [busy, setBusy] = useState(false)

	const load = useCallback(async () => {
		const result = await send<{ notes: Note[] }>("/api/notes", "GET")

		if (result.ok) {
			setNotes(result.data.notes)
		}
	}, [])

	useEffect(() => {
		void load()
	}, [load])

	const submit = async (event: React.FormEvent) => {
		event.preventDefault()
		setBusy(true)
		setError("")

		const result = await send<{ note: Note }>("/api/notes", "POST", { tag, body })
		setBusy(false)

		if (!result.ok) {
			setError(result.error)

			if (result.status === CONFLICT) {
				onReadonly()
			}

			return
		}

		setNotes((before) => [result.data.note, ...before])
		setBody("")
	}

	const remove = async (id: string) => {
		setError("")
		const result = await send(`/api/notes?id=${encodeURIComponent(id)}`, "DELETE")

		if (!result.ok) {
			setError(result.error)

			if (result.status === CONFLICT) {
				onReadonly()
			}

			return
		}

		setNotes((before) => before.filter((note) => note.id !== id))
	}

	return (
		<div className="stack">
			<form className="panel stack" onSubmit={submit}>
				<p className="mono">ノートを追加</p>
				<label className="field">
					<span>種類</span>
					<select className="select" value={tag} onChange={(event) => setTag(event.target.value as NoteTag)}>
						{NOTE_TAGS.map((item) => (
							<option key={item} value={item}>
								{NOTE_TAG_LABELS[item]}
							</option>
						))}
					</select>
				</label>
				<label className="field">
					<span>本文</span>
					<textarea className="textarea" value={body} maxLength={BODY_MAX} rows={4} onChange={(event) => setBody(event.target.value)} />
					<span className="mono">
						{body.length} / {BODY_MAX}
					</span>
				</label>
				{error ? <p className="alert alert-bad">{error}</p> : null}
				<button className="btn btn-primary" type="submit" disabled={busy || !body.trim()}>
					追加
				</button>
			</form>
			{notes.length === 0 ? (
				<p className="empty">まだノートがありません。</p>
			) : (
				<ul className="rows">
					{notes.map((note) => (
						<li className="row" key={note.id}>
							<span className="row-main">{note.body}</span>
							<span className="row-note">
								{NOTE_TAG_LABELS[note.tag]} / {formatDate(note.createdAt)}
							</span>
							<button className="btn btn-danger" type="button" onClick={() => remove(note.id)}>
								削除
							</button>
						</li>
					))}
				</ul>
			)}
		</div>
	)
}
