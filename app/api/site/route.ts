import { authorized, deny, readonly, refresh } from "@/lib/admin/api"
import { ReadonlyStoreError } from "@/lib/notes/types"
import { getSiteContent, setSiteContent } from "@/lib/site-content"
import { resolveStoreMode } from "@/lib/store"

export async function GET() {
	if (!(await authorized())) {
		return deny()
	}

	return Response.json({ mode: resolveStoreMode(), content: getSiteContent() })
}

// トップのリール、受付中バッジ、Piano の前振りを書き換える。
export async function PATCH(request: Request) {
	if (!(await authorized())) {
		return deny()
	}

	try {
		const content = setSiteContent(await request.json().catch(() => null))
		refresh()

		return Response.json({ content })
	} catch (error) {
		if (error instanceof ReadonlyStoreError) {
			return readonly()
		}

		throw error
	}
}
