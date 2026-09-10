"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { WikiGraph } from "../lib/weknora";

type GraphNode = WikiGraph["nodes"][number];

export function WikiGraphView() {
  const [graph, setGraph] = useState<WikiGraph | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [reload, setReload] = useState(0);
  const [query, setQuery] = useState("");
  const [pageType, setPageType] = useState("all");
  const [zoom, setZoom] = useState(1);
  const [showAll, setShowAll] = useState(false);
  const [selected, setSelected] = useState<GraphNode | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setStatus("loading");
    fetch("/api/wiki/graph", { signal: controller.signal }).then((response) => {
      if (!response.ok) throw new Error("graph unavailable");
      return response.json() as Promise<WikiGraph>;
    }).then((value) => { setGraph(value); setStatus("ready"); }).catch((error: Error) => {
      if (error.name !== "AbortError") setStatus("error");
    });
    return () => controller.abort();
  }, [reload]);

  const matchingNodes = useMemo(() => (graph?.nodes ?? []).filter((node) => {
    const matchesType = pageType === "all" || node.page_type === pageType;
    const matchesQuery = !query.trim() || node.title.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase());
    return matchesType && matchesQuery;
  }).sort((a, b) => b.link_count - a.link_count), [graph, pageType, query]);
  const visibleNodes = useMemo(() => showAll || query.trim() ? matchingNodes : matchingNodes.slice(0, 42), [matchingNodes, query, showAll]);
  const points = useMemo(() => visibleNodes.map((node, index, nodes) => {
    if (index === 0) return { ...node, x: 400, y: 300, showLabel: true };
    const ring = Math.floor((index - 1) / 14);
    const start = ring * 14 + 1;
    const size = Math.min(14, nodes.length - start);
    const angle = ((index - start) / Math.max(size, 1)) * Math.PI * 2 - Math.PI / 2;
    const radius = 105 + ring * 100;
    return { ...node, x: 400 + Math.cos(angle) * radius, y: 300 + Math.sin(angle) * radius, showLabel: index < 16 || Boolean(query.trim()) };
  }), [query, visibleNodes]);
  const pointBySlug = new Map(points.map((point) => [point.slug, point]));
  const selectedNeighbors = useMemo(() => new Set((graph?.edges ?? []).flatMap((edge) => {
    if (!selected) return [];
    if (edge.source === selected.slug) return [edge.target];
    if (edge.target === selected.slug) return [edge.source];
    return [];
  })), [graph, selected]);
  const types = Array.from(new Set((graph?.nodes ?? []).map((node) => node.page_type))).sort();

  if (status === "loading") return <div className="graph-loading" aria-live="polite"><span /><span /><span /><p>正在整理知识关系…</p></div>;
  if (status === "error") return <div className="empty-state"><h2>图谱暂时不可用</h2><p>文章和 Wiki 仍可正常浏览。</p><button className="retry-button" onClick={() => setReload((value) => value + 1)}>重新加载</button></div>;
  if (!graph || graph.nodes.length <= 1) return <div className="empty-state"><h2>图谱正在生成</h2><p>派生关系会随 Wiki 生成后出现。</p></div>;

  return <div className="graph-browser">
    <div className="graph-toolbar">
      <label>搜索节点<input value={query} onChange={(event) => { setQuery(event.target.value); setSelected(null); }} placeholder="例如：技术移民" /></label>
      <label>页面类型<select value={pageType} onChange={(event) => { setPageType(event.target.value); setSelected(null); }}><option value="all">全部</option>{types.map((type) => <option key={type} value={type}>{type}</option>)}</select></label>
      <label>缩放<input type="range" min="0.65" max="1.8" step="0.05" value={zoom} onChange={(event) => setZoom(Number(event.target.value))} /></label>
      <label className="graph-toggle"><input type="checkbox" checked={showAll} onChange={(event) => setShowAll(event.target.checked)} />显示全部节点</label>
      <span>{points.length} / {matchingNodes.length} 个匹配节点</span>
    </div>
    <div className="graph-note"><span>点击节点可聚焦其直接关系。</span><span>节点越大，关联越多。</span></div>
    {selected && <aside className="node-inspector" aria-live="polite"><div><small>{selected.page_type} · {selected.link_count} 条关联</small><strong>{selected.title}</strong></div><span>{selectedNeighbors.size} 个关系节点在图中高亮</span><Link href={`/wiki/${selected.slug}`}>打开 Wiki 页面 →</Link><button onClick={() => setSelected(null)} aria-label="取消节点聚焦">×</button></aside>}
    {points.length === 0 ? <div className="empty-state"><h2>没有匹配节点</h2><p>请调整关键词或页面类型。</p></div> : <div className="graph-shell"><svg role="img" aria-label={`Wiki 关系图谱，共 ${points.length} 个节点`} viewBox="0 0 800 600">
      <g transform={`translate(${400 - 400 * zoom} ${300 - 300 * zoom}) scale(${zoom})`}>
        {graph.edges.map((edge) => {
          const source = pointBySlug.get(edge.source); const target = pointBySlug.get(edge.target);
          const highlighted = selected && (edge.source === selected.slug || edge.target === selected.slug);
          return source && target ? <line className={selected ? highlighted ? "highlighted" : "dimmed" : ""} key={`${edge.source}-${edge.target}`} x1={source.x} y1={source.y} x2={target.x} y2={target.y} /> : null;
        })}
        {points.map((point) => {
          const active = selected?.slug === point.slug;
          const related = selectedNeighbors.has(point.slug);
          return <a className={selected ? active ? "active" : related ? "related" : "dimmed" : ""} key={point.slug} href={`/wiki/${point.slug}`} aria-label={`聚焦 ${point.title}`} onClick={(event) => { event.preventDefault(); setSelected(point); }}>
            <g tabIndex={0}><title>{point.title} · {point.link_count} 条关联</title><circle cx={point.x} cy={point.y} r={7 + Math.min(point.link_count / 2, 8)} />{point.showLabel || active || related ? <text x={point.x + 14} y={point.y + 4}>{point.title.length > 16 ? `${point.title.slice(0, 16)}…` : point.title}</text> : null}</g>
          </a>;
        })}
      </g>
    </svg></div>}
  </div>;
}
