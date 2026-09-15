"use client"

import { useCallback, useEffect, useState } from "react"
import type { MediaFile } from "@/lib/media"
import { KINDS, KIND_LABELS, STATUSES, STATUS_LABELS, type Project } from "@/lib/types"
import { MediaField } from "./MediaField"
import { send } from "./helpers"

type MediaKind = "video" | "youtube" | "image"

type Form = {
	slug: string
	title: string
	summary: string
	kind: string
	year: string
	status: string
	stack: string
	featured: boolean
	playable: boolean
	liveUrl: string
	repoUrl: string
	cover: string
	mediaKind: MediaKind
	video: string
	youtubeId: string
	videoPoster: string
	mediaCaption: string
	body: string
}

function toForm(project: Project): Form {
	const media = project.media

	return {
		slug: project.slug,
		title: project.title,
		summary: project.summary,
		kind: project.kind,
		year: String(project.year),
		status: project.status,
		stack: project.stack.join(", "),
		featured: project.featured,
		playable: project.playable,
		liveUrl: project.liveUrl ?? "",
		repoUrl: project.repoUrl ?? "",
		cover: project.cover,
		mediaKind: media.type,
		video: media.type === "video" ? media.src : "",
		youtubeId: media.type === "youtube" ? media.videoId : "",
		videoPoster: media.type === "image" ? "" : media.poster,
		mediaCaption: project.mediaCaption ?? "",
		body: project.body,
	}
}

function toPatch(form: Form) {
	return {
		slug: form.slug,
		title: form.title,
		summary: form.summary,
		kind: form.kind,
		year: form.year,
		status: form.status,
		stack: form.stack.split(",").map((item) => item.trim()).filter(Boolean),
		featured: form.featured,
		playable: form.playable,
		liveUrl: form.liveUrl,
		repoUrl: form.repoUrl,
		cover: form.cover,
		mediaKind: form.mediaKind,
		video: form.mediaKind === "video" ? form.video : "",
		youtubeId: form.mediaKind === "youtube" ? form.youtubeId : "",
		videoPoster: form.mediaKind === "image" ? "" : form.videoPoster,
		mediaCaption: form.mediaCaption,
		body: form.body,
	}
}

/*
 * content/projects/*.mdx の frontmatter と本文をそのまま編集する。
 * 動画の差し替えは「主役メディア」を選び直すだけで、余ったキーは保存時に消える。
 */
