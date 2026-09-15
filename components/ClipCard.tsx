"use client"

import { useState } from "react"
import { formatDate } from "@/lib/format"
import type { Clip } from "@/lib/performances"
import { IconPlay } from "./icons"

const EMBED_HOST = "https://www.youtube-nocookie.com/embed"
const EMBED_PARAMS = "autoplay=1&rel=0&modestbranding=1"

// クリックされるまで動画も iframe も読み込まない。一覧で 3 本並べても軽い。
export function ClipCard({ clip }: { clip: Clip }) {
	const [open, setOpen] = useState(false)
	const media = clip.media

	return (
		<article className="clip">
			<div className="clip-frame">
				{open && media.type === "video" ? <video src={media.src} poster={media.poster} controls autoPlay playsInline /> : null}
				{open && media.type === "youtube" ? (
					<iframe
						src={`${EMBED_HOST}/${media.videoId}?${EMBED_PARAMS}`}
						title={clip.title}
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
						allowFullScreen
					/>
				) : null}
				{open ? null : (
					<button className="clip-cover" type="button" onClick={() => setOpen(true)} aria-label={`${clip.title} を再生`}>
						<img src={media.poster} alt="" />
						<span className="clip-play">
							<IconPlay size={16} />
						</span>
						{clip.lengthLabel ? <span className="clip-badge">{clip.lengthLabel}</span> : null}
					</button>
				)}
			</div>
			<div className="clip-info">
				<h3 className="clip-title">{clip.title}</h3>
				<p className="clip-meta">
					{clip.composer} — {formatDate(clip.date)}
				</p>
				{clip.note ? <p className="clip-note">{clip.note}</p> : null}
			</div>
		</article>
	)
}
