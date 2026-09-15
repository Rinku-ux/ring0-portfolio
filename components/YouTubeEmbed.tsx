"use client"

import { useState } from "react"
import { IconPlay } from "./icons"

const EMBED_HOST = "https://www.youtube-nocookie.com/embed"
const EMBED_PARAMS = "autoplay=1&rel=0&modestbranding=1"

type Props = { videoId: string; poster: string; title: string; caption?: string }

// クリックされるまで iframe を読まない。YouTube の JS を初期表示に乗せないため。
export function YouTubeEmbed({ videoId, poster, title, caption }: Props) {
	const [open, setOpen] = useState(false)

	return (
		<figure className="player-figure">
			<div className="player">
				{open ? (
					<iframe
						src={`${EMBED_HOST}/${videoId}?${EMBED_PARAMS}`}
						title={title}
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
						allowFullScreen
					/>
				) : (
					<button className="player-cover" type="button" onClick={() => setOpen(true)} aria-label={`${title} を YouTube で再生`}>
						<img src={poster} alt="" />
						<span className="player-play">
							<span className="player-play-glyph">
								<IconPlay size={12} />
							</span>
							YouTube
						</span>
					</button>
				)}
			</div>
			{caption ? <figcaption className="player-caption">{caption}</figcaption> : null}
		</figure>
	)
}
