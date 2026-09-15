# ring0 portfolio

「ピアノが好きなクリエイター」のポートフォリオ。Next.js 15 / React 19 / TypeScript。CSS は自作トークンのみ、UI ライブラリなし。

## デザインの方針（2026 リニューアル）

- **UI は無彩色のダーク**。色は作品のサムネと映像から出す。アクセントは `--accent`（りんごの赤）1 色だけ。
- **ring0 = りんご**。ロゴ・ファビコン・マーキーの区切り・CTA の透かしに `components/AppleMark.tsx` を使い回す。葉の緑（`--leaf`）は稼働中の点など小物だけ。
- **効果音は入れない**。ホバーやクリックで鳴る UI 音と鍵盤ウィジェットは削除済み。音が出るのはユーザーが再生した動画と録音だけ。
- **ピアノは題材、意匠ではない**。鍵盤・五線紙・真鍮といったモチーフは UI から外し、演奏は「動画コンテンツ」として置く。
- 大きなグロテスク（Inter Tight）＋等幅の小ラベル。文字と映像だけで組み、飾りを足さない。
- トップの構成: ヒーロー → リール映像 → マーキー → Selected work → Archive（行一覧） → Piano（演奏映像） → Notes → 連絡。

主な実装先:

```
app/styles/tokens.css    配色・書体・余白の定義（ここを触れば全体の印象が変わる）
app/styles/creator.css   トップ専用（ヒーロー / リール / 行一覧 / クリップ / CTA）
app/page.tsx             トップの構成
lib/site.ts              名乗り方・連絡先・リール設定
```

## 起動

```bash
npm install
npm run dev
```

`.env.local` は作成済み（`ADMIN_PASSWORD` 設定済み、`CONTENT_STORE=file`）。git には入りません。
管理画面は `http://localhost:3000/admin`。

## 最初に差し替えるところ

| 場所 | 内容 |
| --- | --- |
| `lib/site.ts` | 名前、肩書き、`email`（仮で `hello@example.com`）|
| `content/site.json` | トップの大きい映像（空だと静止画＋「reel 準備中」）と見出しテキスト。`/admin` の Home タブから編集 |
| `content/performances.json` | 演奏映像 |
| `public/media/` | 動画・音声・ポスター画像 |

## 動画は YouTube（限定公開）に置く

方針: 動画はこのリポジトリに入れず、YouTube に上げて ID を登録する。

- **限定公開（unlisted）は埋め込み再生できる**。検索や一覧には出ないが、リンクを知っている人と、このサイトの埋め込みからは見られる。
- **非公開（private）は埋め込めない**ので使わない。
- `/admin` の入力欄は **URL をそのまま貼れる**（`watch?v=` / `youtu.be` / `shorts` / `embed` から ID を取り出す）。
- サムネイルは空でよい。空なら YouTube のサムネイル（`i.ytimg.com`）を自動で使う。
- 埋め込みは `youtube-nocookie.com` で、**クリックするまで iframe を読まない**ので初期表示は軽い。

貼れる場所は 3 つ:

| 置き場 | 入口 |
| --- | --- |
| トップの大きい映像（reel） | `/admin` Home タブの「YouTube の URL または ID」（mp4 より優先） |
| 演奏映像 | `/admin` Piano タブ、種類を「YouTube」にする |
| 作品のデモ | `/admin` Work タブ、主役のメディアを「YouTube」にする |

mp4 を `public/media/` に置く方法も残してあるが、`.gitignore` で動画は除外している。理由:

- GitHub は 100MB を超えるファイルを受け付けない。
- Vercel などの無料枠は転送量に上限があり、mp4 の直配信はすぐ消費する。

## /admin でできること

`npm run dev` で起動して `http://localhost:3000/admin`。パスワードは `.env.local` の `ADMIN_PASSWORD`。
タブは 4 つあり、保存すると原稿ファイルを書き換えて、関係するページを作り直す（`revalidatePath`）。

| タブ | できること | 書き換わるファイル |
| --- | --- | --- |
| Home | トップの大きい映像（リール）の動画・静止画・見出し、受付中バッジ、Piano の前振り | `content/site.json` |
| Piano | 演奏映像の追加・編集・削除、「いま練習している曲」、録音、レパートリー | `content/performances.json` / `content/music.json` |
| Work | 作品の frontmatter（タイトル・概要・種類・状態・技術・URL）と**本文 MDX**、主役メディアの差し替え、注目作の切り替え | `content/projects/*.mdx` |
| Media | 動画・画像・音源のアップロード（200MB まで）、一覧、削除、パスのコピー | `public/media/` / `public/covers/` |
| Notes | ノートの追加・削除 | `content/notes.json` |

