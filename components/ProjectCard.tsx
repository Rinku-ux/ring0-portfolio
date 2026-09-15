"use client"

import Image from "next/image"
import Link from "next/link"
import { useRef } from "react"
import { KIND_LABELS, STATUS_LABELS, type Project } from "@/lib/types"

const CARD_SIZES = "(max-width: 760px) 100vw, 360px"
const CARD_WIDTH = 720
const CARD_HEIGHT = 450
const STACK_LIMIT = 2
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)"
const COARSE_POINTER = "(pointer: coarse)"

// タッチ等と動きを減らしたい人にはプレビューを回さない。
function skipPreview(): boolean {
	if (typeof window === "undefined") {
		return true
	}

	return window.matchMedia(REDUCED_MOTION).matches || window.matchMedia(COARSE_POINTER).matches
}

export function ProjectCard({ project, priority }: { project: Project; priority?: boolean }) {
	const preview = useRef<HTMLVideoElement>(null)
	const media = project.media
	const flag = media.type === "video" ? "video" : KIND_LABELS[project.kind]

	const enter = () => {
		if (skipPreview()) {
			return
		}

		void preview.current?.play()
	}

	const leave = () => {
		const element = preview.current

		if (!element) {
			return
		}

		element.pause()
		element.currentTime = 0
	}

	return (
		<article className="card" onMouseEnter={enter} onMouseLeave={leave} onFocus={enter} onBlur={leave}>
			<div className="card-media">
				<span className="card-flag">{flag}</span>
				<Image src={project.cover} alt={project.title} width={CARD_WIDTH} height={CARD_HEIGHT} sizes={CARD_SIZES} priority={priority} />
				{media.type === "video" ? <video className="card-preview" ref={preview} src={media.src} muted loop playsInline preload="none" /> : null}
			</div>
			<div className="card-body">
				<h3 className="card-title">
					<Link href={`/work/${project.slug}`}>{project.title}</Link>
				</h3>
				<p className="card-summary">{project.summary}</p>
				<div className="meta">
					<span className={`status status-${project.status}`}>{STATUS_LABELS[project.status]}</span>
					<span className="mono">{project.year}</span>
					{project.stack.slice(0, STACK_LIMIT).map((item) => (
						<span className="tag" key={item}>
							{item}
						</span>
					))}
				</div>
			</div>
		</article>
	)
}
