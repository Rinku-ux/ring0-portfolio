import type { Metadata } from "next"
import Link from "next/link"
import { SITE } from "@/lib/site"

export const metadata: Metadata = {
  title: "About",
  description: "ゲームとツールをつくり、ピアノを弾いています。",
  alternates: { canonical: "/about" },
}

export default function AboutPage() {
  return (
    <>
      <section className="page-head">
        <p className="mono">about</p>
        <h1>About</h1>
        <p>{SITE.roleJa}。手元で動くものと、弾けるようになった曲を置いています。</p>
      </section>
      <div className="grid-split">
        <div className="prose">
          <h2>つくっているもの</h2>
          <p>
            TypeScript と Next.js で小さなゲームやツールを作っています。
            その場で触れるものが好きです。作ったものは<Link href="/work">Work</Link>に、制作メモは作品ごとのページに書いています。
          </p>
          <h2>ピアノ</h2>
          <p>
            弾けたものは映像で残していて、
            <Link href="/music">Piano</Link>のページにまとめています。演奏はサイトの飾りではなく、作品と同じ「見せたいもの」として置いています。
          </p>
          <h2>名前について</h2>
          <p>
            ring0 は「りんご」と読めるところが気に入っています。
          </p>
        </div>
        <aside className="panel">
          <p className="mono">contact</p>
          <a className="btn btn-primary" href={`mailto:${SITE.email}`}>
            メールで連絡
          </a>
          <Link className="btn" href="/notes">
            Notes
          </Link>
          <a className="btn btn-quiet" href="/feed.xml">
            RSS
          </a>
          <p className="mono">stack</p>
          <div className="meta">
            {SITE.stack.map((item) => (
              <span className="tag" key={item}>
                {item}
              </span>
            ))}
          </div>
        </aside>
      </div>
    </>
  )
}
