import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="Passway 首页">
        <span className="brand-mark">P</span>
        <span className="brand-copy"><strong>Passway</strong><small>开放移民知识库</small></span>
      </Link>
      <nav aria-label="主导航">
        <Link href="/#articles">目的地</Link>
        <Link href="/wiki">Wiki</Link>
        <Link href="/graph">图谱</Link>
        <a className="nav-rss" href="/feeds/passway.xml">订阅 RSS</a>
      </nav>
    </header>
  );
}
