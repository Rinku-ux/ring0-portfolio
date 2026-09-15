"use client"

import { useId } from "react"
import type { MediaFile, MediaKindTag } from "@/lib/media"

type Props = {
	label: string
	value: string
	kinds: MediaKindTag[]
	files: MediaFile[]
	placeholder?: string
	onChange: (value: string) => void
}

/*
 * public/media にあるファイルから選べる入力欄。
 * 直接パスを書いても、YouTube の ID を入れても使えるように自由入力のまま。
 */
export function MediaField({ label, value, kinds, files, placeholder, onChange }: Props) {
	const listId = useId()
	const options = files.filter((file) => kinds.includes(file.kind))

	return (
		<label className="field">
			<span>{label}</span>
			<input
				className="input"
				list={listId}
				value={value}
				placeholder={placeholder}
				onChange={(event) => onChange(event.target.value)}
			/>
			<datalist id={listId}>
				{options.map((file) => (
					<option key={file.url} value={file.url} />
				))}
			</datalist>
		</label>
	)
}
