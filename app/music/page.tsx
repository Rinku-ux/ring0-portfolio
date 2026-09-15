import type { Metadata } from "next"
import { AudioTrack } from "@/components/AudioTrack"
import { ClipCard } from "@/components/ClipCard"
import { NowPracticing } from "@/components/NowPracticing"
import { REPERTOIRE_LABELS, REPERTOIRE_STATES, getMusic } from "@/lib/music"
import { getClips } from "@/lib/performances"
import { getSiteContent } from "@/lib/site-content"

export const metadata: Metadata = {
	title: "Piano",
	description: "演奏の映像と録音、練習中の曲、レパートリー。",
	alternates: { canonical: "/music" },
}

export default function MusicPage() {
	const music = getMusic()
	const clips = getClips()
	const content = getSiteContent()

	return (
		<>
			<section className="page-head">
				<p className="mono">piano</p>
				<h1>Piano</h1>
				<p>{content.pianoLede}</p>
			</section>

			<section className="section">
				<div className="section-head">
					<h2>演奏映像</h2>
					<span className="mono">{clips.length} clips</span>
				</div>
				{clips.length === 0 ? (
					<p className="empty">演奏映像はまだありません。</p>
				) : (
					<div className="clip-grid">
						{clips.map((clip) => (
							<ClipCard key={clip.id} clip={clip} />
						))}
					</div>
				)}
			</section>

			<NowPracticing practicing={music.practicing} />

			<section className="section">
				<div className="section-head">
					<h2>録音</h2>
					<span className="mono">{music.recordings.length} tracks</span>
				</div>
				{music.recordings.length === 0 ? (
					<p className="empty">録音はまだありません。</p>
				) : (
					<ul className="rows">
						{music.recordings.map((recording) => (
							<AudioTrack key={recording.id} recording={recording} />
						))}
					</ul>
				)}
			</section>

			<section className="section">
				<div className="section-head">
					<h2>レパートリー</h2>
				</div>
				<div className="stack">
					{REPERTOIRE_STATES.map((state) => {
						const items = music.repertoire.filter((item) => item.state === state)

						if (items.length === 0) {
							return null
						}

						return (
							<div className="gear-group" key={state}>
								<p className="mono">{REPERTOIRE_LABELS[state]}</p>
								<ul className="rows">
									{items.map((item) => (
										<li className="row" key={`${item.title}-${item.composer}`}>
											<span className="row-main">{item.title}</span>
											<span className="row-note">{item.composer}</span>
										</li>
									))}
								</ul>
							</div>
						)
					})}
				</div>
			</section>
		</>
	)
}
