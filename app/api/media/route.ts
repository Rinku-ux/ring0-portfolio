import {
	BAD_REQUEST,
	NOT_FOUND,
	NO_CONTENT,
	PAYLOAD_TOO_LARGE,
	authorized,
	deny,
	readonly,
	refresh,
} from "@/lib/admin/api"
import { UPLOAD_MAX_BYTES, asMediaDir, listMedia, removeMedia, safeName, saveUpload } from "@/lib/media"
import { ReadonlyStoreError } from "@/lib/notes/types"
import { resolveStoreMode } from "@/lib/store"

const MEGA = 1024 * 1024

export async function GET() {
	if (!(await authorized())) {
		return deny()
	}

	return Response.json({ mode: resolveStoreMode(), files: listMedia(), maxBytes: UPLOAD_MAX_BYTES })
}

// public/media（または public/covers）へ動画・画像・音声を置く。
export async function POST(request: Request) {
	if (!(await authorized())) {
		return deny()
	}

	const form = await request.formData().catch(() => null)
	const file = form?.get("file")

	if (!(file instanceof File)) {
		return Response.json({ error: "ファイルを選んでください。" }, { status: BAD_REQUEST })
	}

	if (file.size > UPLOAD_MAX_BYTES) {
		return Response.json({ error: `${Math.round(UPLOAD_MAX_BYTES / MEGA)}MB までです。` }, { status: PAYLOAD_TOO_LARGE })
	}

	const rename = form?.get("name")
	const name = safeName(typeof rename === "string" && rename.trim() !== "" ? rename : file.name)

	if (!name) {
		return Response.json({ error: "使える拡張子は mp4 / webm / jpg / png / webp / mp3 などです。名前は半角英数字で。" }, { status: BAD_REQUEST })
	}

	try {
		const saved = saveUpload(asMediaDir(form?.get("dir")), name, new Uint8Array(await file.arrayBuffer()))
		refresh()

		return Response.json({ file: saved, files: listMedia() })
	} catch (error) {
		if (error instanceof ReadonlyStoreError) {
			return readonly()
		}

		throw error
	}
}

export async function DELETE(request: Request) {
	if (!(await authorized())) {
		return deny()
	}

	const params = new URL(request.url).searchParams
	const name = safeName(params.get("name") ?? "")

	if (!name) {
		return Response.json({ error: "name が必要です。" }, { status: BAD_REQUEST })
	}

	try {
		if (!removeMedia(asMediaDir(params.get("dir")), name)) {
			return Response.json({ error: "そのファイルはありません。" }, { status: NOT_FOUND })
		}

		refresh()

		return new Response(null, { status: NO_CONTENT })
	} catch (error) {
		if (error instanceof ReadonlyStoreError) {
			return readonly()
		}

		throw error
	}
}
