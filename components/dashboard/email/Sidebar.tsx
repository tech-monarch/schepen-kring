"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { sidebarLinks, folders } from "@/lib/data";
import { Settings, Plus, FolderPlus } from "lucide-react";

interface SidebarProps {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

export function Sidebar({ selectedCategory, onSelectCategory }: SidebarProps) {
  return (
    <aside className="flex w-full flex-col bg-gradient-to-b from-white/90 via-blue-50/60 to-indigo-50/30 backdrop-blur-sm dark:from-slate-950/90 dark:via-blue-950/30 dark:to-indigo-950/20 h-full border-r-2 border-blue-200/50 dark:border-blue-800/30">
      <ScrollArea className="flex-1 px-3">
        {/* Main Navigation */}
        <nav className="space-y-2">
          {sidebarLinks.map((link) => {
            const isActive = selectedCategory === link.category;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`
                  group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-300 shadow-sm hover:shadow-md
                  ${
                    isActive
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                      : "text-slate-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-slate-900 dark:text-slate-300 dark:hover:from-blue-950/30 dark:hover:to-purple-950/30 dark:hover:text-slate-100"
                  }
                `}
                onClick={() => onSelectCategory(link.category)}
                prefetch={false}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-300 ${
                    isActive
                      ? "bg-white/20 text-white shadow-sm"
                      : "bg-gradient-to-r from-blue-100 to-purple-100 text-blue-600 group-hover:from-blue-200 group-hover:to-purple-200 dark:from-blue-900/50 dark:to-purple-900/50 dark:text-blue-400"
                  }`}
                >
                  <link.icon className="h-4 w-4" />
                </div>
                <span className="flex-1">{link.name}</span>
                {link.count !== 0 && (
                  <span
                    className={`
                    flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 shadow-sm
                    ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-gradient-to-r from-red-400 to-pink-500 text-white"
                    }
                  `}
                  >
                    {link.count > 99 ? "99+" : link.count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Folders Section */}
        {folders.length > 0 && (
          <>
            <div className="my-8 px-4">
              <div className="h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent dark:via-blue-800" />
            </div>

            <div className="flex items-center justify-between px-4 pb-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                📁 Folders
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 rounded-xl bg-gradient-to-r from-green-100 to-emerald-100 text-green-600 hover:from-green-200 hover:to-emerald-200 hover:text-green-700 dark:from-green-900/30 dark:to-emerald-900/30 dark:text-green-400"
              >
                <FolderPlus className="h-3 w-3" />
              </Button>
            </div>

            <nav className="space-y-1">
              {folders.map((folder) => {
                const isActive = selectedCategory === folder.category;
                return (
                  <Link
                    key={folder.name}
                    href={folder.href}
                    className={`
                      group flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-300
                      ${
                        isActive
                          ? "bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg transform hover:scale-[1.02]"
                          : "text-slate-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:text-slate-900 dark:text-slate-300 dark:hover:from-green-950/20 dark:hover:to-emerald-950/20 dark:hover:text-slate-100"
                      }
                    `}
                    onClick={() => onSelectCategory(folder.category)}
                    prefetch={false}
                  >
                    <div
                      className={`h-3 w-3 rounded-full transition-all duration-300 ${
                        isActive
                          ? "bg-white shadow-sm"
                          : "bg-gradient-to-r from-green-400 to-emerald-500 group-hover:from-green-500 group-hover:to-emerald-600"
                      }`}
                    />
                    <span className="flex-1">{folder.name}</span>
                  </Link>
                );
              })}
            </nav>
          </>
        )}
      </ScrollArea>

      {/* Colorful Footer Actions */}
      <div className="flex items-center justify-between p-6 pt-4 border-t-2 border-blue-200/50 dark:border-blue-700/50 bg-gradient-to-r from-blue-50/40 to-purple-50/30 dark:from-blue-950/20 dark:to-purple-950/15">
        <Button
          variant="outline"
          size="sm"
          className="border-2 border-orange-200 text-orange-700 hover:bg-orange-50 hover:border-orange-300 hover:shadow-md transition-all duration-200"
        >
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </Button>
        <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
          <Plus className="mr-2 h-4 w-4" />
          New Email
        </Button>
      </div>
    </aside>
  );
}
