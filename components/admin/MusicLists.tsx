"use client"

import { useEffect, useState } from "react"
import type { MediaFile } from "@/lib/media"
import { REPERTOIRE_LABELS, REPERTOIRE_STATES, type Recording, type RepertoireItem, type RepertoireState } from "@/lib/music-types"
import { MediaField } from "./MediaField"
import { today } from "./helpers"

type Save<T> = (rows: T[]) => Promise<void>

/* 録音（/music の「録音」）。音源が空の行は「録音準備中」として曲名だけ並ぶ。 */
export function RecordingsEditor({ rows, files, busy, onSave }: { rows: Recording[]; files: MediaFile[]; busy: boolean; onSave: Save<Recording> }) {
	const [draft, setDraft] = useState<Recording[]>(rows)

	useEffect(() => {
		setDraft(rows)
	}, [rows])

	const set = (index: number, patch: Partial<Recording>) =>
		setDraft((before) => before.map((row, position) => (position === index ? { ...row, ...patch } : row)))

	return (
		<div className="panel stack">
			<p className="mono">録音</p>
			{draft.map((row, index) => (
				<div className="admin-item" key={row.id}>
					<div className="admin-row">
						<label className="field">
							<span>曲名</span>
							<input className="input" value={row.title} onChange={(event) => set(index, { title: event.target.value })} />
						</label>
						<label className="field">
							<span>作曲者</span>
							<input className="input" value={row.composer} onChange={(event) => set(index, { composer: event.target.value })} />
						</label>
						<label className="field">
							<span>録音日</span>
							<input className="input" type="date" value={row.recordedAt} onChange={(event) => set(index, { recordedAt: event.target.value })} />
						</label>
					</div>
					<div className="admin-row">
						<MediaField
							label="音源（空なら準備中）"
							value={row.src ?? ""}
							kinds={["audio"]}
							files={files}
							placeholder="/media/nocturne.mp3"
							onChange={(value) => set(index, { src: value })}
						/>
						<label className="field">
							<span>メモ</span>
							<input className="input" value={row.note ?? ""} onChange={(event) => set(index, { note: event.target.value })} />
						</label>
					</div>
					<button className="btn btn-danger" type="button" onClick={() => setDraft(draft.filter((_, position) => position !== index))}>
						この行を削除
					</button>
				</div>
			))}
			<div className="admin-actions">
				<button
					className="btn"
					type="button"
					onClick={() => setDraft([{ id: `rec-${Date.now()}`, title: "", composer: "", recordedAt: today() }, ...draft])}
				>
					行を追加
				</button>
				<button className="btn btn-primary" type="button" disabled={busy} onClick={() => void onSave(draft)}>
					録音を保存
				</button>
			</div>
		</div>
	)
}

/* レパートリー（弾ける / 練習中 / やりたい）。 */
export function RepertoireEditor({ rows, busy, onSave }: { rows: RepertoireItem[]; busy: boolean; onSave: Save<RepertoireItem> }) {
	const [draft, setDraft] = useState<RepertoireItem[]>(rows)

	useEffect(() => {
		setDraft(rows)
	}, [rows])

	const set = (index: number, patch: Partial<RepertoireItem>) =>
		setDraft((before) => before.map((row, position) => (position === index ? { ...row, ...patch } : row)))

	return (
		<div className="panel stack">
			<p className="mono">レパートリー</p>
			{draft.map((row, index) => (
				<div className="admin-row" key={`${row.title}-${index}`}>
					<label className="field">
						<span>曲名</span>
						<input className="input" value={row.title} onChange={(event) => set(index, { title: event.target.value })} />
					</label>
					<label className="field">
						<span>作曲者</span>
						<input className="input" value={row.composer} onChange={(event) => set(index, { composer: event.target.value })} />
					</label>
					<label className="field">
						<span>状態</span>
						<select className="select" value={row.state} onChange={(event) => set(index, { state: event.target.value as RepertoireState })}>
							{REPERTOIRE_STATES.map((state) => (
								<option key={state} value={state}>
									{REPERTOIRE_LABELS[state]}
								</option>
							))}
						</select>
					</label>
					<button className="btn btn-danger" type="button" onClick={() => setDraft(draft.filter((_, position) => position !== index))}>
						削除
					</button>
				</div>
			))}
			<div className="admin-actions">
				<button className="btn" type="button" onClick={() => setDraft([...draft, { title: "", composer: "", state: "learning" }])}>
					行を追加
				</button>
				<button className="btn btn-primary" type="button" disabled={busy} onClick={() => void onSave(draft)}>
					レパートリーを保存
				</button>
			</div>
		</div>
	)
}
