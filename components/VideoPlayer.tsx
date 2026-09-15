"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { formatClock } from "@/lib/format"
import { IconExpand, IconMute, IconPause, IconPlay, IconVolume } from "./icons"

const SEEK_STEP_SECONDS = 5
const RATES = [1, 1.25, 1.5, 2]
const PERCENT = 100
const TYPING_TAGS = ["BUTTON", "INPUT", "SELECT", "TEXTAREA"]

type PlayState = "idle" | "playing" | "paused" | "ended"
type Props = { src: string; poster: string; title: string; caption?: string }

// iOS の Safari は標準の全画面 API を持たない。
type LegacyVideo = HTMLVideoElement & { webkitEnterFullscreen?: () => void }

export function VideoPlayer({ src, poster, title, caption }: Props) {
	const shell = useRef<HTMLDivElement>(null)
	const video = useRef<HTMLVideoElement>(null)
	const [state, setState] = useState<PlayState>("idle")
	const [time, setTime] = useState(0)
	const [duration, setDuration] = useState(0)
	const [buffered, setBuffered] = useState(0)
	const [muted, setMuted] = useState(false)
	const [rate, setRate] = useState(RATES[0])

	const started = state !== "idle"
	const played = duration > 0 ? (time / duration) * PERCENT : 0

	const toggle = useCallback(() => {
		const element = video.current

		if (!element) {
			return
		}

		if (element.paused) {
			void element.play()

			return
		}

		element.pause()
	}, [])

	const seekBy = useCallback((delta: number) => {
		const element = video.current

		if (!element || !Number.isFinite(element.duration)) {
			return
		}

		element.currentTime = Math.min(Math.max(element.currentTime + delta, 0), element.duration)
	}, [])

	const seekTo = useCallback((ratio: number) => {
		const element = video.current

		if (!element || !Number.isFinite(element.duration)) {
			return
		}

		element.currentTime = element.duration * Math.min(Math.max(ratio, 0), 1)
		setTime(element.currentTime)
	}, [])

	const switchMute = useCallback(() => {
		setMuted((before) => !before)
	}, [])

	const cycleRate = useCallback(() => {
		const element = video.current

		if (!element) {
			return
		}

		const next = RATES[(RATES.indexOf(rate) + 1) % RATES.length]
		element.playbackRate = next
		setRate(next)
	}, [rate])

	const expand = useCallback(() => {
		if (document.fullscreenElement) {
			void document.exitFullscreen()

			return
		}

		if (shell.current?.requestFullscreen) {
			void shell.current.requestFullscreen()

			return
		}

		;(video.current as LegacyVideo | null)?.webkitEnterFullscreen?.()
	}, [])

	// 再生を始めたあとだけキー操作を受ける。
	useEffect(() => {
		if (!started) {
			return
		}

		const onKey = (event: KeyboardEvent) => {
			const target = event.target as HTMLElement | null

			if (target && TYPING_TAGS.includes(target.tagName)) {
				return
			}

			if (event.key === " " || event.key === "k") {
				event.preventDefault()
				toggle()

				return
			}

			if (event.key === "ArrowRight") {
				event.preventDefault()
				seekBy(SEEK_STEP_SECONDS)

				return
			}

			if (event.key === "ArrowLeft") {
				event.preventDefault()
				seekBy(-SEEK_STEP_SECONDS)

				return
			}

			if (event.key === "m") {
				switchMute()

				return
			}

			if (event.key === "f") {
				expand()
			}
		}

		window.addEventListener("keydown", onKey)

		return () => window.removeEventListener("keydown", onKey)
	}, [expand, seekBy, started, switchMute, toggle])

	// タブを隠したときに音を残さない。
	useEffect(() => {
		const onHide = () => {
			if (document.visibilityState === "hidden") {
				video.current?.pause()
			}
		}

		document.addEventListener("visibilitychange", onHide)

		return () => document.removeEventListener("visibilitychange", onHide)
	}, [])

	const scrub = (event: React.PointerEvent<HTMLDivElement>) => {
		const box = event.currentTarget.getBoundingClientRect()
		seekTo((event.clientX - box.left) / box.width)
	}

	const onProgress = () => {
		const element = video.current

		if (!element || element.buffered.length === 0 || !Number.isFinite(element.duration)) {
			return
		}

		setBuffered((element.buffered.end(element.buffered.length - 1) / element.duration) * PERCENT)
	}

	return (
		<figure className="player-figure">
			<div className="player" ref={shell} data-paused={state !== "playing"}>
				<video
					ref={video}
					src={src}
					poster={poster}
					muted={muted}
					playsInline
					preload="metadata"
					onClick={toggle}
					onPlay={() => setState("playing")}
					onPause={() => setState((before) => (before === "ended" ? before : "paused"))}
					onEnded={() => setState("ended")}
					onTimeUpdate={(event) => setTime(event.currentTarget.currentTime)}
					onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
					onProgress={onProgress}
				/>
				{started ? null : (
					<button className="player-cover" type="button" onClick={() => void video.current?.play()} aria-label={`${title} を再生`}>
						<img src={poster} alt="" />
						<span className="player-play">
							<span className="player-play-glyph">
								<IconPlay size={12} />
							</span>
							play
						</span>
					</button>
				)}
				<div className="player-bar">
					<div
						className="scrub"
						role="slider"
						tabIndex={0}
						aria-label="再生位置"
						aria-valuemin={0}
						aria-valuemax={Math.round(duration)}
						aria-valuenow={Math.round(time)}
						aria-valuetext={`${formatClock(time)} / ${formatClock(duration)}`}
						onPointerDown={(event) => {
							event.currentTarget.setPointerCapture(event.pointerId)
							scrub(event)
						}}
						onPointerMove={(event) => {
							if (event.currentTarget.hasPointerCapture(event.pointerId)) {
								scrub(event)
							}
						}}
					>
						<span className="scrub-track">
							<span className="scrub-buffered" style={{ width: `${buffered}%` }} />
							<span className="scrub-played" style={{ width: `${played}%` }} />
						</span>
						<span className="scrub-knob" style={{ left: `${played}%` }} />
					</div>
					<div className="player-controls">
						<button className="player-btn" type="button" onClick={toggle} aria-label={state === "playing" ? "一時停止" : "再生"}>
							{state === "playing" ? <IconPause /> : <IconPlay />}
						</button>
						<span className="player-time">
							{formatClock(time)} / {formatClock(duration)}
						</span>
						<span className="player-spacer" />
						<button className="player-rate" type="button" onClick={cycleRate} aria-label="再生速度">
							{rate}x
						</button>
						<button className="player-btn" type="button" onClick={switchMute} aria-label={muted ? "ミュート解除" : "ミュート"}>
							{muted ? <IconMute /> : <IconVolume />}
						</button>
						<button className="player-btn" type="button" onClick={expand} aria-label="全画面">
							<IconExpand />
						</button>
					</div>
				</div>
			</div>
			{caption ? <figcaption className="player-caption">{caption}</figcaption> : null}
		</figure>
	)
}
