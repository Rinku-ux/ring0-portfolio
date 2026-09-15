import fs from "node:fs"
import path from "node:path"
import { ReadonlyStoreError } from "./notes/types"
import { isWritable } from "./store"

/*
 * public/media と public/covers の中身。
 * /admin で動画やポスターを差し替えるときの選択肢と、アップロード先。
 */
export const MEDIA_DIRS = ["media", "covers"] as const

export type MediaDir = (typeof MEDIA_DIRS)[number]
export type MediaKindTag = "video" | "image" | "audio"
export type MediaFile = { url: string; name: string; dir: MediaDir; kind: MediaKindTag; bytes: number }

const PUBLIC_DIR = path.join(process.cwd(), "public")
const VIDEO_EXT = [".mp4", ".webm", ".mov"]
const IMAGE_EXT = [".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif", ".svg"]
const AUDIO_EXT = [".mp3", ".m4a", ".wav", ".ogg"]
const SAFE_NAME = /^[a-zA-Z0-9._-]+$/
const NAME_MAX = 80

export const UPLOAD_MAX_BYTES = 200 * 1024 * 1024

export function asMediaDir(value: unknown): MediaDir {
	return MEDIA_DIRS.includes(value as MediaDir) ? (value as MediaDir) : "media"
}

function kindOf(name: string): MediaKindTag | null {
	const ext = path.extname(name).toLowerCase()

	if (VIDEO_EXT.includes(ext)) {
		return "video"
	}

	if (IMAGE_EXT.includes(ext)) {
		return "image"
	}

	if (AUDIO_EXT.includes(ext)) {
		return "audio"
	}

	return null
}

function listDir(dir: MediaDir): MediaFile[] {
	const base = path.join(PUBLIC_DIR, dir)

	try {
		return fs
			.readdirSync(base, { withFileTypes: true })
			.filter((entry) => entry.isFile())
			.flatMap((entry) => {
				const kind = kindOf(entry.name)

				if (!kind) {
					return []
				}

				return [{ url: `/${dir}/${entry.name}`, name: entry.name, dir, kind, bytes: fs.statSync(path.join(base, entry.name)).size }]
			})
			.sort((a, b) => a.name.localeCompare(b.name))
	} catch {
		return []
	}
}

export function listMedia(): MediaFile[] {
	return MEDIA_DIRS.flatMap(listDir)
}

// 名前はそのまま公開 URL になるので、余計な文字とパス区切りを通さない。
export function safeName(input: string): string | null {
	const name = path.basename(input).trim().replaceAll(" ", "-")

	if (!name || name.length > NAME_MAX || !SAFE_NAME.test(name) || name.startsWith(".")) {
		return null
	}

	return kindOf(name) ? name : null
}

export function saveUpload(dir: MediaDir, name: string, bytes: Uint8Array): MediaFile {
	if (!isWritable()) {
		throw new ReadonlyStoreError()
	}

	const base = path.join(PUBLIC_DIR, dir)
	fs.mkdirSync(base, { recursive: true })
	fs.writeFileSync(path.join(base, name), bytes)

	return { url: `/${dir}/${name}`, name, dir, kind: kindOf(name) ?? "image", bytes: bytes.byteLength }
}

export function removeMedia(dir: MediaDir, name: string): boolean {
	if (!isWritable()) {
		throw new ReadonlyStoreError()
	}

	const target = path.join(PUBLIC_DIR, dir, name)

	if (!fs.existsSync(target)) {
		return false
	}

	fs.unlinkSync(target)

	return true
}
