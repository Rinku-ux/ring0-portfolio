/* /admin のクライアント側で使い回す小物。 */

export const CONFLICT = 409
export const UNAVAILABLE = 503

export type Result<T> = { ok: true; data: T } | { ok: false; error: string; status: number }

export async function readFail(response: Response): Promise<string> {
	const payload = (await response.json().catch(() => null)) as { error?: string } | null

	return payload?.error ?? "失敗しました。"
}

export async function send<T>(url: string, method: string, body?: unknown): Promise<Result<T>> {
	const response = await fetch(url, {
		method,
		...(body === undefined ? {} : { headers: { "content-type": "application/json" }, body: JSON.stringify(body) }),
	})

	if (!response.ok) {
		return { ok: false, error: await readFail(response), status: response.status }
	}

	if (response.status === 204) {
		return { ok: true, data: undefined as T }
	}

	return { ok: true, data: (await response.json()) as T }
}

export function today(): string {
	return new Date().toISOString().slice(0, 10)
}

export function sizeLabel(bytes: number): string {
	const mega = bytes / (1024 * 1024)

	return mega >= 1 ? `${mega.toFixed(1)}MB` : `${Math.max(1, Math.round(bytes / 1024))}KB`
}
