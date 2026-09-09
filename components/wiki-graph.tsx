"use client";

import { useEffect, useMemo, useState } from "react";
import type { WikiGraph } from "../lib/weknora";

export function WikiGraphView() {
  const [graph, setGraph] = useState<WikiGraph | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    fetch("/api/wiki/graph").then((response) => {
      if (!response.ok) throw new Error("graph unavailable");
      return response.json();
    }).then(setGraph).catch(() => setFailed(true));
  }, []);
  const points = useMemo(() => (graph?.nodes ?? []).map((node, index, nodes) => {
    const angle = (index / Math.max(nodes.length, 1)) * Math.PI * 2;
    const radius = nodes.length < 3 ? index * 90 : 150 + (index % 3) * 55;
    return { ...node, x: 400 + Math.cos(angle) * radius, y: 300 + Math.sin(angle) * radius };
  }), [graph]);
  if (failed) return <div className="empty-state"><h2>图谱暂时不可用</h2><p>请稍后重试。</p></div>;
  if (!graph) return <div className="empty-state"><h2>正在加载图谱</h2></div>;
  if (points.length <= 1) return <div className="empty-state"><h2>图谱正在生成</h2><p>当前只有索引节点，派生关系会随 Wiki 生成后出现。</p></div>;
  const bySlug = new Map(points.map((point) => [point.slug, point]));
  return <div className="graph-shell"><svg role="img" aria-label={`Wiki 关系图谱，共 ${points.length} 个节点`} viewBox="0 0 800 600">
    {graph.edges.map((edge) => {
      const source = bySlug.get(edge.source); const target = bySlug.get(edge.target);
      return source && target ? <line key={`${edge.source}-${edge.target}`} x1={source.x} y1={source.y} x2={target.x} y2={target.y} /> : null;
    })}
    {points.map((point) => <g key={point.slug} tabIndex={0} aria-label={point.title}>
      <circle cx={point.x} cy={point.y} r={10 + Math.min(point.link_count, 10)} />
      <text x={point.x + 16} y={point.y + 5}>{point.title}</text>
    </g>)}
  </svg></div>;
}
