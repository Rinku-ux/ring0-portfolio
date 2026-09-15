import fs from "node:fs"
import path from "node:path"
import matter from "gray-matter"
import { ReadonlyStoreError } from "./notes/types"
import { isWritable } from "./store"
import { KINDS, STATUSES, type Kind, type Media, type Project, type Status } from "./types"
import { parseYouTubeId, youTubeThumb } from "./youtube"

const DIR = path.join(process.cwd(), "content/projects")
const EXT = ".mdx"
const FALLBACK_COVER = "/covers/crafttown.jpg"

type Front = Record<string, unknown>

let cache: Project[] | null = null

function text(value: unknown, fallback = ""): string {
	return typeof value === "string" && value !== "" ? value : fallback
}

function asKind(value: unknown): Kind {
	return KINDS.includes(value as Kind) ? (value as Kind) : "experiment"
}

function asStatus(value: unknown): Status {
	return STATUSES.includes(value as Status) ? (value as Status) : "wip"
}

// 自前動画 > YouTube > 静止画の順で主役を決める。
function pickMedia(front: Front, cover: string): Media {
	const poster = text(front.videoPoster, cover)

	if (text(front.video) !== "") {
		return { type: "video", src: text(front.video), poster }
	}

	const videoId = parseYouTubeId(front.youtubeId)

	if (videoId !== "") {
		// ポスター未指定なら YouTube のサムネイルをそのまま使う。
		return { type: "youtube", videoId, poster: text(front.videoPoster, youTubeThumb(videoId)) }
	}

	return { type: "image", src: cover }
}

function read(file: string): Project {
	const { data, content } = matter(fs.readFileSync(path.join(DIR, file), "utf8"))
	const front = data as Front
	const slug = text(front.slug, file.replace(EXT, ""))
	const cover = text(front.cover, FALLBACK_COVER)

	return {
		slug,
		title: text(front.title, slug),
		summary: text(front.summary),
		kind: asKind(front.kind),
		status: asStatus(front.status),
		year: Number(front.year) || new Date().getFullYear(),
		stack: Array.isArray(front.stack) ? front.stack.map(String) : [],
		cover,
		liveUrl: text(front.liveUrl) || undefined,
		repoUrl: text(front.repoUrl) || undefined,
		featured: front.featured === true,
		playable: front.playable === true,
		media: pickMedia(front, cover),
		mediaCaption: text(front.mediaCaption) || undefined,
		body: content.trim(),
	}
}

export function getProjects(): Project[] {
	if (cache) {
		return cache
	}

	let files: string[] = []

	try {
		files = fs.readdirSync(DIR).filter((file) => file.endsWith(EXT))
	} catch {
		return []
	}

	// 注目作 -> 新しい年 -> 名前順。
	cache = files
		.map(read)
		.sort((a, b) => Number(b.featured) - Number(a.featured) || b.year - a.year || a.title.localeCompare(b.title))

	return cache
}

export function getProject(slug: string): Project | undefined {
	return getProjects().find((project) => project.slug === slug)
}

export function getFeatured(): Project | undefined {
	const projects = getProjects()

	return projects.find((project) => project.featured) ?? projects[0]
}

/* ---------------- /admin からの編集 ---------------- */

export const MEDIA_KINDS = ["video", "youtube", "image"] as const

export type MediaKind = (typeof MEDIA_KINDS)[number]

// 編集フォームから届く値。未定義のキーは触らない。
export type ProjectPatch = {
	title?: string
	summary?: string
	kind?: string
	year?: number | string
	status?: string
	stack?: string[]
	featured?: boolean
	playable?: boolean
	liveUrl?: string
	repoUrl?: string
	cover?: string
	mediaKind?: string
	video?: string
	youtubeId?: string
	videoPoster?: string
	mediaCaption?: string
	body?: string
}

type Raw = { file: string; data: Front; content: string }

function findFile(slug: string): Raw | null {
	let files: string[] = []

	try {
		files = fs.readdirSync(DIR).filter((file) => file.endsWith(EXT))
	} catch {
		return null
	}

	for (const file of files) {
		const { data, content } = matter(fs.readFileSync(path.join(DIR, file), "utf8"))
		const front = data as Front

		if (text(front.slug, file.replace(EXT, "")) === slug) {
			return { file, data: front, content }
		}
	}

	return null
}

function put(data: Front, key: string, value: string | undefined): void {
	if (value === undefined) {
		return
	}

	// 空文字は「この項目を消す」の意味にする。
	if (value.trim() === "") {
		delete data[key]

		return
	}

	data[key] = value.trim()
}

// video / youtubeId / cover のどれを主役にするかで、余りのキーを消す。
function applyMediaKind(data: Front, kind: MediaKind): void {
	if (kind === "video") {
		delete data.youtubeId

		return
	}

	if (kind === "youtube") {
		delete data.video

		return
	}

	delete data.video
	delete data.youtubeId
	delete data.videoPoster
}

export function updateProject(slug: string, patch: ProjectPatch): Project | null {
	if (!isWritable()) {
		throw new ReadonlyStoreError()
	}

	const raw = findFile(slug)

	if (!raw) {
		return null
	}

	const { file, data } = raw

	put(data, "title", patch.title)
	put(data, "summary", patch.summary)
	put(data, "liveUrl", patch.liveUrl)
	put(data, "repoUrl", patch.repoUrl)
	put(data, "cover", patch.cover)
	put(data, "video", patch.video)
	// URL を貼られても ID だけ残す。
	put(data, "youtubeId", patch.youtubeId === undefined ? undefined : parseYouTubeId(patch.youtubeId) || patch.youtubeId)
	put(data, "videoPoster", patch.videoPoster)
	put(data, "mediaCaption", patch.mediaCaption)

	if (patch.kind !== undefined && KINDS.includes(patch.kind as Kind)) {
		data.kind = patch.kind
	}

	if (patch.status !== undefined && STATUSES.includes(patch.status as Status)) {
		data.status = patch.status
	}

	if (patch.year !== undefined && Number(patch.year) > 0) {
		data.year = Number(patch.year)
	}

	if (Array.isArray(patch.stack)) {
		data.stack = patch.stack.map(String).map((item) => item.trim()).filter(Boolean)
	}

	if (typeof patch.featured === "boolean") {
		data.featured = patch.featured
	}

	if (typeof patch.playable === "boolean") {
		data.playable = patch.playable
	}

	if (patch.mediaKind !== undefined && MEDIA_KINDS.includes(patch.mediaKind as MediaKind)) {
		applyMediaKind(data, patch.mediaKind as MediaKind)
	}

	const body = typeof patch.body === "string" ? patch.body.trim() : raw.content.trim()
	fs.writeFileSync(path.join(DIR, file), matter.stringify(`\n${body}\n`, data), "utf8")

	// 一覧はプロセス内でキャッシュしているので捨てる。
	cache = null

	return getProject(slug) ?? null
}

// 注目作は 1 つだけにする。切り替えたら他を下ろす。
export function setFeatured(slug: string): Project | null {
	const target = getProject(slug)

	if (!target) {
		return null
	}

	for (const project of getProjects()) {
		if (project.featured && project.slug !== slug) {
			updateProject(project.slug, { featured: false })
		}
	}

	return updateProject(slug, { featured: true })
}

export function getNeighbors(slug: string): { prev?: Project; next?: Project } {
	const projects = getProjects()
	const index = projects.findIndex((project) => project.slug === slug)

	if (index < 0) {
		return {}
	}

	return { prev: projects[index - 1], next: projects[index + 1] }
}
