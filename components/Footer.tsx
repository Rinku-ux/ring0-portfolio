import Link from "next/link"
import { SITE } from "@/lib/site"
import { AppleMark } from "./AppleMark"

const YEAR = 2026

export function Footer() {
	return (
		<div className="foot-wrap">
			<footer className="foot">
				<div className="foot-row">
					<p className="mono">
						{SITE.name} — {SITE.role}
					</p>
					<div className="foot-links">
						<Link href="/work">Work</Link>
						<Link href="/music">Piano</Link>
						<Link href="/notes">Notes</Link>
						<a href="/feed.xml">RSS</a>
						<a href={`mailto:${SITE.email}`}>Contact</a>
					</div>
				</div>
				<p className="mono foot-note">
					<span className="foot-apple">
						<AppleMark size={12} />
					</span>
					{SITE.name} = {SITE.reading} / © {YEAR}
				</p>
			</footer>
		</div>
	)
}
