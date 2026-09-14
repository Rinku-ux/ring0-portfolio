"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/work", label: "Work" },
  { href: "/about", label: "About" },
] as const;

export function Nav() {
  const pathname = usePathname();

  return (
    <header className="top">
      <Link className="brand mono" href="/" title="トップページへ戻る">
        <span className="brand-title">Portfolio</span>
        <span className="brand-hint">ゲームとツール</span>
      </Link>
      <nav className="primary mono" aria-label="primary">
        {LINKS.map((link) => {
          const current =
            link.href === "/work"
              ? pathname.startsWith("/work")
              : pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={current ? "page" : undefined}
            >
              <span className="nav-prefix">{current ? "▶" : ">"}</span>
              {link.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
