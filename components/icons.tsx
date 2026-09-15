const SIZE = 18
const STROKE = 1.6

type Props = { size?: number }

// 全アイコンで線の太さと端の形を揃える。
function frame(size: number) {
	return {
		width: size,
		height: size,
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: STROKE,
		strokeLinecap: "round" as const,
		strokeLinejoin: "round" as const,
		"aria-hidden": true,
	}
}

export function IconPlay({ size = SIZE }: Props) {
	return (
		<svg {...frame(size)}>
			<path d="M8 5.5v13l11-6.5z" fill="currentColor" stroke="none" />
		</svg>
	)
}

export function IconPause({ size = SIZE }: Props) {
	return (
		<svg {...frame(size)}>
			<rect x="8" y="5.5" width="2.6" height="13" rx="1" fill="currentColor" stroke="none" />
			<rect x="13.4" y="5.5" width="2.6" height="13" rx="1" fill="currentColor" stroke="none" />
		</svg>
	)
}

export function IconVolume({ size = SIZE }: Props) {
	return (
		<svg {...frame(size)}>
			<path d="M4 9.5h3.5L12 6v12l-4.5-3.5H4z" fill="currentColor" stroke="none" />
			<path d="M16 9.6a4 4 0 0 1 0 4.8" />
			<path d="M18.6 7.4a7 7 0 0 1 0 9.2" />
		</svg>
	)
}

export function IconMute({ size = SIZE }: Props) {
	return (
		<svg {...frame(size)}>
			<path d="M4 9.5h3.5L12 6v12l-4.5-3.5H4z" fill="currentColor" stroke="none" />
			<path d="M16 10l4.5 4.5M20.5 10L16 14.5" />
		</svg>
	)
}

export function IconExpand({ size = SIZE }: Props) {
	return (
		<svg {...frame(size)}>
			<path d="M9 4H4v5M15 4h5v5M15 20h5v-5M9 20H4v-5" />
		</svg>
	)
}
