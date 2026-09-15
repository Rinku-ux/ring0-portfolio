"use client"

import { useEffect, useRef, useState } from "react"
import { formatClock, formatDate } from "@/lib/format"
import type { Recording } from "@/lib/music"
import { IconPause, IconPlay } from "./icons"

const FFT_SIZE = 64
const BAR_COUNT = 16
const BAR_GAP = 2
const BYTE_MAX = 255
const PERCENT = 100
const MIN_BAR_HEIGHT = 2
const METER_WIDTH = 96
const METER_HEIGHT = 28
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)"

type Meter = { context: AudioContext; analyser: AnalyserNode }

// ページ内で同時に鳴るのは一つだけにする。
let current: HTMLAudioElement | null = null

const meters = new WeakMap<HTMLAudioElement, Meter>()

// createMediaElementSource は同じ要素に二度使えないので使い回す。
function attachMeter(element: HTMLAudioElement): AnalyserNode | null {
	const known = meters.get(element)

	if (known) {
		void known.context.resume()

		return known.analyser
	}

	if (!window.AudioContext) {
		return null
	}

	const context = new AudioContext()
	const analyser = context.createAnalyser()
	analyser.fftSize = FFT_SIZE
	context.createMediaElementSource(element).connect(analyser)
	analyser.connect(context.destination)
	meters.set(element, { context, analyser })

	return analyser
}

export function AudioTrack({ recording }: { recording: Recording }) {
	const audio = useRef<HTMLAudioElement>(null)
	const canvas = useRef<HTMLCanvasElement>(null)
	const frame = useRef(0)
	const [playing, setPlaying] = useState(false)
	const [time, setTime] = useState(0)
	const [duration, setDuration] = useState(0)
	const missing = !recording.src
	const played = duration > 0 ? (time / duration) * PERCENT : 0

	useEffect(() => () => window.cancelAnimationFrame(frame.current), [])

	const drawMeter = () => {
		const element = audio.current
		const board = canvas.current
		const view = board?.getContext("2d")

		if (!element || !board || !view || window.matchMedia(REDUCED_MOTION).matches) {
			return
		}

		const analyser = attachMeter(element)

		if (!analyser) {
			return
		}

		const data = new Uint8Array(analyser.frequencyBinCount)
		const width = (METER_WIDTH - BAR_GAP * (BAR_COUNT - 1)) / BAR_COUNT
		const color = window.getComputedStyle(board).color

		const tick = () => {
			analyser.getByteFrequencyData(data)
			view.clearRect(0, 0, METER_WIDTH, METER_HEIGHT)
			view.fillStyle = color

			for (let index = 0; index < BAR_COUNT; index += 1) {
				const height = Math.max((data[index] / BYTE_MAX) * METER_HEIGHT, MIN_BAR_HEIGHT)
				view.fillRect(index * (width + BAR_GAP), METER_HEIGHT - height, width, height)
			}

			frame.current = window.requestAnimationFrame(tick)
		}

		tick()
	}

	const toggle = () => {
		const element = audio.current

		if (!element) {
			return
		}

		if (!element.paused) {
			element.pause()

			return
		}

		if (current && current !== element) {
			current.pause()
		}

		current = element
		drawMeter()
		void element.play()
	}

	return (
		<li className={missing ? "track track-empty" : "track"} data-playing={playing}>
			<button className="track-btn" type="button" onClick={toggle} disabled={missing} aria-label={`${recording.title} を再生`}>
				{playing ? <IconPause /> : <IconPlay />}
			</button>
			<div className="track-meta">
				<span className="track-title">{recording.title}</span>
				<span className="track-sub">
					{recording.composer} / {formatDate(recording.recordedAt)}
				</span>
				{missing ? (
					<span className="track-note">録音準備中</span>
				) : (
					<>
						<span className="track-progress">
							<span style={{ width: `${played}%` }} />
						</span>
						<span className="track-note">
							{formatClock(time)} / {formatClock(duration)}
						</span>
					</>
				)}
			</div>
			<canvas className="track-meter" ref={canvas} width={METER_WIDTH} height={METER_HEIGHT} aria-hidden="true" />
			{recording.src ? (
				<audio
					ref={audio}
					src={recording.src}
					preload="metadata"
					onPlay={() => setPlaying(true)}
					onPause={() => setPlaying(false)}
					onEnded={() => setPlaying(false)}
					onTimeUpdate={(event) => setTime(event.currentTarget.currentTime)}
					onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
				/>
			) : null}
		</li>
	)
}
