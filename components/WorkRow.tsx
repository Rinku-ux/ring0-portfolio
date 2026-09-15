import Image from "next/image"
import Link from "next/link"
import { KIND_LABELS, STATUS_LABELS, type Project } from "@/lib/types"

const THUMB_WIDTH = 216
const THUMB_HEIGHT = 128
const INDEX_PAD = 2

// 一覧は行で見せる。サムネはホバーで立ち上がる補助情報にする。
export function WorkRow({ project, index }: { project: Project; index: number }) {
	return (
		<Link className="work-row" href={`/work/${project.slug}`}>
			<span className="work-index">{String(index + 1).padStart(INDEX_PAD, "0")}</span>
			<span className="work-main">
				<span className="work-title">{project.title}</span>
				<span className="work-summary">
					{KIND_LABELS[project.kind]} — {project.summary}
				</span>
			</span>
			<span className="work-end">
				<span className={`status status-${project.status}`}>{STATUS_LABELS[project.status]}</span>
				<span className="work-thumb">
					<Image src={project.cover} alt="" width={THUMB_WIDTH} height={THUMB_HEIGHT} sizes="216px" />
				</span>
				<span className="work-arrow">↗</span>
			</span>
		</Link>
	)
}
