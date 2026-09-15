import { ImageResponse } from "next/og"

const EDGE = 64
const MARK = 40
const RADIUS = 15

export const size = { width: EDGE, height: EDGE }
export const contentType = "image/png"

// ファビコンもロゴと同じりんご。SVG を data URI で渡す。
const APPLE = `data:image/svg+xml,${encodeURIComponent(
	'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#fff"><path d="M12 7.4c-1.1-.8-2.3-1.2-3.5-1.2C5.5 6.2 3 8.8 3 12.6c0 2.3.9 4.6 2.2 6.1 1 1.2 2 2 3.1 2 1 0 1.6-.6 2.7-.6h2c1.1 0 1.7.6 2.7.6 1.1 0 2.1-.8 3.1-2 1.3-1.5 2.2-3.8 2.2-6.1 0-3.8-2.5-6.4-5.5-6.4-1.2 0-2.4.4-3.5 1.2z"/><path d="M12.8 5.6c1.4-.2 2.7-1.2 3.2-2.5.1-.4-.2-.8-.6-.7-1.5.2-2.8 1.3-3.2 2.7-.1.3.2.6.6.5z"/></svg>',
)}`

export default function Icon() {
	return new ImageResponse(
		(
			<div
				style={{
					width: "100%",
					height: "100%",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					background: "#ff3b30",
					borderRadius: RADIUS,
				}}
			>
				{/* eslint-disable-next-line @next/next/no-img-element */}
				<img src={APPLE} width={MARK} height={MARK} alt="" />
			</div>
		),
		size,
	)
}
