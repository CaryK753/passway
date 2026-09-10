import Link from "next/link";
import { articleHref, getPublicArticles } from "../lib/public-content";

export const dynamic = "force-dynamic";

const jurisdictionNames: Record<string, string> = {
  australia: "澳大利亚",
  canada: "加拿大",
  ireland: "爱尔兰",
  "new-zealand": "新西兰",
  singapore: "新加坡",
  "united-kingdom": "英国",
  "united-states": "美国",
};

export default async function HomePage() {
  const articles = await getPublicArticles();

  return (
    <main>
      <section className="hero home-hero">
        <div className="hero-content">
          <p className="eyebrow"><span className="status-dot" />公益移民政策知识库</p>
          <h1>让每一条移民路径，<em>都有出处。</em></h1>
          <p className="hero-copy">从主管机关原始资料出发，梳理全球移民、工作与长期居留路径。免费开放，无需登录，不销售方案。</p>
          <div className="hero-actions">
            <a className="button button-primary" href="#articles">浏览国家与地区 <span>↓</span></a>
            <Link className="button button-secondary" href="/wiki">探索 AI Wiki <span>↗</span></Link>
          </div>
          <div className="trust-line"><span>人工核验</span><span>官方来源</span><span>持续更新</span></div>
        </div>
        <aside className="hero-panel" aria-label="资料库概览">
          <div className="panel-top"><span>PASSWAY INDEX</span><span className="live-label">LIVE</span></div>
          <strong>{articles.length}</strong>
          <p>个首批英语国家与地区</p>
          <div className="country-stack">
            {articles.slice(0, 7).map((article, index) => (
              <Link href={articleHref(article)} key={article.metadata.content_id}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                {jurisdictionNames[article.metadata.jurisdiction] ?? article.metadata.jurisdiction}
                <b>→</b>
              </Link>
            ))}
          </div>
        </aside>
      </section>

      <section className="feature-strip" aria-label="知识库能力">
        <Link href="/wiki"><span>01</span><strong>结构化 Wiki</strong><small>AI 整理概念与路径</small></Link>
        <Link href="/graph"><span>02</span><strong>关系图谱</strong><small>发现政策之间的关联</small></Link>
        <a href="/feeds/passway.xml"><span>03</span><strong>开放 RSS</strong><small>订阅每一次内容更新</small></a>
      </section>

      <section id="articles" className="content-section" aria-labelledby="article-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">COUNTRY GUIDES</p>
            <h2 id="article-heading">从目的地开始探索</h2>
          </div>
          <span>{articles.length} 篇</span>
        </div>

        {articles.length === 0 ? (
          <div className="empty-state">
            <h3>资料库正在整理</h3>
            <p>公开文章会在完成来源核验后出现。草稿不会进入网站或 RSS。</p>
          </div>
        ) : (
          <div className="article-grid">
            {articles.map((article) => (
              <article className="article-card" key={article.metadata.content_id}>
                <div className="card-meta">
                  <span>{jurisdictionNames[article.metadata.jurisdiction] ?? article.metadata.jurisdiction}</span>
                  <span>已核验</span>
                </div>
                <h3>
                  <Link href={articleHref(article)}>{article.metadata.title}</Link>
                </h3>
                <p>{article.metadata.summary}</p>
                <div className="card-footer"><small>更新于 {article.metadata.last_reviewed}</small><Link href={articleHref(article)} aria-label={`阅读${article.metadata.title}`}>阅读指南 →</Link></div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
