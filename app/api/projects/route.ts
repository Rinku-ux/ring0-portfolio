import { BAD_REQUEST, NOT_FOUND, authorized, deny, readonly, refresh } from "@/lib/admin/api"
import { ReadonlyStoreError } from "@/lib/notes/types"
import { getProjects, setFeatured, updateProject, type ProjectPatch } from "@/lib/projects"
import { resolveStoreMode } from "@/lib/store"

type Payload = ProjectPatch & { slug?: unknown; makeFeatured?: unknown }

export async function GET() {
	if (!(await authorized())) {
		return deny()
	}

	return Response.json({ mode: resolveStoreMode(), projects: getProjects() })
}

// 作品ページ（MDX）の frontmatter と本文を書き換える。
export async function PATCH(request: Request) {
	if (!(await authorized())) {
		return deny()
	}

	const payload = (await request.json().catch(() => null)) as Payload | null
	const slug = typeof payload?.slug === "string" ? payload.slug : ""

	if (!slug || !payload) {
		return Response.json({ error: "slug が必要です。" }, { status: BAD_REQUEST })
	}

	const { slug: _slug, makeFeatured, ...patch } = payload

	try {
		const project = makeFeatured === true ? setFeatured(slug) : updateProject(slug, patch)

		if (!project) {
			return Response.json({ error: "対象の作品がありません。" }, { status: NOT_FOUND })
		}

		// 本文が変わるので作品ページ自体も作り直す。
		refresh([`/work/${slug}`])

		return Response.json({ project, projects: getProjects() })
	} catch (error) {
		if (error instanceof ReadonlyStoreError) {
			return readonly()
		}

		throw error
	}
}
