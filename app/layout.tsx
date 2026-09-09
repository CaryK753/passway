import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SiteHeader } from "../components/site-header";
import { SITE_URL } from "../lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: SITE_URL,
  title: {
    default: "Passway — 全球移民政策知识库",
    template: "%s | Passway",
  },
  description: "公开、可审计、可版本化的全球移民政策资料。",
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": "/feeds/passway.xml",
    },
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <SiteHeader />
        {children}
        <footer>
          公益信息项目，不构成法律意见。政策可能变化，请以官方来源为准。
        </footer>
      </body>
    </html>
  );
}
