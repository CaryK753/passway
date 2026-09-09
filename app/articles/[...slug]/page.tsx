import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { articleBody, getPublicArticle } from "../../../lib/public-content";

interface ArticlePageProps {
  params: Promise<{ slug: string[] }>;
}

export async function generateMetadata(
  { params }: ArticlePageProps,
): Promise<Metadata> {
  const article = await getPublicArticle((await params).slug);
  if (!article) return {};
  return {
    title: article.metadata.title,
    description: article.metadata.summary,
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const article = await getPublicArticle((await params).slug);
  if (!article) notFound();
  const metadata = article.metadata;

  return (
    <main className="reader-layout">
      <article className="reader">
        <Link className="back-link" href="/">← 返回文章列表</Link>
        <p className="eyebrow">人工核验文章</p>
        <h1>{metadata.title}</h1>
        <p className="article-summary">{metadata.summary}</p>
        <div className="trust-strip">
          <span>状态：已核验</span>
          <span>核验日期：{metadata.last_reviewed}</span>
          <span>下次复核：{metadata.review_due}</span>
        </div>
        <div className="markdown-body">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {articleBody(article.markdown)}
          </ReactMarkdown>
        </div>
      </article>

      <aside className="source-panel">
        <p className="eyebrow">OFFICIAL SOURCES</p>
        <h2>来源</h2>
        <ol>
          {metadata.sources.map((source) => (
            <li key={source}>
              <a href={source} rel="noreferrer" target="_blank">{source}</a>
            </li>
          ))}
        </ol>
        <p className="source-note">
          AI Wiki 与问答是解释层，不会改变这篇人工文章的核验状态。
        </p>
      </aside>
    </main>
  );
}
