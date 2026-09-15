"use client"

import { useEffect, useRef, useState } from "react"
import { IconMute, IconPlay, IconVolume } from "./icons"

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)"
const EMBED_HOST = "https://www.youtube-nocookie.com/embed"
const EMBED_PARAMS = "autoplay=1&rel=0&modestbranding=1"

type Props = { videoId?: string; src?: string; poster: string; title: string; note: string }

/*
 * トップの大きい映像。優先順位は YouTube > mp4 > 静止画だけ。
 * - YouTube: クリックするまで iframe を読まない（限定公開の動画でも再生できる）。
 * - mp4: 無音ループで自動再生し、音はボタンで有効化。
 * - どちらも無いときは静止画のまま「reel 準備中」。
 * 動きを減らす設定では mp4 を自動再生しない。
 */
export function HeroReel({ videoId, src, poster, title, note }: Props) {
	const video = useRef<HTMLVideoElement>(null)
	const [muted, setMuted] = useState(true)
	const [still, setStill] = useState(false)
	const [open, setOpen] = useState(false)

	useEffect(() => {
		if (!src || videoId || !window.matchMedia(REDUCED_MOTION).matches) {
			return
		}

		setStill(true)
		video.current?.pause()
	}, [src, videoId])

	const start = () => {
		setStill(false)
		void video.current?.play()
	}

	const label = videoId ? "youtube" : src ? "now playing" : "reel 準備中"

	return (
		<section className="reel" aria-label={title}>
			<div className="reel-media">
				{videoId && open ? (
					<iframe
						src={`${EMBED_HOST}/${videoId}?${EMBED_PARAMS}`}
						title={title}
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
						allowFullScreen
					/>
				) : null}
				{videoId && !open ? (
					<button className="clip-cover" type="button" onClick={() => setOpen(true)} aria-label={`${title} を再生`}>
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img src={poster} alt="" />
						<span className="clip-play">
							<IconPlay size={18} />
						</span>
					</button>
				) : null}
				{!videoId && src ? (
					<video ref={video} src={src} poster={poster} muted={muted} loop playsInline autoPlay preload="metadata" />
				) : null}
				{!videoId && !src ? (
					// eslint-disable-next-line @next/next/no-img-element
					<img src={poster} alt="" />
				) : null}
				{still ? (
					<button className="clip-cover" type="button" onClick={start} aria-label={`${title} を再生`}>
						<span className="clip-play">
							<IconPlay size={16} />
						</span>
					</button>
				) : null}
			</div>
			<div className="reel-head">
				<span className="chip chip-static">{label}</span>
			</div>
			<div className="reel-foot">
				<div>
					<p className="reel-note">{note}</p>
					<p className="reel-title">{title}</p>
				</div>
				{!videoId && src ? (
					<button className="chip" type="button" aria-pressed={!muted} onClick={() => setMuted((before) => !before)}>
						{muted ? <IconMute size={13} /> : <IconVolume size={13} />}
						{muted ? "sound off" : "sound on"}
					</button>
				) : null}
			</div>
		</section>
	)
}
