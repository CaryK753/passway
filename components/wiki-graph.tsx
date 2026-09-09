"use client";

import { useEffect, useMemo, useState } from "react";
import type { WikiGraph } from "../lib/weknora";

export function WikiGraphView() {
  const [graph, setGraph] = useState<WikiGraph | null>(null);
  const [failed, setFailed] = useState(false);
  const [query, setQuery] = useState("");
  const [pageType, setPageType] = useState("all");
  const [zoom, setZoom] = useState(1);
  useEffect(() => {
    fetch("/api/wiki/graph").then((response) => {
      if (!response.ok) throw new Error("graph unavailable");
      return response.json();
    }).then(setGraph).catch(() => setFailed(true));
  }, []);
  const filteredNodes = useMemo(() => (graph?.nodes ?? []).filter((node) => {
    const matchesType = pageType === "all" || node.page_type === pageType;
    const matchesQuery = !query.trim() || node.title.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase());
    return matchesType && matchesQuery;
  }), [graph, pageType, query]);
  const points = useMemo(() => filteredNodes.map((node, index, nodes) => {
    const angle = (index / Math.max(nodes.length, 1)) * Math.PI * 2;
    const ring = Math.floor(index / 18);
    const radius = nodes.length < 3 ? index * 90 : 130 + ring * 85 + (index % 3) * 22;
    return { ...node, x: 400 + Math.cos(angle) * radius, y: 300 + Math.sin(angle) * radius };
  }), [filteredNodes]);
  if (failed) return <div className="empty-state"><h2>图谱暂时不可用</h2><p>请稍后重试。</p></div>;
  if (!graph) return <div className="empty-state"><h2>正在加载图谱</h2></div>;
  if ((graph.nodes?.length ?? 0) <= 1) return <div className="empty-state"><h2>图谱正在生成</h2><p>当前只有索引节点，派生关系会随 Wiki 生成后出现。</p></div>;
  const bySlug = new Map(points.map((point) => [point.slug, point]));
  const types = Array.from(new Set(graph.nodes.map((node) => node.page_type))).sort();
  return <div className="graph-browser">
    <div className="graph-toolbar">
      <label>搜索节点<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="例如：技术移民" /></label>
      <label>页面类型<select value={pageType} onChange={(event) => setPageType(event.target.value)}>
        <option value="all">全部</option>{types.map((type) => <option key={type} value={type}>{type}</option>)}
      </select></label>
      <label>缩放<input type="range" min="0.65" max="1.8" step="0.05" value={zoom} onChange={(event) => setZoom(Number(event.target.value))} /></label>
      <span>{points.length} / {graph.nodes.length} 个节点</span>
    </div>
    {points.length === 0 ? <div className="empty-state"><h2>没有匹配节点</h2><p>请调整关键词或页面类型。</p></div> :
    <div className="graph-shell"><svg role="img" aria-label={`Wiki 关系图谱，共 ${points.length} 个节点`} viewBox="0 0 800 600">
      <g transform={`translate(${400 - 400 * zoom} ${300 - 300 * zoom}) scale(${zoom})`}>
    {graph.edges.map((edge) => {
      const source = bySlug.get(edge.source); const target = bySlug.get(edge.target);
      return source && target ? <line key={`${edge.source}-${edge.target}`} x1={source.x} y1={source.y} x2={target.x} y2={target.y} /> : null;
    })}
    {points.map((point) => <a key={point.slug} href={`/wiki/${point.slug}`} aria-label={`打开 ${point.title}`}>
      <g tabIndex={0}><circle cx={point.x} cy={point.y} r={10 + Math.min(point.link_count, 10)} />
        <text x={point.x + 16} y={point.y + 5}>{point.title}</text></g>
    </a>)}
      </g>
    </svg></div>}
  </div>;
}
