import { createHmac, timingSafeEqual } from "node:crypto"

// パスワードはサーバーでしか比較しない。ブラウザには署名付きの期限だけ渡す。
export const SESSION_COOKIE = "ring0_session"
export const SESSION_TTL_SECONDS = 60 * 60 * 12

const SEPARATOR = "."
const HASH = "sha256"
const RADIX = 10
const MILLIS_PER_SECOND = 1000

export type KeyCheck = "ok" | "invalid" | "unconfigured"
export type TokenCheck = "valid" | "invalid"

function secret(): string {
	return process.env.ADMIN_PASSWORD ?? ""
}

export function isConfigured(): boolean {
	return secret() !== ""
}

// 定数時間比較。間違ったパスワードから時間差の手がかりを与えない。
function sameText(left: string, right: string): boolean {
	const a = Buffer.from(left)
	const b = Buffer.from(right)

	return a.length === b.length && timingSafeEqual(a, b)
}

export function checkKey(key: string): KeyCheck {
	if (!isConfigured()) {
		return "unconfigured"
	}

	return sameText(key, secret()) ? "ok" : "invalid"
}

function sign(payload: string): string {
	return createHmac(HASH, secret()).update(payload).digest("hex")
}

function nowSeconds(): number {
	return Math.floor(Date.now() / MILLIS_PER_SECOND)
}

export function createToken(): string {
	const payload = String(nowSeconds() + SESSION_TTL_SECONDS)

	return `${payload}${SEPARATOR}${sign(payload)}`
}

export function verifyToken(token: string | undefined): TokenCheck {
	if (!token || !isConfigured()) {
		return "invalid"
	}

	const [payload, signature] = token.split(SEPARATOR)

	if (!payload || !signature || !sameText(signature, sign(payload))) {
		return "invalid"
	}

	const expiry = Number.parseInt(payload, RADIX)

	return Number.isFinite(expiry) && expiry > nowSeconds() ? "valid" : "invalid"
}
