/*
 * ピアノ関連の型とラベル。
 * fs を読む lib/music.ts と分けてあるので、クライアント側からも読める。
 */
export const REPERTOIRE_STATES = ["playing", "learning", "wish"] as const

export type RepertoireState = (typeof REPERTOIRE_STATES)[number]

export const REPERTOIRE_LABELS: Record<RepertoireState, string> = { playing: "弾ける", learning: "練習中", wish: "やりたい" }

export type Practicing = { piece: string; composer: string; since: string; note?: string }
export type Recording = { id: string; title: string; composer: string; recordedAt: string; src?: string; note?: string }
export type RepertoireItem = { title: string; composer: string; state: RepertoireState }
export type Music = { practicing?: Practicing; recordings: Recording[]; repertoire: RepertoireItem[] }
