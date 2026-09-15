import { cookies } from "next/headers"
import { SESSION_COOKIE, verifyToken } from "@/lib/auth"
import { getNoteStore } from "@/lib/notes/store"
import { ReadonlyStoreError, asNoteTag } from "@/lib/notes/types"

const BAD_REQUEST = 400
const UNAUTHORIZED = 401
const NOT_FOUND = 404
const CONFLICT = 409
const NO_CONTENT = 204
const BODY_MAX = 600

async function authorized(): Promise<boolean> {
	const jar = await cookies()

	return verifyToken(jar.get(SESSION_COOKIE)?.value) === "valid"
}

function deny() {
	return Response.json({ error: "ログインが必要です。" }, { status: UNAUTHORIZED })
}

export async function GET() {
	if (!(await authorized())) {
		return deny()
	}

	const store = getNoteStore()

	return Response.json({ mode: store.mode, notes: store.list() })
}

export async function POST(request: Request) {
	if (!(await authorized())) {
		return deny()
	}

	const payload = (await request.json().catch(() => null)) as { tag?: unknown; body?: unknown } | null
	const body = typeof payload?.body === "string" ? payload.body.trim() : ""

	if (!body || body.length > BODY_MAX) {
		return Response.json({ error: `本文は 1 〜 ${BODY_MAX} 文字で入力してください。` }, { status: BAD_REQUEST })
	}

	try {
		return Response.json({ note: getNoteStore().create({ tag: asNoteTag(payload?.tag), body }) })
	} catch (error) {
		if (error instanceof ReadonlyStoreError) {
			return Response.json({ error: "この環境では保存できません。" }, { status: CONFLICT })
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
		if (getNoteStore().remove(id) === "missing") {
			return Response.json({ error: "対象のノートがありません。" }, { status: NOT_FOUND })
		}

		return new Response(null, { status: NO_CONTENT })
	} catch (error) {
		if (error instanceof ReadonlyStoreError) {
			return Response.json({ error: "この環境では削除できません。" }, { status: CONFLICT })
		}

		throw error
	}
}
