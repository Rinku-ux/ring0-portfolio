import { authorized, deny, readonly, refresh } from "@/lib/admin/api"
import { getMusic, setPracticing, setRecordings, setRepertoire } from "@/lib/music"
import { ReadonlyStoreError } from "@/lib/notes/types"
import { resolveStoreMode } from "@/lib/store"

type Payload = { practicing?: unknown; recordings?: unknown; repertoire?: unknown }

export async function GET() {
	if (!(await authorized())) {
		return deny()
	}

	return Response.json({ mode: resolveStoreMode(), music: getMusic() })
}

/*
 * 練習中・録音・レパートリーを差し替える。
 * 届いたキーだけ触る。録音とレパートリーは配列ごと置き換え。
 */
export async function PATCH(request: Request) {
	if (!(await authorized())) {
		return deny()
	}

	const payload = (await request.json().catch(() => null)) as Payload | null

	if (!payload) {
		return Response.json({ error: "内容がありません。" }, { status: 400 })
	}

	try {
		if ("practicing" in payload) {
			setPracticing(payload.practicing ?? null)
		}

		if ("recordings" in payload) {
			setRecordings(payload.recordings)
		}

		if ("repertoire" in payload) {
			setRepertoire(payload.repertoire)
		}

		refresh()

		return Response.json({ music: getMusic() })
	} catch (error) {
		if (error instanceof ReadonlyStoreError) {
			return readonly()
		}

		throw error
	}
}
