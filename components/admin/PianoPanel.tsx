"use client"

import { useCallback, useEffect, useState } from "react"
import type { MediaFile } from "@/lib/media"
import type { Music, Practicing, Recording, RepertoireItem } from "@/lib/music-types"
import type { Clip, ClipMedia } from "@/lib/performances"
import { MediaField } from "./MediaField"
import { RecordingsEditor, RepertoireEditor } from "./MusicLists"
import { send, today } from "./helpers"

const NOTE_MAX = 200
const EMPTY_FORM = {
	id: "",
	title: "",
	composer: "",
	date: today(),
	lengthLabel: "",
	note: "",
	kind: "video" as ClipMedia["type"],
	src: "",
	videoId: "",
	// 空のままなら、YouTube はサムネ自動・mp4 は仮のポスターになる。
	poster: "",
}

type Form = typeof EMPTY_FORM

function toForm(clip: Clip): Form {
	return {
		id: clip.id,
		title: clip.title,
		composer: clip.composer,
		date: clip.date,
		lengthLabel: clip.lengthLabel ?? "",
		note: clip.note ?? "",
		kind: clip.media.type,
		src: clip.media.type === "video" ? clip.media.src : "",
		videoId: clip.media.type === "youtube" ? clip.media.videoId : "",
		poster: clip.media.poster,
	}
}

function toBody(form: Form) {
	const media =
		form.kind === "youtube"
			? { type: "youtube", videoId: form.videoId, poster: form.poster }
			: { type: "video", src: form.src, poster: form.poster }

	return {
		title: form.title,
		composer: form.composer,
		date: form.date,
		lengthLabel: form.lengthLabel,
		note: form.note,
		media,
	}
}

