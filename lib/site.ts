/*
 * サイト全体で使う固定値。名乗り方と連絡先はここだけ直せば全ページに効く。
 * ring0 は「りんご」とも読む。マークと配色はその読みから取っている。
 * email は仮置き。実アドレスに差し替えてください。
 */
export const SITE = {
	name: "ring0",
	reading: "ringo",
	role: "Creative developer / Pianist",
	roleJa: "ゲームとツールをつくる人、ピアノを弾く人",
	email: "hello@example.com",
	stack: ["TypeScript", "Next.js", "WebGL", "Web Audio"],
	keywords: ["creative coding", "games", "tools", "piano", "web audio", "3d"],
} as const

/* トップのリール・受付中バッジ・Piano の前振りは content/site.json（/admin の Home タブ）。 */
