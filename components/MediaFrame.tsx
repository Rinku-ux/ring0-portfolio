import Image from "next/image"
import type { Media } from "@/lib/types"
import { VideoPlayer } from "./VideoPlayer"
import { YouTubeEmbed } from "./YouTubeEmbed"

const STILL_SIZES = "(max-width: 760px) 100vw, 760px"
const STILL_WIDTH = 1280
const STILL_HEIGHT = 800

type Props = { media: Media; title: string; caption?: string; priority?: boolean }

// 作品の主役メディアを一つの窓にまとめる。
export function MediaFrame({ media, title, caption, priority }: Props) {
	if (media.type === "video") {
		return <VideoPlayer src={media.src} poster={media.poster} title={title} caption={caption} />
	}

	if (media.type === "youtube") {
		return <YouTubeEmbed videoId={media.videoId} poster={media.poster} title={title} caption={caption} />
	}

	return (
		<figure className="player-figure">
			<div className="still">
				<Image src={media.src} alt={title} width={STILL_WIDTH} height={STILL_HEIGHT} sizes={STILL_SIZES} priority={priority} />
			</div>
			{caption ? <figcaption className="player-caption">{caption}</figcaption> : null}
		</figure>
	)
}
