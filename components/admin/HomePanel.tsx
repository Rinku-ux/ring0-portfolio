"use client"

import { useCallback, useEffect, useState } from "react"
import type { MediaFile } from "@/lib/media"
import type { SiteContent } from "@/lib/site-content"
import { MediaField } from "./MediaField"
import { CONFLICT, send } from "./helpers"

const BLANK: SiteContent = {
	reel: { youtubeId: "", src: "", poster: "/media/placeholder-reel.png", title: "", note: "" },
	status: "",
	pianoLede: "",
}

/*
 * トップの大きい映像（リール）とテキスト。
 * 動画のパスが空のあいだは静止画のまま「reel 準備中」と出る仕組み。
 */
export function HomePanel({ files, onReadonly }: { files: MediaFile[]; onReadonly: () => void }) {
	const [content, setContent] = useState<SiteContent>(BLANK)
	const [error, setError] = useState("")
	const [saved, setSaved] = useState("")
	const [busy, setBusy] = useState(false)

	const load = useCallback(async () => {
		const result = await send<{ content: SiteContent }>("/api/site", "GET")

		if (result.ok) {
			setContent(result.data.content)
		}
	}, [])

	useEffect(() => {
		void load()
	}, [load])

	const setReel = (key: keyof SiteContent["reel"], value: string) =>
		setContent((before) => ({ ...before, reel: { ...before.reel, [key]: value } }))

	const submit = async (event: React.FormEvent) => {
		event.preventDefault()
		setBusy(true)
		setError("")
		setSaved("")

		const result = await send<{ content: SiteContent }>("/api/site", "PATCH", content)
		setBusy(false)

		if (!result.ok) {
			setError(result.error)

			if (result.status === CONFLICT) {
				onReadonly()
			}

			return
		}

		setContent(result.data.content)
		setSaved("保存しました。トップに反映されます。")
	}

	const onYouTube = content.reel.youtubeId.trim() !== ""
	const onFile = content.reel.src.trim() !== ""
	const hint = onYouTube
		? "YouTube 優先: サムネイルをクリックすると再生します（限定公開の動画でも OK）。"
		: onFile
			? "mp4 を無音ループで自動再生します。重い動画は YouTube のほうが軽いです。"
			: "動画が未設定なので、いまは静止画＋「reel 準備中」の表示です。YouTube の URL を貼るか、Media タブで mp4 を上げて選んでください。"

	return (
		<form className="panel stack" onSubmit={submit}>
			<p className="mono">トップの大きい映像（reel）</p>
			<p className="row-note">{hint}</p>
			<label className="field">
				<span>YouTube の URL または ID（最優先・空で無効）</span>
				<input
					className="input"
					value={content.reel.youtubeId}
					placeholder="https://www.youtube.com/watch?v=xxxxxxxxxxx"
					onChange={(event) => setReel("youtubeId", event.target.value)}
				/>
			</label>
			<MediaField
				label="動画のパス（空にすると静止画のまま）"
				value={content.reel.src}
				kinds={["video"]}
				files={files}
				placeholder="/media/showreel.mp4"
				onChange={(value) => setReel("src", value)}
			/>
			<MediaField
				label="静止画（ポスター。YouTube なら空でサムネ自動）"
				value={content.reel.poster}
				kinds={["image"]}
				files={files}
				onChange={(value) => setReel("poster", value)}
			/>
			<div className="admin-row">
				<label className="field">
					<span>映像の見出し</span>
					<input className="input" value={content.reel.title} placeholder="Showreel 2026" onChange={(event) => setReel("title", event.target.value)} />
				</label>
				<label className="field">
					<span>映像の小見出し</span>
					<input className="input" value={content.reel.note} placeholder="latest work" onChange={(event) => setReel("note", event.target.value)} />
				</label>
			</div>

			<p className="mono">テキスト</p>
			<label className="field">
				<span>ヒーローのバッジ</span>
				<input className="input" value={content.status} onChange={(event) => setContent({ ...content, status: event.target.value })} />
			</label>
			<label className="field">
				<span>Piano セクションの前振り</span>
				<textarea className="textarea" rows={2} value={content.pianoLede} onChange={(event) => setContent({ ...content, pianoLede: event.target.value })} />
			</label>

			{error ? <p className="alert alert-bad">{error}</p> : null}
			{saved ? <p className="alert">{saved}</p> : null}
			<button className="btn btn-primary" type="submit" disabled={busy}>
				保存
			</button>
		</form>
	)
}
