import { AppleMark } from "./AppleMark"

const COPIES = 2

// 同じ列を 2 本並べて端を繋ぐ。CSS 側で -100% 動かすと途切れない。
// 区切りは ring0（りんご）のマーク。
export function Marquee({ items }: { items: string[] }) {
	return (
		<div className="marquee" aria-hidden="true">
			{Array.from({ length: COPIES }, (_, copy) => (
				<div className="marquee-track" key={copy}>
					{items.map((item) => (
						<p className="marquee-item" key={`${copy}-${item}`}>
							{item}
							<span className="marquee-mark">
								<AppleMark size={22} />
							</span>
						</p>
					))}
				</div>
			))}
		</div>
	)
}
