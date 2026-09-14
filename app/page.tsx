import Link from "next/link";
import { ProjectCard } from "@/components/ProjectCard";
import { getProjects } from "@/lib/projects";

const SLOT_COUNT = 6;

export default function HomePage() {
  const projects = getProjects();
  const featured = projects.find((project) => project.featured) ?? projects[0];
  const filled = projects.slice(0, SLOT_COUNT);
  const emptyCount = Math.max(0, SLOT_COUNT - filled.length);

  return (
    <>
      <section className="hero">
        <div>
          <h1 className="glitch" data-text="Portfolio">Portfolio</h1>
          <p className="tagline typing">ゲームとツール。</p>
        </div>
        <Link className="btn mono blink" href={featured ? `/work/${featured.slug}` : "/work"}>
          PRESS START
        </Link>
      </section>

      {featured ? (
        <a
          className="featured hud"
          href={featured.playable && featured.liveUrl ? featured.liveUrl : `/work/${featured.slug}`}
          target={featured.playable ? "_blank" : undefined}
          rel={featured.playable ? "noreferrer" : undefined}
        >
          <img src={featured.cover} alt={`${featured.title} cover`} />
          <div className="featured-bar">
            <div>
              <p className="kind mono">{featured.kind}</p>
              <h2>{featured.title}</h2>
              <p className="summary">{featured.summary}</p>
            </div>
            <span className="btn mono">{featured.playable ? "Play" : "Open"}</span>
          </div>
        </a>
      ) : null}

      <p className="section-label mono">Projects [ ゲーム & ツール ]</p>
      <div className="inventory">
        {filled.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
        {Array.from({ length: emptyCount }).map((_, index) => (
          <div className="slot empty" key={`empty-${index}`} aria-hidden="true" />
        ))}
      </div>

      <footer className="foot mono">
        Slot {filled.length} / {SLOT_COUNT} · Personal work only
      </footer>
    </>
  );
}
