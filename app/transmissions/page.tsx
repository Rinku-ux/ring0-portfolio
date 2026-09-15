import { permanentRedirect } from "next/navigation"

// 旧 URL のリンクを殺さないための転送。
export default function Transmissions() {
	permanentRedirect("/notes")
}
