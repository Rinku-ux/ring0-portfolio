import type { MetadataRoute } from "next"
import { getProjects } from "@/lib/projects"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
const STATIC_PATHS = ["", "/work", "/music", "/notes", "/about"]

export default function sitemap(): MetadataRoute.Sitemap {
	const now = new Date()
	const pages = STATIC_PATHS.map((path) => ({ url: `${SITE_URL}${path}`, lastModified: now }))
	const projects = getProjects().map((project) => ({ url: `${SITE_URL}/work/${project.slug}`, lastModified: now }))

	return [...pages, ...projects]
}
