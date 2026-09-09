import Link from "next/link";
import { articleHref, getPublicArticles } from "../lib/public-content";

export default async function HomePage() {
  const articles = await getPublicArticles();

  return (
    <main>
      <section className="hero">
        <p className="eyebrow">PUBLIC IMMIGRATION KNOWLEDGE</p>
        <h1>找到一条有依据的路径。</h1>
        <p className="hero-copy">
          Passway 整理全球移民政策和可行路径。每篇公开文章都经过人工复核，
          并保留核验日期与官方来源。
        </p>
      </section>

      <section className="content-section" aria-labelledby="article-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">VERIFIED ARTICLES</p>
            <h2 id="article-heading">已核验文章</h2>
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
                  <span>{article.metadata.jurisdiction}</span>
                  <span>{article.metadata.category}</span>
                </div>
                <h3>
                  <Link href={articleHref(article)}>{article.metadata.title}</Link>
                </h3>
                <p>{article.metadata.summary}</p>
                <small>核验于 {article.metadata.last_reviewed}</small>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
