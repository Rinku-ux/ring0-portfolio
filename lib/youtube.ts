/*
 * YouTube の ID 周り。
 * 限定公開（unlisted）の動画は埋め込み再生できるので、
 * /admin では URL を貼るだけで済むように、ここで ID を取り出す。
 * ※「非公開（private）」は埋め込めないので限定公開にする。
 */
const ID_LENGTH = 11
const ID_PATTERN = /^[A-Za-z0-9_-]{11}$/
const HOSTS = ["youtube.com", "www.youtube.com", "m.youtube.com", "youtube-nocookie.com", "www.youtube-nocookie.com"]
const PATH_PREFIXES = ["/embed/", "/shorts/", "/live/", "/v/"]

export const THUMB_HOST = "https://i.ytimg.com"

function fromPath(pathname: string): string {
	for (const prefix of PATH_PREFIXES) {
		if (pathname.startsWith(prefix)) {
			return pathname.slice(prefix.length).split("/")[0] ?? ""
		}
	}

	return ""
}

// 生の ID、watch URL、youtu.be、shorts、embed を受け取る。
export function parseYouTubeId(input: unknown): string {
	const raw = typeof input === "string" ? input.trim() : ""

	if (raw === "") {
		return ""
	}

	if (ID_PATTERN.test(raw)) {
		return raw
	}

	let url: URL

	try {
		url = new URL(raw.startsWith("http") ? raw : `https://${raw}`)
	} catch {
		return ""
	}

	const host = url.hostname
	let candidate = ""

	if (host === "youtu.be") {
		candidate = url.pathname.slice(1).split("/")[0] ?? ""
	} else if (HOSTS.includes(host)) {
		candidate = url.searchParams.get("v") ?? fromPath(url.pathname)
	}

	candidate = candidate.slice(0, ID_LENGTH)

	return ID_PATTERN.test(candidate) ? candidate : ""
}

// サムネイルは YouTube 側のものをそのまま使える（自分で画像を作らなくてよい）。
export function youTubeThumb(id: string): string {
	return `${THUMB_HOST}/vi/${id}/hqdefault.jpg`
}

export function youTubeWatchUrl(id: string): string {
	return `https://www.youtube.com/watch?v=${id}`
}
