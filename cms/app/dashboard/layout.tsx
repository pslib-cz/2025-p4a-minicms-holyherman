"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const drawerWidth = 260;

const navItems = [
  {
    label: "Dashboard Home",
    href: "/dashboard",
    icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  },
  {
    label: "My Posts",
    href: "/dashboard/posts",
    icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  },
  {
    label: "Tags",
    href: "/dashboard/tags",
    icon: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z",
  },
];

const bottomItems = [
  {
    label: "View Public Site",
    href: "/",
    icon: "M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14",
    external: true,
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname?.startsWith(href);
  };

  const pageTitle =
    pathname === "/dashboard"
      ? "Dashboard"
      : pathname?.includes("/posts")
        ? "Posts Management"
        : pathname?.includes("/tags")
          ? "Tags Management"
          : "Admin";

  const sidebar = (
    <div className="flex flex-col h-full bg-surface-lowest">
      <div className="flex items-center h-16 px-6">
        <span className="font-[var(--font-display)] text-xl font-bold text-primary">
          CMS
        </span>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
              isActive(item.href)
                ? "bg-primary-fixed/20 text-primary"
                : "text-on-surface-variant hover:text-primary hover:bg-surface-low"
            }`}
          >
            <svg
              className="w-5 h-5 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d={item.icon}
              />
            </svg>
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="px-3 py-4 space-y-1">
        {bottomItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            target={item.external ? "_blank" : undefined}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-on-surface-variant hover:text-primary hover:bg-surface-low transition-colors"
          >
            <svg
              className="w-5 h-5 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d={item.icon}
              />
            </svg>
            {item.label}
          </a>
        ))}
        <form action="/api/auth/signout" method="POST">
          <button
            type="submit"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-secondary hover:bg-secondary-container/10 transition-colors w-full"
          >
            <svg
              className="w-5 h-5 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Sign Out
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="flex w-full bg-surface-low" style={{ height: "calc(100vh - 64px)" }}>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-on-surface/20 backdrop-blur-sm z-40 sm:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div
        className={`fixed top-0 left-0 h-full z-50 transition-transform duration-300 sm:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ width: drawerWidth }}
      >
        {sidebar}
      </div>

      {/* Desktop drawer */}
      <div
        className="hidden sm:block shrink-0 h-full shadow-ambient"
        style={{ width: drawerWidth }}
      >
        {sidebar}
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-auto">
        <header className="glass sticky top-0 z-30 h-16 flex items-center px-6 shrink-0">
          <button
            className="sm:hidden mr-4 p-2 rounded-xl text-on-surface-variant hover:text-primary hover:bg-surface-low transition-colors"
            onClick={() => setMobileOpen(true)}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <h1 className="font-[var(--font-display)] text-lg font-bold text-on-surface">
            {pageTitle}
          </h1>
        </header>
        <main className="flex-1 p-6 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