export function PianoPanel({ files, onReadonly }: { files: MediaFile[]; onReadonly: () => void }) {
	const [clips, setClips] = useState<Clip[]>([])
	const [form, setForm] = useState<Form>(EMPTY_FORM)
	const [practicing, setPracticing] = useState<Practicing>({ piece: "", composer: "", since: today(), note: "" })
	const [recordings, setRecordings] = useState<Recording[]>([])
	const [repertoire, setRepertoire] = useState<RepertoireItem[]>([])
	const [error, setError] = useState("")
	const [busy, setBusy] = useState(false)

	const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm((before) => ({ ...before, [key]: value }))

	const load = useCallback(async () => {
		const clipResult = await send<{ clips: Clip[] }>("/api/performances", "GET")
		const musicResult = await send<{ music: Music }>("/api/music", "GET")

		if (clipResult.ok) {
			setClips(clipResult.data.clips)
		}

		if (musicResult.ok) {
			const music = musicResult.data.music
			const found = music.practicing
			setPracticing({ piece: found?.piece ?? "", composer: found?.composer ?? "", since: found?.since ?? today(), note: found?.note ?? "" })
			setRecordings(music.recordings)
			setRepertoire(music.repertoire)
		}
	}, [])

	useEffect(() => {
		void load()
	}, [load])

	const fail = (message: string, status: number) => {
		setError(message)

		if (status === 409) {
			onReadonly()
		}
	}

	const submit = async (event: React.FormEvent) => {
		event.preventDefault()
		setBusy(true)
		setError("")

		const result = form.id
			? await send<{ clip: Clip }>("/api/performances", "PATCH", { id: form.id, ...toBody(form) })
			: await send<{ clip: Clip }>("/api/performances", "POST", toBody(form))

		setBusy(false)

		if (!result.ok) {
			fail(result.error, result.status)

			return
		}

		setForm(EMPTY_FORM)
		await load()
	}

	const remove = async (id: string) => {
		setError("")
		const result = await send(`/api/performances?id=${encodeURIComponent(id)}`, "DELETE")

		if (!result.ok) {
			fail(result.error, result.status)

			return
		}

		if (form.id === id) {
			setForm(EMPTY_FORM)
		}

		await load()
	}

	const savePracticing = async (event: React.FormEvent) => {
		event.preventDefault()
		setBusy(true)
		setError("")

		const result = await send("/api/music", "PATCH", { practicing })
		setBusy(false)

		if (!result.ok) {
			fail(result.error, result.status)
		}
	}

	// 録音とレパートリーは配列ごと送る。保存後に読み直して並びを揃える。
	const saveList = async (body: { recordings: Recording[] } | { repertoire: RepertoireItem[] }) => {
		setBusy(true)
		setError("")

		const result = await send<{ music: Music }>("/api/music", "PATCH", body)
		setBusy(false)

		if (!result.ok) {
			fail(result.error, result.status)

			return
		}

		setRecordings(result.data.music.recordings)
		setRepertoire(result.data.music.repertoire)
	}

	const ready = form.title.trim() !== "" && (form.kind === "youtube" ? form.videoId.trim() !== "" : form.src.trim() !== "")

	return (
		<div className="stack">
			<form className="panel stack" onSubmit={submit}>
				<p className="mono">{form.id ? "演奏映像を編集" : "演奏映像を追加"}</p>
				<div className="admin-row">
					<label className="field">
						<span>曲名</span>
						<input className="input" value={form.title} onChange={(event) => set("title", event.target.value)} />
					</label>
					<label className="field">
						<span>作曲者</span>
						<input className="input" value={form.composer} placeholder="F. Chopin / original" onChange={(event) => set("composer", event.target.value)} />
					</label>
				</div>
				<div className="admin-row">
					<label className="field">
						<span>日付</span>
						<input className="input" type="date" value={form.date} onChange={(event) => set("date", event.target.value)} />
					</label>
					<label className="field">
						<span>長さ（表示用）</span>
						<input className="input" value={form.lengthLabel} placeholder="4:32" onChange={(event) => set("lengthLabel", event.target.value)} />
					</label>
					<label className="field">
						<span>種類</span>
						<select className="select" value={form.kind} onChange={(event) => set("kind", event.target.value as ClipMedia["type"])}>
							<option value="video">動画ファイル（mp4）</option>
							<option value="youtube">YouTube</option>
						</select>
					</label>
				</div>
				{form.kind === "video" ? (
					<MediaField label="動画のパス" value={form.src} kinds={["video"]} files={files} placeholder="/media/nocturne.mp4" onChange={(value) => set("src", value)} />
				) : (
					<label className="field">
						<span>YouTube の URL または ID</span>
						<input
							className="input"
							value={form.videoId}
							placeholder="https://www.youtube.com/watch?v=xxxxxxxxxxx"
							onChange={(event) => set("videoId", event.target.value)}
						/>
					</label>
				)}
				<MediaField
					label={form.kind === "youtube" ? "サムネイル画像（空なら YouTube のサムネを使う）" : "サムネイル画像"}
					value={form.poster}
					kinds={["image"]}
					files={files}
					placeholder="/media/nocturne.jpg"
					onChange={(value) => set("poster", value)}
				/>
				<label className="field">
					<span>ひとことメモ</span>
					<textarea className="textarea" rows={2} maxLength={NOTE_MAX} value={form.note} onChange={(event) => set("note", event.target.value)} />
				</label>
				{error ? <p className="alert alert-bad">{error}</p> : null}
				<div className="admin-actions">
					<button className="btn btn-primary" type="submit" disabled={busy || !ready}>
						{form.id ? "保存" : "追加"}
					</button>
					{form.id ? (
						<button className="btn btn-quiet" type="button" onClick={() => setForm(EMPTY_FORM)}>
							新規に戻す
						</button>
					) : null}
				</div>
			</form>

			{clips.length === 0 ? (
				<p className="empty">演奏映像はまだありません。</p>
			) : (
				<ul className="rows">
					{clips.map((clip) => (
						<li className="row" key={clip.id}>
							<span className="admin-thumb">
								{/* eslint-disable-next-line @next/next/no-img-element */}
								<img src={clip.media.poster} alt="" />
							</span>
							<span className="row-main">
								<span>{clip.title}</span>
								<span className="row-note">
									{clip.composer} / {clip.date} / {clip.media.type === "youtube" ? `YouTube: ${clip.media.videoId}` : clip.media.src}
								</span>
							</span>
							<button className="btn" type="button" onClick={() => setForm(toForm(clip))}>
								編集
							</button>
							<button className="btn btn-danger" type="button" onClick={() => remove(clip.id)}>
								削除
							</button>
						</li>
					))}
				</ul>
			)}

			<form className="panel stack" onSubmit={savePracticing}>
				<p className="mono">いま練習している曲</p>
				<div className="admin-row">
					<label className="field">
						<span>曲名（空にすると非表示）</span>
						<input className="input" value={practicing.piece} onChange={(event) => setPracticing({ ...practicing, piece: event.target.value })} />
					</label>
					<label className="field">
						<span>作曲者</span>
						<input className="input" value={practicing.composer} onChange={(event) => setPracticing({ ...practicing, composer: event.target.value })} />
					</label>
					<label className="field">
						<span>開始日</span>
						<input className="input" type="date" value={practicing.since} onChange={(event) => setPracticing({ ...practicing, since: event.target.value })} />
					</label>
				</div>
				<label className="field">
					<span>メモ</span>
					<input className="input" value={practicing.note ?? ""} onChange={(event) => setPracticing({ ...practicing, note: event.target.value })} />
				</label>
				<button className="btn btn-primary" type="submit" disabled={busy}>
					練習中を更新
				</button>
			</form>

			<RecordingsEditor rows={recordings} files={files} busy={busy} onSave={(rows) => saveList({ recordings: rows })} />
			<RepertoireEditor rows={repertoire} busy={busy} onSave={(rows) => saveList({ repertoire: rows })} />
		</div>
	)
}
