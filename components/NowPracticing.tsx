import { formatDate } from "@/lib/format"
import type { Practicing } from "@/lib/music"

export function NowPracticing({ practicing }: { practicing?: Practicing }) {
	if (!practicing) {
		return null
	}

	return (
		<section className="now" aria-label="いま練習している曲">
			<p className="mono">now practicing</p>
			<p className="now-piece">{practicing.piece}</p>
			<p className="now-meta">
				{practicing.composer} / {formatDate(practicing.since)} から
			</p>
			{practicing.note ? <p className="now-note">{practicing.note}</p> : null}
		</section>
	)
}
