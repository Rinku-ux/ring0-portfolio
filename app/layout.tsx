import type { Metadata, Viewport } from "next"
import { Footer } from "@/components/Footer"
import { Nav } from "@/components/Nav"
import { SITE } from "@/lib/site"
import "./globals.css"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
const TITLE = `${SITE.name} — ${SITE.role}`
const DESCRIPTION = "ゲームとツールをつくり、ピアノを弾いています。作ったものと演奏を、動画でそのまま置いている場所。"
const FONT_HREF =
	"https://fonts.googleapis.com/css2?family=Inter+Tight:wght@500;600;700&family=Inter:wght@400;500&family=JetBrains+Mono:wght@400;500&family=Noto+Sans+JP:wght@400;500&display=swap"

export const metadata: Metadata = {
	metadataBase: new URL(SITE_URL),
	title: { default: TITLE, template: `%s — ${SITE.name}` },
	description: DESCRIPTION,
	keywords: [...SITE.keywords],
	alternates: { canonical: "/", types: { "application/rss+xml": "/feed.xml" } },
	openGraph: { title: TITLE, description: DESCRIPTION, url: "/", siteName: SITE.name, type: "website" },
	twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
}

export const viewport: Viewport = {
	themeColor: "#08080a",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="ja">
			<head>
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
				<link rel="stylesheet" href={FONT_HREF} />
			</head>
			<body>
				<a className="skip" href="#main">
					本文へ移動
				</a>
				<Nav />
				<main className="page" id="main">
					{children}
				</main>
				<Footer />
			</body>
		</html>
	)
}
