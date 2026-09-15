import { ImageResponse } from "next/og"

const WIDTH = 1200
const HEIGHT = 630

export const size = { width: WIDTH, height: HEIGHT }
export const contentType = "image/png"
export const alt = "ring0 - creative developer and pianist"

// OG 画像はフォントを読まないで済むようラテン文字だけにする。
export default function OpengraphImage() {
	return new ImageResponse(
		(
			<div
				style={{
					width: "100%",
					height: "100%",
					display: "flex",
					flexDirection: "column",
					justifyContent: "space-between",
					background: "#08080a",
					padding: 72,
					color: "#f4f3f1",
				}}
			>
				<div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 24, letterSpacing: 6, color: "#a2a2ac" }}>
					<div style={{ width: 12, height: 12, borderRadius: 12, background: "#ff3b30" }} />
					CREATIVE DEVELOPER / PIANIST
				</div>
				<div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 132, fontWeight: 700, letterSpacing: -6, lineHeight: 1 }}>
					<div style={{ display: "flex" }}>MAKE.</div>
					<div style={{ display: "flex", color: "#4a4a54" }}>PLAY.</div>
					<div style={{ display: "flex" }}>
						<span>REPEAT</span>
						<span style={{ color: "#ff3b30" }}>.</span>
					</div>
				</div>
				<div style={{ display: "flex", justifyContent: "space-between", fontSize: 30, color: "#a2a2ac" }}>
					<div>ring0 (ringo)</div>
					<div>games / tools / piano</div>
				</div>
			</div>
		),
		size,
	)
}
