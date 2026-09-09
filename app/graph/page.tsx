import { WikiGraphView } from "../../components/wiki-graph";

export default function GraphPage() {
  return <main className="wiki-page"><section className="page-hero">
    <p className="eyebrow">KNOWLEDGE GRAPH</p><h1>关系图谱</h1>
    <p>浏览 WeKnora 从文章中派生的 Wiki 页面及双向关联。</p>
  </section><WikiGraphView /></main>;
}