動画の差し替えは Media に上げてから、Piano / Work のパス欄で選ぶ（入力欄はアップロード済みファイルの候補が出る）。
主役メディアの種類（動画 / YouTube / 静止画）を切り替えると、使わないキーは保存時に frontmatter から消える。

注意:

- 保存には `CONTENT_STORE=file` と書き込めるディスクが必要。Vercel などの本番既定は読み取り専用（読み取り専用なら画面に警告が出る）。
- ログイン Cookie は本番ビルドでは `secure` 付きなので、`next start` を **http** で開くとログインできない。ローカルで編集するときは `npm run dev` を使う。
- `npm run dev` と `npm run start` を同時に動かさない（どちらも `.next` を使うため壊れる）。
- Work タブで保存すると frontmatter は書き直されるので、MDX のコメント行（`# youtubeId: ...` などのメモ）は消える。

## 演奏映像の追加

管理画面を使わない場合は `content/performances.json` の `clips` に追記する。新しい日付が上に来る。

```json
{
	"id": "clip-nocturne",
	"title": "ノクターン Op.9 No.2",
	"composer": "F. Chopin",
	"date": "2026-10-01",
	"lengthLabel": "4:32",
	"note": "一言メモ",
	"media": { "type": "video", "src": "/media/nocturne.mp4", "poster": "/media/nocturne.jpg" }
}
```

YouTube に上げているものは `media` をこう書く。`poster` は省略でよい（YouTube のサムネを使う）。

```json
"media": { "type": "youtube", "videoId": "xxxxxxxxxxx" }
```

トップには新しい 3 本、`/music` には全部出る。

## トップのリール（「reel 準備中」の正体）

トップの大きい枠が `reel`。`content/site.json` の `reel.src` が空のあいだは、静止画（既定は `public/media/placeholder-reel.png`）に「reel 準備中」のバッジが出る。
mp4 のパスを入れると「now playing」に変わり、無音ループで自動再生（音はボタンで有効化、`prefers-reduced-motion` では自動再生しない）。

`/admin` の Home タブから編集できる。手で書くなら:

```json
{ "reel": { "src": "/media/showreel.mp4", "poster": "/media/showreel.jpg", "title": "Showreel 2026", "note": "latest work" } }
```

## 作品の追加

`content/projects/*.mdx` に frontmatter + 本文。

```yaml
video: /media/crafttown-demo.mp4
videoPoster: /media/crafttown-demo.jpg
mediaCaption: プレイ映像 30 秒
```

優先順位は `video` > `youtubeId` > `cover`。`featured: true` の作品がトップの Selected work に出る。

プレーヤーの操作: クリックまたは `space` / `k` で再生停止、`←` `→` で 5 秒、`m` でミュート、`f` で全画面。速度は 1x / 1.25x / 1.5x / 2x。

## 環境変数

| 名前 | 用途 |
| --- | --- |
| `ADMIN_PASSWORD` | `/admin` のログイン。未設定ならログイン不可。 |
| `CONTENT_STORE` | `file` なら `/admin` からの保存を原稿ファイルに書き込む。本番既定は読み取り専用。 |
| `NOTES_STORE` | 旧設定。`CONTENT_STORE` が無いときのノートの保存先として見る。 |
| `NEXT_PUBLIC_SITE_URL` | 絶対 URL。sitemap / RSS / OG 画像に使う。 |

パスワードは HMAC 署名付きの httpOnly Cookie。localStorage には持たない。

## コンテンツの置き場所

- `content/site.json` — トップのリールと見出しテキスト
- `content/projects/*.mdx` — 作品
- `content/performances.json` — 演奏映像
- `content/music.json` — 練習中の曲、録音、レパートリー
- `content/notes.json` — ノート（`/admin` からも追加できる）
- `public/media/` — 動画と音声、`public/covers/` — サムネイル

## 構成

```
app/        ルートと API、CSS は app/styles/
components/ プレーヤー、クリップ、カード、ナビ、AppleMark
lib/        データ読み込み、認証、サイト設定
content/    原稿と JSON
scripts/    サムネイル取得
```

`/desk`（機材ページ）と UI 効果音、Web Audio の鍵盤ウィジェットは削除済み。

旧 URL `/transmissions` は `/notes` に 308 で転送。
