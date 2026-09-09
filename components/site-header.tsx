import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="Passway 首页">
        <span className="brand-mark">P</span>
        <span>Passway</span>
      </Link>
      <nav aria-label="主导航">
        <Link href="/">文章</Link>
        <a href="/feeds/passway.xml">RSS</a>
        <Link href="/wiki">Wiki</Link>
        <Link href="/graph">图谱</Link>
      </nav>
    </header>
  );
}
