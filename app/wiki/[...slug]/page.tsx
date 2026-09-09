import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { encodeWikiSlug, fetchWeKnora, WikiPage, wikiPath } from "../../../lib/weknora";

interface Props { params: Promise<{ slug: string[] }> }

export const dynamic = "force-dynamic";

export default async function WikiDetailPage({ params }: Props) {
  const slug = (await params).slug.join("/");
  let page: WikiPage;
  try { page = await fetchWeKnora<WikiPage>(wikiPath(`/pages/${encodeWikiSlug(slug)}`)); }
  catch { notFound(); }
  return <main className="reader-layout">
    <article className="reader">
      <Link className="back-link" href="/wiki">← 返回 Wiki</Link>
      <p className="eyebrow">AI DERIVED · {page.page_type}</p>
      <h1>{page.title}</h1><p className="article-summary">{page.summary}</p>
      <div className="markdown-body"><ReactMarkdown remarkPlugins={[remarkGfm]}>{page.content}</ReactMarkdown></div>
    </article>
    <aside className="source-panel">
      <p className="eyebrow">TRACEABILITY</p><h2>派生信息</h2>
      <p>{page.source_refs?.length ?? 0} 个来源文档</p>
      <p>{page.in_links?.length ?? 0} 个入链 · {page.out_links?.length ?? 0} 个出链</p>
      <p className="source-note">这是 AI 派生页面。重要结论请返回人工核验文章和官方来源确认。</p>
    </aside>
  </main>;
}
