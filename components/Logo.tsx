import Link from "next/link"
import { SITE } from "@/lib/site"
import { AppleMark } from "./AppleMark"

// ロゴは「ring0 = りんご」のマークとワードマークだけ。楽器の絵は置かない。
export function Logo() {
	return (
		<Link className="brand" href="/" aria-label={`${SITE.name} のトップへ`}>
			<span className="brand-mark">
				<AppleMark size={17} />
			</span>
			<span>
				<span className="brand-name">{SITE.name}</span>
				<span className="brand-sub"> — {SITE.role}</span>
			</span>
		</Link>
	)
}
