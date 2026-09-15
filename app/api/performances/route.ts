import { BAD_REQUEST, NOT_FOUND, NO_CONTENT, authorized, deny, readonly, refresh } from "@/lib/admin/api"
import { ReadonlyStoreError } from "@/lib/notes/types"
import { createClip, getClips, normalizeDraft, removeClip, updateClip } from "@/lib/performances"
import { resolveStoreMode } from "@/lib/store"

const INVALID = "タイトルと、動画の場所（mp4 のパスか YouTube の ID）が必要です。"

export async function GET() {
	if (!(await authorized())) {
		return deny()
	}

	return Response.json({ mode: resolveStoreMode(), clips: getClips() })
}

export async function POST(request: Request) {
	if (!(await authorized())) {
		return deny()
	}

	const draft = normalizeDraft(await request.json().catch(() => null))

	if (!draft) {
		return Response.json({ error: INVALID }, { status: BAD_REQUEST })
	}

	try {
		const clip = createClip(draft)
		refresh()

		return Response.json({ clip })
	} catch (error) {
		if (error instanceof ReadonlyStoreError) {
			return readonly()
		}

		throw error
	}
}

export async function PATCH(request: Request) {
	if (!(await authorized())) {
		return deny()
	}

	const payload = (await request.json().catch(() => null)) as { id?: unknown } | null
	const id = typeof payload?.id === "string" ? payload.id : ""
	const draft = normalizeDraft(payload)

	if (!id || !draft) {
		return Response.json({ error: INVALID }, { status: BAD_REQUEST })
	}

	try {
		const clip = updateClip(id, draft)

		if (!clip) {
			return Response.json({ error: "対象の演奏映像がありません。" }, { status: NOT_FOUND })
		}

		refresh()

		return Response.json({ clip })
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

	const id = new URL(request.url).searchParams.get("id")

	if (!id) {
		return Response.json({ error: "id が必要です。" }, { status: BAD_REQUEST })
	}

	try {
		if (!removeClip(id)) {
			return Response.json({ error: "対象の演奏映像がありません。" }, { status: NOT_FOUND })
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
