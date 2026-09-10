"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { GlobalSearch } from "./global-search";

const links = [
  ["目的地", "/#articles", "/articles"],
  ["Wiki", "/wiki", "/wiki"],
  ["图谱", "/graph", "/graph"],
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const closeSearch = useCallback(() => setSearchOpen(false), []);

  useEffect(() => {
    const saved = localStorage.getItem("passway-theme");
    const enabled = saved === "dark" || (!saved && matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.dataset.theme = enabled ? "dark" : "light";
    setDark(enabled);
  }, []);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLocaleLowerCase() === "k") { event.preventDefault(); setSearchOpen(true); }
      if (event.key === "/" && !(event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement)) { event.preventDefault(); setSearchOpen(true); }
    };
    document.addEventListener("keydown", handleShortcut);
    return () => document.removeEventListener("keydown", handleShortcut);
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.dataset.theme = next ? "dark" : "light";
    localStorage.setItem("passway-theme", next ? "dark" : "light");
  };

  return <>
    <header className="site-header">
      <Link className="brand" href="/" aria-label="Passway 首页" onClick={() => setMenuOpen(false)}>
        <span className="brand-mark">P</span><span className="brand-copy"><strong>Passway</strong><small>开放移民知识库</small></span>
      </Link>
      <nav className={menuOpen ? "open" : ""} aria-label="主导航">
        {links.map(([label, href, prefix]) => <Link className={pathname === prefix || pathname.startsWith(`${prefix}/`) ? "active" : ""} href={href} key={href} onClick={() => setMenuOpen(false)}>{label}</Link>)}
        <a className="nav-rss" href="/feeds/passway.xml">订阅 RSS</a>
      </nav>
      <div className="header-actions">
        <button className="icon-button search-button" onClick={() => setSearchOpen(true)} aria-label="搜索"><span>搜索</span><kbd>⌘ K</kbd></button>
        <button className="icon-button theme-button" onClick={toggleTheme} aria-label={dark ? "切换浅色主题" : "切换深色主题"}>{dark ? "☼" : "◐"}</button>
        <button className="icon-button menu-button" onClick={() => setMenuOpen((value) => !value)} aria-expanded={menuOpen} aria-label="打开导航菜单"><i /><i /></button>
      </div>
    </header>
    <GlobalSearch open={searchOpen} onClose={closeSearch} />
  </>;
}
