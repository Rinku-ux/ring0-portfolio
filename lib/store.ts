import type { StoreMode } from "./notes/types"

/*
 * 原稿ファイルへ書き込んでよい環境かどうか。
 * サーバーレスのディスクは毎回捨てられるので、本番の既定は読み取り専用。
 * CONTENT_STORE（無ければ NOTES_STORE）で明示できる。
 */
export function resolveStoreMode(): StoreMode {
	const raw = process.env.CONTENT_STORE ?? process.env.NOTES_STORE

	if (raw === "file" || raw === "readonly") {
		return raw
	}

	return process.env.NODE_ENV === "production" ? "readonly" : "file"
}

export function isWritable(): boolean {
	return resolveStoreMode() === "file"
}
