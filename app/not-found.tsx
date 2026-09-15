import Link from "next/link"

export default function NotFound() {
	return (
		<section className="page-head">
			<p className="mono">404</p>
			<h1>ページが見つかりません</h1>
			<p>URL が変わったか、まだ公開していないページです。作品一覧から探してみてください。</p>
			<div className="hero-actions">
				<Link className="btn btn-primary" href="/work">
					Work
				</Link>
				<Link className="btn" href="/">
					トップ
				</Link>
			</div>
		</section>
	)
}