export function WorkPanel({ files, onReadonly }: { files: MediaFile[]; onReadonly: () => void }) {
	const [projects, setProjects] = useState<Project[]>([])
	const [form, setForm] = useState<Form | null>(null)
	const [error, setError] = useState("")
	const [saved, setSaved] = useState("")
	const [busy, setBusy] = useState(false)

	const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm((before) => (before ? { ...before, [key]: value } : before))

	const load = useCallback(async () => {
		const result = await send<{ projects: Project[] }>("/api/projects", "GET")

		if (!result.ok) {
			setError(result.error)

			return
		}

		setProjects(result.data.projects)
		setForm((before) => {
			const pick = result.data.projects.find((project) => project.slug === before?.slug) ?? result.data.projects[0]

			return pick ? toForm(pick) : null
		})
	}, [])

	useEffect(() => {
		void load()
	}, [load])

	const submit = async (event: React.FormEvent) => {
		event.preventDefault()

		if (!form) {
			return
		}

		setBusy(true)
		setError("")
		setSaved("")

		const result = await send<{ projects: Project[] }>("/api/projects", "PATCH", toPatch(form))
		setBusy(false)

		if (!result.ok) {
			setError(result.error)

			if (result.status === 409) {
				onReadonly()
			}

			return
		}

		setProjects(result.data.projects)
		setSaved("保存しました。トップと作品ページに反映されます。")
	}

	const makeFeatured = async () => {
		if (!form) {
			return
		}

		setError("")
		const result = await send<{ projects: Project[] }>("/api/projects", "PATCH", { slug: form.slug, makeFeatured: true })

		if (!result.ok) {
			setError(result.error)

			return
		}

		setProjects(result.data.projects)
		await load()
	}

	if (!form) {
		return <p className="empty">作品が読み込めませんでした。</p>
	}

	return (
		<div className="stack">
			<div className="filters">
				{projects.map((project) => (
					<button
						className="tag"
						type="button"
						key={project.slug}
						aria-current={project.slug === form.slug ? "page" : undefined}
						onClick={() => setForm(toForm(project))}
					>
						{project.title}
						{project.featured ? " ★" : ""}
					</button>
				))}
			</div>

			<form className="panel stack" onSubmit={submit}>
				<p className="mono">{form.slug}.mdx</p>
				<div className="admin-row">
					<label className="field">
						<span>タイトル</span>
						<input className="input" value={form.title} onChange={(event) => set("title", event.target.value)} />
					</label>
					<label className="field">
						<span>種類</span>
						<select className="select" value={form.kind} onChange={(event) => set("kind", event.target.value)}>
							{KINDS.map((kind) => (
								<option key={kind} value={kind}>
									{KIND_LABELS[kind]}
								</option>
							))}
						</select>
					</label>
					<label className="field">
						<span>状態</span>
						<select className="select" value={form.status} onChange={(event) => set("status", event.target.value)}>
							{STATUSES.map((status) => (
								<option key={status} value={status}>
									{STATUS_LABELS[status]}
								</option>
							))}
						</select>
					</label>
					<label className="field">
						<span>年</span>
						<input className="input" value={form.year} onChange={(event) => set("year", event.target.value)} />
					</label>
				</div>
				<label className="field">
					<span>概要</span>
					<textarea className="textarea" rows={2} value={form.summary} onChange={(event) => set("summary", event.target.value)} />
				</label>
				<div className="admin-row">
					<label className="field">
						<span>技術（カンマ区切り）</span>
						<input className="input" value={form.stack} onChange={(event) => set("stack", event.target.value)} />
					</label>
					<label className="field">
						<span>公開 URL</span>
						<input className="input" value={form.liveUrl} onChange={(event) => set("liveUrl", event.target.value)} />
					</label>
					<label className="field">
						<span>リポジトリ URL</span>
						<input className="input" value={form.repoUrl} onChange={(event) => set("repoUrl", event.target.value)} />
					</label>
				</div>

				<p className="mono">主役のメディア</p>
				<div className="admin-row">
					<label className="field">
						<span>種類</span>
						<select className="select" value={form.mediaKind} onChange={(event) => set("mediaKind", event.target.value as MediaKind)}>
							<option value="video">動画ファイル</option>
							<option value="youtube">YouTube</option>
							<option value="image">静止画だけ</option>
						</select>
					</label>
					{form.mediaKind === "video" ? (
						<MediaField label="動画のパス" value={form.video} kinds={["video"]} files={files} placeholder="/media/demo.mp4" onChange={(value) => set("video", value)} />
					) : null}
					{form.mediaKind === "youtube" ? (
						<label className="field">
							<span>YouTube の URL または ID</span>
							<input
								className="input"
								value={form.youtubeId}
								placeholder="https://www.youtube.com/watch?v=xxxxxxxxxxx"
								onChange={(event) => set("youtubeId", event.target.value)}
							/>
						</label>
					) : null}
					{form.mediaKind === "image" ? null : (
						<MediaField
							label={form.mediaKind === "youtube" ? "ポスター画像（空なら YouTube のサムネ）" : "ポスター画像"}
							value={form.videoPoster}
							kinds={["image"]}
							files={files}
							onChange={(value) => set("videoPoster", value)}
						/>
					)}
				</div>
				<div className="admin-row">
					<MediaField label="カード用サムネイル" value={form.cover} kinds={["image"]} files={files} onChange={(value) => set("cover", value)} />
					<label className="field">
						<span>メディアの説明</span>
						<input className="input" value={form.mediaCaption} onChange={(event) => set("mediaCaption", event.target.value)} />
					</label>
				</div>

				<label className="field">
					<span>本文（MDX）</span>
					<textarea className="textarea admin-code" rows={10} value={form.body} onChange={(event) => set("body", event.target.value)} />
				</label>

				<div className="admin-row">
					<label className="admin-check">
						<input type="checkbox" checked={form.playable} onChange={(event) => set("playable", event.target.checked)} />
						<span>その場で遊べる</span>
					</label>
					<label className="admin-check">
						<input type="checkbox" checked={form.featured} onChange={(event) => set("featured", event.target.checked)} />
						<span>トップの注目作</span>
					</label>
				</div>

				{error ? <p className="alert alert-bad">{error}</p> : null}
				{saved ? <p className="alert">{saved}</p> : null}
				<div className="admin-actions">
					<button className="btn btn-primary" type="submit" disabled={busy}>
						保存
					</button>
					<button className="btn" type="button" onClick={makeFeatured} disabled={busy}>
						これをトップの注目作にする
					</button>
				</div>
			</form>
		</div>
	)
}
