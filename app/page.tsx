import Link from "next/link"
import { AppleMark } from "@/components/AppleMark"
import { ClipCard } from "@/components/ClipCard"
import { HeroReel } from "@/components/HeroReel"
import { Marquee } from "@/components/Marquee"
import { MediaFrame } from "@/components/MediaFrame"
import { WorkRow } from "@/components/WorkRow"
import { formatDate } from "@/lib/format"
import { getMusic } from "@/lib/music"
import { getNoteStore } from "@/lib/notes/store"
import { NOTE_TAG_LABELS } from "@/lib/notes/types"
import { getClips } from "@/lib/performances"
import { getFeatured, getProjects } from "@/lib/projects"
import { SITE } from "@/lib/site"
import { getSiteContent } from "@/lib/site-content"
import { KIND_LABELS, STATUS_LABELS } from "@/lib/types"

const ROW_LIMIT = 5
const CLIP_LIMIT = 3
const NOTE_LIMIT = 3
const MARQUEE = ["GAMES", "TOOLS", "WEBGL", "PIANO", "WEB AUDIO", "EXPERIMENTS"]

export default function Home() {
	const featured = getFeatured()
	const projects = getProjects().filter((project) => project.slug !== featured?.slug).slice(0, ROW_LIMIT)
	const clips = getClips().slice(0, CLIP_LIMIT)
	const notes = getNoteStore().list().slice(0, NOTE_LIMIT)
	const music = getMusic()
	const content = getSiteContent()

	return (
		<>
			<section className="hero">
				<p className="eyebrow">
					<span className="eyebrow-dot" />
					{content.status}
				</p>
				<h1 className="hero-title">
					<span className="line">Make.</span>
					<span className="line outline">Play.</span>
					<span className="line">
						Repeat<span className="swap">.</span>
					</span>
				</h1>
				<div className="hero-bottom">
					<p className="hero-lead">
						<strong>{SITE.roleJa}。</strong>
						ボクセルのゲーム、小さなツール、ブラウザで動く実験。作ったものはそのまま動かせる形で、弾いたものは映像で置いています。
					</p>
					<div className="hero-actions">
						<Link className="btn btn-primary btn-lg" href="/work">
							作品を見る
						</Link>
						<Link className="btn btn-lg" href="#piano">
							演奏を見る
						</Link>
					</div>
				</div>
				<div className="hero-facts">
					<div className="fact">
						<p className="fact-num">{getProjects().length}</p>
						<p className="fact-label">works</p>
					</div>
					<div className="fact">
						<p className="fact-num">{clips.length}</p>
						<p className="fact-label">performances</p>
					</div>
					<div className="fact">
						<p className="fact-num">{SITE.stack[0]}</p>
						<p className="fact-label">main stack</p>
					</div>
					<div className="fact">
						<p className="fact-num">2026</p>
						<p className="fact-label">latest update</p>
					</div>
				</div>
			</section>

			<HeroReel
				videoId={content.reel.youtubeId}
				src={content.reel.src}
				poster={content.reel.poster}
				title={content.reel.title}
				note={content.reel.note}
			/>

			<Marquee items={MARQUEE} />

			{featured ? (
				<section className="section">
					<div className="section-head">
						<h2>Selected work</h2>
						<Link href={`/work/${featured.slug}`}>この作品の詳細</Link>
					</div>
					<div className="feature">
						<MediaFrame media={featured.media} title={featured.title} caption={featured.mediaCaption} priority />
						<div className="feature-side">
							<p className="mono">{KIND_LABELS[featured.kind]} / {featured.year}</p>
							<p className="feature-name">{featured.title}</p>
							<p className="feature-text">{featured.summary}</p>
							<div className="meta">
								<span className={`status status-${featured.status}`}>{STATUS_LABELS[featured.status]}</span>
								{featured.stack.map((item) => (
									<span className="tag" key={item}>
										{item}
									</span>
								))}
							</div>
							<div className="hero-actions">
								{featured.liveUrl ? (
									<a className="btn btn-primary" href={featured.liveUrl} rel="noreferrer noopener" target="_blank">
										{featured.playable ? "遊んでみる" : "開く"}
									</a>
								) : null}
								<Link className="btn" href={`/work/${featured.slug}`}>
									制作メモ
								</Link>
							</div>
						</div>
					</div>
				</section>
			) : null}

			{projects.length > 0 ? (
				<section className="section">
					<div className="section-head">
						<h2>Archive</h2>
						<Link href="/work">すべての作品</Link>
					</div>
					<div className="worklist">
						{projects.map((project, index) => (
							<WorkRow key={project.slug} project={project} index={index} />
						))}
					</div>
				</section>
			) : null}

			<section className="section" id="piano">
				<div className="section-head">
					<h2>Piano</h2>
					<Link href="/music">演奏のページ</Link>
				</div>
				<p className="lede">
					{content.pianoLede}
					{music.practicing ? `いまは ${music.practicing.piece}（${music.practicing.composer}）を練習中。` : null}
				</p>
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

			{notes.length > 0 ? (
				<section className="section">
					<div className="section-head">
						<h2>Notes</h2>
						<Link href="/notes">すべてのノート</Link>
					</div>
					<div className="feed">
						{notes.map((note) => (
							<article className="note" key={note.id}>
								<p className="mono">
									{NOTE_TAG_LABELS[note.tag]} / {formatDate(note.createdAt)}
								</p>
								<p>{note.body}</p>
							</article>
						))}
					</div>
				</section>
			) : null}

			<section className="band">
				<span className="band-apple">
					<AppleMark size={300} />
				</span>
				<p className="mono">contact</p>
				<p className="band-title">
					作りたいもの、
					<br />
					聞きたい演奏はありますか。
				</p>
				<div className="band-actions">
					<a className="btn btn-primary btn-lg" href={`mailto:${SITE.email}`}>
						メールで連絡
					</a>
					<Link className="btn btn-lg" href="/about">
						プロフィール
					</Link>
				</div>
			</section>
		</>
	)
}
