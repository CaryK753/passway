import Link from "next/link";
import { fetchWeKnora, isWeKnoraConfigured, WikiIndex, wikiPath } from "../../lib/weknora";

export const dynamic = "force-dynamic";

export default async function WikiPage() {
  let index: WikiIndex | null = null;
  let unavailable = false;
  if (isWeKnoraConfigured()) {
    try { index = await fetchWeKnora<WikiIndex>(wikiPath("/index?limit=100")); }
    catch { unavailable = true; }
  }
  const groups = index?.groups.filter((group) => group.total > 0) ?? [];
  return <main className="wiki-page">
    <section className="page-hero">
      <p className="eyebrow">AI DERIVED WIKI</p><h1>Wiki</h1>
      <p>由 WeKnora 根据已核验文章自动整理。Wiki 是导航与解释层，原始文章仍是事实依据。</p>
      <Link className="text-link" href="/graph">打开关系图谱 →</Link>
    </section>
    {unavailable || !isWeKnoraConfigured() ?
      <div className="empty-state"><h2>Wiki 暂时不可用</h2><p>文章仍可正常浏览，系统恢复后会自动显示派生内容。</p></div> :
      groups.length === 0 ?
        <div className="empty-state"><h2>Wiki 正在生成</h2><p>RSS 文档已经入库，WeKnora 正在完成解析与跨文档整理。</p></div> :
        <div className="wiki-groups">{groups.map((group) => <section key={group.type} className="wiki-group">
          <div className="section-heading"><h2>{group.type}</h2><span>{group.total} 页</span></div>
          <div className="wiki-list">{group.items.map((item) => <article key={item.slug}><h3>{item.title}</h3><p>{item.summary}</p></article>)}</div>
        </section>)}</div>}
  </main>;
}
