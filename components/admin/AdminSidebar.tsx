"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut } from "next-auth/react";

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const getLinkClass = (path: string) => {
    return pathname === path
      ? "flex items-center gap-4 p-3 rounded-lg bg-secondary text-on-secondary border-4 border-on-surface brutal-shadow-sm font-body text-[18px] leading-[150%] font-medium"
      : "flex items-center gap-4 p-3 rounded-lg text-on-surface hover:bg-surface-variant hover:brutal-shadow-sm hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all font-body text-[18px] leading-[150%] font-medium";
  };

  const getIconStyle = (path: string) => {
    return pathname === path ? { fontVariationSettings: "'FILL' 1" } : {};
  };

  const closeMenu = () => setIsOpen(false);

  return (
    <>
      {/* Mobile Menu Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="xl:hidden fixed top-6 right-6 z-50 bg-secondary text-on-secondary p-3 border-4 border-on-surface brutal-shadow flex items-center justify-center hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all"
      >
        <span className="material-symbols-outlined">
          {isOpen ? "close" : "menu"}
        </span>
      </button>

      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="xl:hidden fixed inset-0 bg-surface/80 backdrop-blur-sm z-40"
          onClick={closeMenu}
        />
      )}

      {/* Sidebar Navigation */}
      <nav
        className={`flex flex-col h-screen w-64 fixed left-0 top-0 bg-primary-container border-r-4 border-on-surface brutal-shadow p-2 space-y-6 z-50 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full xl:translate-x-0"
        }`}
      >
        <div className="flex items-center gap-4 px-4 py-6 border-b-4 border-on-surface">
          <div className="w-12 h-12 bg-secondary border-4 border-on-surface rounded-full flex items-center justify-center overflow-hidden brutal-shadow-sm shrink-0">
            <span
              className="material-symbols-outlined text-on-secondary"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              person
            </span>
          </div>
          <div>
            <h2 className="font-headline text-[20px] leading-[110%] font-black text-on-surface truncate">
              Admin Panel
            </h2>
            <p className="font-mono text-[14px] leading-[120%] font-bold text-on-surface-variant truncate">
              Manage Portfolio
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 px-2 hide-scrollbar">
          <Link
            className={getLinkClass("/admin/overview")}
            href="/admin/overview"
            onClick={closeMenu}
          >
            <span
              className="material-symbols-outlined"
              style={getIconStyle("/admin/overview")}
            >
              dashboard
            </span>
            Overview
          </Link>
          <Link
            className={getLinkClass("/admin/project")}
            href="/admin/project"
            onClick={closeMenu}
          >
            <span
              className="material-symbols-outlined"
              style={getIconStyle("/admin/project")}
            >
              work
            </span>
            Project
          </Link>
          <Link
            className={getLinkClass("/admin/certificates")}
            href="/admin/certificates"
            onClick={closeMenu}
          >
            <span
              className="material-symbols-outlined"
              style={getIconStyle("/admin/certificates")}
            >
              verified
            </span>
            Certificates
          </Link>
          <Link
            className={getLinkClass("/admin/skills")}
            href="/admin/skills"
            onClick={closeMenu}
          >
            <span
              className="material-symbols-outlined"
              style={getIconStyle("/admin/skills")}
            >
              psychology
            </span>
            Skills
          </Link>
        </div>

        <div className="mt-auto pt-4 border-t-4 border-on-surface px-2">
          <button
            className="w-full flex items-center justify-center gap-2 p-4 bg-tertiary-fixed text-on-surface border-4 border-on-surface brutal-shadow hover:translate-x-1 hover:translate-y-1 hover:brutal-shadow-sm active:translate-x-2 active:translate-y-2 active:shadow-none transition-all font-mono text-[14px] leading-[120%] font-bold uppercase"
            onClick={() => {
              closeMenu();
              signOut({ callbackUrl: "/admin/login" });
            }}
          >
            <span className="material-symbols-outlined">logout</span>
            Logout
          </button>
        </div>
      </nav>
    </>
  );
}
