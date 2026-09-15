import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { SESSION_COOKIE, verifyToken } from "../auth"

/* /api/* の共通処理。認可と、書き換えたあとのページ再生成。 */

export const BAD_REQUEST = 400
export const UNAUTHORIZED = 401
export const NOT_FOUND = 404
export const CONFLICT = 409
export const PAYLOAD_TOO_LARGE = 413
export const NO_CONTENT = 204

const CONTENT_PATHS = ["/", "/work", "/music", "/notes", "/sitemap.xml", "/feed.xml"]

export async function authorized(): Promise<boolean> {
	const jar = await cookies()

	return verifyToken(jar.get(SESSION_COOKIE)?.value) === "valid"
}

export function deny(): Response {
	return Response.json({ error: "ログインが必要です。" }, { status: UNAUTHORIZED })
}

export function readonly(): Response {
	return Response.json({ error: "この環境では保存できません（CONTENT_STORE=file が必要）。" }, { status: CONFLICT })
}

// 静的に書き出したページは、原稿を書き換えたら作り直す。
export function refresh(extra: string[] = []): void {
	for (const target of [...CONTENT_PATHS, ...extra]) {
		revalidatePath(target)
	}
}
