"use client"

import { useRef, useState } from "react"
import type { MediaDir, MediaFile } from "@/lib/media"
import { readFail, sizeLabel } from "./helpers"

const MEGA = 1024 * 1024
const CONFLICT = 409

type Props = { files: MediaFile[]; maxBytes: number; onChanged: (files: MediaFile[]) => void; onReadonly: () => void }

/*
 * 動画やポスター画像の置き場。ここに上げたパスが各フォームの候補に出る。
 * 同じ名前で上げると差し替えになる。
 */
export function MediaPanel({ files, maxBytes, onChanged, onReadonly }: Props) {
	const input = useRef<HTMLInputElement>(null)
	const [dir, setDir] = useState<MediaDir>("media")
	const [rename, setRename] = useState("")
	const [error, setError] = useState("")
	const [busy, setBusy] = useState(false)

	const upload = async (event: React.FormEvent) => {
		event.preventDefault()

		const file = input.current?.files?.[0]

		if (!file) {
			return
		}

		setBusy(true)
		setError("")

		const form = new FormData()
		form.set("file", file)
		form.set("dir", dir)

		if (rename.trim() !== "") {
			form.set("name", rename.trim())
		}

		const response = await fetch("/api/media", { method: "POST", body: form })
		setBusy(false)

		if (!response.ok) {
			setError(await readFail(response))

			if (response.status === CONFLICT) {
				onReadonly()
			}

			return
		}

		const payload = (await response.json()) as { files: MediaFile[] }
		onChanged(payload.files)
		setRename("")

		if (input.current) {
			input.current.value = ""
		}
	}

	const remove = async (file: MediaFile) => {
		setError("")
		const response = await fetch(`/api/media?dir=${file.dir}&name=${encodeURIComponent(file.name)}`, { method: "DELETE" })

		if (!response.ok) {
			setError(await readFail(response))

			return
		}

		onChanged(files.filter((item) => item.url !== file.url))
	}

	return (
		<div className="stack">
			<form className="panel stack" onSubmit={upload}>
				<p className="mono">アップロード（{Math.round(maxBytes / MEGA)}MB まで）</p>
				<div className="admin-row">
					<label className="field">
						<span>ファイル</span>
						<input className="input" ref={input} type="file" accept="video/*,image/*,audio/*" />
					</label>
					<label className="field">
						<span>置き場</span>
						<select className="select" value={dir} onChange={(event) => setDir(event.target.value as MediaDir)}>
							<option value="media">public/media（動画・音源・ポスター）</option>
							<option value="covers">public/covers（カードのサムネ）</option>
						</select>
					</label>
					<label className="field">
						<span>保存名（任意）</span>
						<input className="input" value={rename} placeholder="nocturne.mp4" onChange={(event) => setRename(event.target.value)} />
					</label>
				</div>
				{error ? <p className="alert alert-bad">{error}</p> : null}
				<button className="btn btn-primary" type="submit" disabled={busy}>
					{busy ? "アップロード中..." : "アップロード"}
				</button>
			</form>

			{files.length === 0 ? (
				<p className="empty">まだファイルがありません。</p>
			) : (
				<div className="media-grid">
					{files.map((file) => (
						<figure className="media-card" key={file.url}>
							<div className="media-preview">
								{file.kind === "image" ? (
									// eslint-disable-next-line @next/next/no-img-element
									<img src={file.url} alt="" />
								) : null}
								{file.kind === "video" ? <video src={file.url} muted playsInline preload="metadata" /> : null}
								{file.kind === "audio" ? <span className="mono">audio</span> : null}
							</div>
							<figcaption>
								<span className="media-name">{file.name}</span>
								<span className="row-note">
									{file.dir} / {sizeLabel(file.bytes)}
								</span>
							</figcaption>
							<div className="admin-actions">
								<button className="btn btn-quiet" type="button" onClick={() => void navigator.clipboard?.writeText(file.url)}>
									パスをコピー
								</button>
								<button className="btn btn-danger" type="button" onClick={() => remove(file)}>
									削除
								</button>
							</div>
						</figure>
					))}
				</div>
			)}
		</div>
	)
}
