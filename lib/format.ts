const SECONDS_PER_MINUTE = 60
const CLOCK_PAD = 2
const CLOCK_ZERO = "0:00"

export function formatDate(value: string): string {
	const date = new Date(value)

	if (Number.isNaN(date.getTime())) {
		return value
	}

	return new Intl.DateTimeFormat("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit" }).format(date)
}

// duration はメタデータ読み込みまで NaN になる。
export function formatClock(seconds: number): string {
	if (!Number.isFinite(seconds) || seconds <= 0) {
		return CLOCK_ZERO
	}

	const total = Math.floor(seconds)

	return `${Math.floor(total / SECONDS_PER_MINUTE)}:${String(total % SECONDS_PER_MINUTE).padStart(CLOCK_PAD, "0")}`
}
