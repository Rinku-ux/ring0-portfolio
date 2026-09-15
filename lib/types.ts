export const KINDS = ["game", "tool", "music", "experiment"] as const
export const STATUSES = ["live", "wip", "archive"] as const

export type Kind = (typeof KINDS)[number]
export type Status = (typeof STATUSES)[number]

export const KIND_LABELS: Record<Kind, string> = { game: "ゲーム", tool: "ツール", music: "音楽", experiment: "実験" }
export const STATUS_LABELS: Record<Status, string> = { live: "公開中", wip: "制作中", archive: "アーカイブ" }

// 作品ごとに主役のメディアは一つだけ。
export type Media =
	| { type: "video"; src: string; poster: string }
	| { type: "youtube"; videoId: string; poster: string }
	| { type: "image"; src: string }

export type Project = {
	slug: string
	title: string
	summary: string
	kind: Kind
	status: Status
	year: number
	stack: string[]
	cover: string
	liveUrl?: string
	repoUrl?: string
	featured: boolean
	playable: boolean
	media: Media
	mediaCaption?: string
	body: string
}
