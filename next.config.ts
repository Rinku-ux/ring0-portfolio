import type { NextConfig } from "next"

const HEADERS = [
	{ key: "X-Content-Type-Options", value: "nosniff" },
	{ key: "X-Frame-Options", value: "SAMEORIGIN" },
	{ key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
	{ key: "Permissions-Policy", value: "camera=(), geolocation=(), microphone=()" },
]

const config: NextConfig = {
	poweredByHeader: false,
	// YouTube のサムネイルをそのまま使えるようにしておく。
	images: { formats: ["image/avif", "image/webp"], remotePatterns: [{ protocol: "https", hostname: "i.ytimg.com" }] },
	async headers() {
		return [{ source: "/:path*", headers: HEADERS }]
	},
}

export default config
