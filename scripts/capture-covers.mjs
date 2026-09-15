import { spawnSync } from "node:child_process"
import { existsSync, mkdirSync } from "node:fs"

const OUT_DIR = "public/covers"
const SIZE = "1600,1000"
const WAIT_MS = 2500
const TARGETS = [
	{ name: "crafttown", url: "https://craft-town.vercel.app/" },
	{ name: "trajapa3d", url: "https://trajapa3d.onrender.com/" },
	{ name: "runloop", url: "https://runloop-web.vercel.app/" },
]
const CANDIDATES = [
	"chromium",
	"chromium-browser",
	"google-chrome",
	"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
]

// 環境にある Chrome 系を順に試す。
function findBrowser() {
	for (const candidate of CANDIDATES) {
		if (candidate.startsWith("/")) {
			if (existsSync(candidate)) {
				return candidate
			}

			continue
		}

		if (spawnSync("which", [candidate]).status === 0) {
			return candidate
		}
	}

	return null
}

const browser = findBrowser()

if (!browser) {
	console.error("Chrome または Chromium が見つかりません。")
	process.exit(1)
}

mkdirSync(OUT_DIR, { recursive: true })

for (const target of TARGETS) {
	const out = `${OUT_DIR}/${target.name}.png`
	console.log(`capture ${target.url}`)
	spawnSync(
		browser,
		[
			"--headless",
			"--disable-gpu",
			"--hide-scrollbars",
			`--window-size=${SIZE}`,
			`--virtual-time-budget=${WAIT_MS}`,
			`--screenshot=${out}`,
			target.url,
		],
		{ stdio: "inherit" },
	)
}

console.log(`完了。${OUT_DIR} の PNG を jpg に変換して差し替えてください。`)
