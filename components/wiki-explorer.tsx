"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { WikiIndexGroup } from "../lib/weknora";

const typeNames: Record<string, string> = { concept: "概念", entity: "实体", index: "索引", summary: "摘要" };

export function WikiExplorer({ groups }: { groups: WikiIndexGroup[] }) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [limit, setLimit] = useState(18);
  const items = useMemo(() => groups.flatMap((group) => group.items.map((item) => ({ ...item, type: group.type }))), [groups]);
  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase();
    return items.filter((item) => (type === "all" || item.type === type) && (!term || `${item.title} ${item.summary}`.toLocaleLowerCase().includes(term)));
  }, [items, query, type]);
  const types = groups.filter((group) => group.total > 0);

  return <section className="wiki-explorer" aria-label="Wiki 浏览器">
    <div className="wiki-toolbar">
      <label><span>搜索 Wiki</span><input type="search" value={query} onChange={(event) => { setQuery(event.target.value); setLimit(18); }} placeholder="例如：技术移民、工作许可" /></label>
      <div className="wiki-type-tabs" aria-label="页面类型">
        <button className={type === "all" ? "active" : ""} onClick={() => { setType("all"); setLimit(18); }}>全部 <small>{items.length}</small></button>
        {types.map((group) => <button className={type === group.type ? "active" : ""} onClick={() => { setType(group.type); setLimit(18); }} key={group.type}>{typeNames[group.type] ?? group.type} <small>{group.total}</small></button>)}
      </div>
    </div>
    <div className="wiki-result-meta"><span>{filtered.length} 个匹配页面</span>{query && <button onClick={() => setQuery("")}>清除搜索</button>}</div>
    {filtered.length === 0 ? <div className="empty-state"><h2>没有匹配页面</h2><p>尝试缩短关键词或切换页面类型。</p></div> : <>
      <div className="wiki-list">{filtered.slice(0, limit).map((item) => <article key={item.slug}>
        <div className="wiki-card-meta"><span>{typeNames[item.type] ?? item.type}</span><span>AI 派生</span></div>
        <h3><Link href={`/wiki/${item.slug}`}>{item.title}</Link></h3><p>{item.summary}</p><Link className="wiki-card-link" href={`/wiki/${item.slug}`}>打开页面 →</Link>
      </article>)}</div>
      {limit < filtered.length && <button className="load-more" onClick={() => setLimit((value) => value + 18)}>再显示 {Math.min(18, filtered.length - limit)} 个页面</button>}
    </>}
  </section>;
}
