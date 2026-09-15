import { cookies } from "next/headers"
import { SESSION_COOKIE, SESSION_TTL_SECONDS, checkKey, createToken, isConfigured, verifyToken } from "@/lib/auth"

const BAD_REQUEST = 400
const UNAUTHORIZED = 401
const NO_CONTENT = 204
const UNAVAILABLE = 503

export async function GET() {
	const jar = await cookies()

	return Response.json({
		configured: isConfigured(),
		signedIn: verifyToken(jar.get(SESSION_COOKIE)?.value) === "valid",
	})
}

export async function POST(request: Request) {
	const body = (await request.json().catch(() => null)) as { key?: unknown } | null

	if (typeof body?.key !== "string") {
		return Response.json({ error: "パスワードを入力してください。" }, { status: BAD_REQUEST })
	}

	const result = checkKey(body.key)

	if (result === "unconfigured") {
		return Response.json({ error: "ADMIN_PASSWORD が未設定です。" }, { status: UNAVAILABLE })
	}

	if (result === "invalid") {
		return Response.json({ error: "パスワードが違います。" }, { status: UNAUTHORIZED })
	}

	const jar = await cookies()
	jar.set(SESSION_COOKIE, createToken(), {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "strict",
		path: "/",
		maxAge: SESSION_TTL_SECONDS,
	})

	return new Response(null, { status: NO_CONTENT })
}

export async function DELETE() {
	const jar = await cookies()
	jar.delete(SESSION_COOKIE)

	return new Response(null, { status: NO_CONTENT })
}
