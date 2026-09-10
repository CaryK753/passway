"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { WikiIndex, WikiIndexItem } from "../lib/weknora";

const destinations = [
  ["澳大利亚", "/articles/australia/immigration-pathways-overview"],
  ["加拿大", "/articles/canada/immigration-pathways-overview"],
  ["爱尔兰", "/articles/ireland/immigration-pathways-overview"],
  ["新西兰", "/articles/new-zealand/immigration-pathways-overview"],
  ["新加坡", "/articles/singapore/immigration-pathways-overview"],
  ["英国", "/articles/united-kingdom/immigration-pathways-overview"],
  ["美国", "/articles/united-states/immigration-pathways-overview"],
] as const;

export function GlobalSearch({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<WikiIndexItem[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setStatus("loading");
    fetch("/api/wiki/index").then((response) => {
      if (!response.ok) throw new Error("search unavailable");
      return response.json() as Promise<WikiIndex>;
    }).then((index) => {
      setItems(index.groups.flatMap((group) => group.items));
      setStatus("ready");
    }).catch(() => setStatus("error"));
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [onClose, open]);

  const results = useMemo(() => {
    const term = query.trim().toLocaleLowerCase();
    if (!term) return items.slice(0, 6);
    return items.filter((item) => `${item.title} ${item.summary}`.toLocaleLowerCase().includes(term)).slice(0, 10);
  }, [items, query]);
  const countryResults = destinations.filter(([name]) => !query.trim() || name.includes(query.trim()));
  if (!open) return null;

  return <div className="search-backdrop" role="presentation" onMouseDown={onClose}>
    <section className="search-dialog" role="dialog" aria-modal="true" aria-label="搜索 Passway" onMouseDown={(event) => event.stopPropagation()}>
      <div className="search-input-wrap"><span aria-hidden="true">⌕</span><input ref={inputRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索国家、签证路径或 Wiki 概念" aria-label="搜索内容" /><kbd>ESC</kbd></div>
      <div className="search-results" aria-live="polite">
        {countryResults.length > 0 && <div className="search-group"><p>目的地文章</p>{countryResults.map(([name, href]) => <Link href={href} onClick={onClose} key={href}><span>{name}</span><small>人工核验指南</small><b>→</b></Link>)}</div>}
        <div className="search-group"><p>AI Wiki</p>
          {status === "loading" && <div className="search-message">正在载入知识索引…</div>}
          {status === "error" && <div className="search-message">Wiki 索引暂时不可用，目的地文章仍可正常访问。</div>}
          {status === "ready" && results.map((item) => <Link href={`/wiki/${item.slug}`} onClick={onClose} key={item.slug}><span>{item.title}</span><small>{item.summary}</small><b>→</b></Link>)}
          {status === "ready" && results.length === 0 && <div className="search-message">没有找到匹配的 Wiki 页面。</div>}
        </div>
      </div>
      <div className="search-footer"><span>输入关键词筛选</span><span>按 ESC 关闭</span></div>
    </section>
  </div>;
}
