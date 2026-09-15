"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { SITE } from "@/lib/site"
import { Logo } from "./Logo"

const LINKS = [
	{ href: "/work", label: "Work" },
	{ href: "/music", label: "Piano" },
	{ href: "/notes", label: "Notes" },
	{ href: "/about", label: "About" },
]

export function Nav() {
	const pathname = usePathname()

	return (
		<header className="topbar">
			<div className="topbar-inner">
				<Logo />
				<nav className="nav-links" aria-label="サイト内">
					{LINKS.map((link) => {
						const active = pathname === link.href || pathname.startsWith(`${link.href}/`)

						return (
							<Link className="nav-link" key={link.href} href={link.href} aria-current={active ? "page" : undefined}>
								{link.label}
							</Link>
						)
					})}
				</nav>
				<div className="nav-end">
					<a className="btn" href={`mailto:${SITE.email}`}>
						Contact
					</a>
				</div>
			</div>
		</header>
	)
}
