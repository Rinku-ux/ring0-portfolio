"use client"

import { useCallback, useEffect, useState } from "react"
import { HomePanel } from "@/components/admin/HomePanel"
import { MediaPanel } from "@/components/admin/MediaPanel"
import { NotesPanel } from "@/components/admin/NotesPanel"
import { PianoPanel } from "@/components/admin/PianoPanel"
import { WorkPanel } from "@/components/admin/WorkPanel"
import { UNAVAILABLE, readFail } from "@/components/admin/helpers"
import type { MediaFile } from "@/lib/media"
import type { StoreMode } from "@/lib/notes/types"

const TABS = [
	{ id: "home", label: "Home" },
	{ id: "piano", label: "Piano" },
	{ id: "work", label: "Work" },
	{ id: "media", label: "Media" },
	{ id: "notes", label: "Notes" },
] as const

type Tab = (typeof TABS)[number]["id"]
type Phase = "checking" | "locked" | "unlocked"

export default function AdminPage() {
	const [phase, setPhase] = useState<Phase>("checking")
	const [configured, setConfigured] = useState(true)
	const [mode, setMode] = useState<StoreMode>("file")
	const [tab, setTab] = useState<Tab>("home")
	const [files, setFiles] = useState<MediaFile[]>([])
	const [maxBytes, setMaxBytes] = useState(0)
	const [key, setKey] = useState("")
	const [error, setError] = useState("")
	const [busy, setBusy] = useState(false)

	// メディア一覧は全パネルの入力候補になるので、ここでまとめて持つ。
	const loadMedia = useCallback(async () => {
		const response = await fetch("/api/media")

		if (!response.ok) {
			setPhase("locked")

			return
		}

		const payload = (await response.json()) as { mode: StoreMode; files: MediaFile[]; maxBytes: number }
		setMode(payload.mode)
		setFiles(payload.files)
		setMaxBytes(payload.maxBytes)
		setPhase("unlocked")
	}, [])

	useEffect(() => {
		const check = async () => {
			const response = await fetch("/api/session")
			const payload = (await response.json()) as { configured: boolean; signedIn: boolean }
			setConfigured(payload.configured)

			if (!payload.signedIn) {
				setPhase("locked")

				return
			}

			await loadMedia()
		}

		void check()
	}, [loadMedia])

	const signIn = async (event: React.FormEvent) => {
		event.preventDefault()
		setBusy(true)
		setError("")

		const response = await fetch("/api/session", {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ key }),
		})

		setBusy(false)

		if (!response.ok) {
			setConfigured(response.status !== UNAVAILABLE)
			setError(await readFail(response))

			return
		}

		setKey("")
		await loadMedia()
	}

	const signOut = async () => {
		await fetch("/api/session", { method: "DELETE" })
		setFiles([])
		setPhase("locked")
	}

	if (phase === "checking") {
		return <p className="empty">確認中...</p>
	}

	if (phase === "locked") {
		return (
			<>
				<section className="page-head">
					<p className="mono">admin</p>
					<h1>コンテンツ管理</h1>
					<p>ログインすると演奏映像・作品ページ・メディア・ノートを編集できます。</p>
				</section>
				{configured ? null : <p className="alert alert-bad">ADMIN_PASSWORD が未設定です。.env.local に設定してください。</p>}
				<form className="panel stack" onSubmit={signIn}>
					<label className="field">
						<span>パスワード</span>
						<input className="input" type="password" value={key} onChange={(event) => setKey(event.target.value)} autoComplete="current-password" />
					</label>
					{error ? <p className="alert alert-bad">{error}</p> : null}
					<button className="btn btn-primary" type="submit" disabled={busy || !key}>
						ログイン
					</button>
				</form>
			</>
		)
	}

	const readonly = () => setMode("readonly")

	return (
		<>
			<section className="page-head">
				<p className="mono">admin</p>
				<h1>コンテンツ管理</h1>
				<div className="admin-actions">
					<button className="btn btn-quiet" type="button" onClick={signOut}>
						ログアウト
					</button>
				</div>
			</section>

			{mode === "readonly" ? (
				<p className="alert alert-bad">この環境は読み取り専用です。保存するには CONTENT_STORE=file と書き込めるディスクが必要です。</p>
			) : null}

			<div className="tabs" role="tablist">
				{TABS.map((item) => (
					<button
						className="tab"
						type="button"
						role="tab"
						key={item.id}
						aria-selected={tab === item.id}
						onClick={() => setTab(item.id)}
					>
						{item.label}
					</button>
				))}
			</div>

			{tab === "home" ? <HomePanel files={files} onReadonly={readonly} /> : null}
			{tab === "piano" ? <PianoPanel files={files} onReadonly={readonly} /> : null}
			{tab === "work" ? <WorkPanel files={files} onReadonly={readonly} /> : null}
			{tab === "media" ? <MediaPanel files={files} maxBytes={maxBytes} onChanged={setFiles} onReadonly={readonly} /> : null}
			{tab === "notes" ? <NotesPanel onReadonly={readonly} /> : null}
		</>
	)
}
