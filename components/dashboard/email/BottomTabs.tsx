"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { sidebarLinks, PRIMARY_TAB_COUNT, folders } from "@/lib/data";
import { MoreHorizontal, X } from "lucide-react";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

interface BottomTabsProps {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

export function BottomTabs({
  selectedCategory,
  onSelectCategory,
}: BottomTabsProps) {
  const primaryTabs = sidebarLinks.slice(0, PRIMARY_TAB_COUNT);
  const moreTabs = sidebarLinks.slice(PRIMARY_TAB_COUNT);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  const handleSelectCategoryAndClose = (category: string | null) => {
    onSelectCategory(category);
    setIsMoreMenuOpen(false);
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm dark:bg-slate-950/90 border-t border-slate-200/60 dark:border-slate-800/60">
      <nav className="flex items-center h-16 px-1">
        {primaryTabs.map((link) => {
          const isActive = selectedCategory === link.category;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`
                flex flex-1 flex-col items-center justify-center gap-1 rounded-xl mx-1 py-2 text-xs font-medium transition-all duration-200
                ${
                  isActive
                    ? "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/30"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/60 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800/30"
                }
              `}
              onClick={() => onSelectCategory(link.category)}
              prefetch={false}
            >
              <div className="relative">
                <link.icon className="h-5 w-5" />
                {link.count > 0 && (
                  <span
                    className={`
                    absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold
                    ${
                      isActive
                        ? "bg-blue-500 text-white"
                        : "bg-red-500 text-white"
                    }
                  `}
                  >
                    {link.count > 9 ? "9+" : link.count}
                  </span>
                )}
              </div>
              <span className="truncate max-w-full">{link.shortName}</span>
            </Link>
          );
        })}

        {moreTabs.length > 0 && (
          <Sheet open={isMoreMenuOpen} onOpenChange={setIsMoreMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                className="flex flex-1 flex-col items-center justify-center gap-1 rounded-xl mx-1 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/60 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800/30 h-auto"
              >
                <MoreHorizontal className="h-5 w-5" />
                <span>More</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="bottom"
              className="h-[80vh] bg-white/95 backdrop-blur-sm dark:bg-slate-950/95 border-t border-slate-200/60 dark:border-slate-800/60 rounded-t-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-6 border-b border-slate-200/60 dark:border-slate-700/60">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  More Options
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMoreMenuOpen(false)}
                  className="h-8 w-8 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <ScrollArea className="h-[calc(100%-5rem)] mt-6">
                <nav className="space-y-2">
                  {/* More Navigation Links */}
                  {moreTabs.map((link) => {
                    const isActive = selectedCategory === link.category;
                    return (
                      <Link
                        key={link.name}
                        href={link.href}
                        className={`
                          flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200
                          ${
                            isActive
                              ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-sm dark:from-blue-950/50 dark:to-indigo-950/50 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/50"
                              : "text-slate-700 hover:bg-slate-100/80 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/50 dark:hover:text-slate-100"
                          }
                        `}
                        onClick={() =>
                          handleSelectCategoryAndClose(link.category)
                        }
                        prefetch={false}
                      >
                        <link.icon
                          className={`h-5 w-5 ${
                            isActive
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-slate-500 dark:text-slate-400"
                          }`}
                        />
                        <span className="flex-1">{link.name}</span>
                        {link.count !== 0 && (
                          <span
                            className={`
                            flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium
                            ${
                              isActive
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
                                : "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                            }
                          `}
                          >
                            {link.count > 99 ? "99+" : link.count}
                          </span>
                        )}
                      </Link>
                    );
                  })}

                  {/* Folders Section */}
                  {folders.length > 0 && (
                    <>
                      <Separator className="my-6 bg-slate-200/60 dark:bg-slate-700/60" />
                      <div className="px-4 pb-3">
                        <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Folders
                        </div>
                      </div>
                      {folders.map((folder) => {
                        const isActive = selectedCategory === folder.category;
                        return (
                          <Link
                            key={folder.name}
                            href={folder.href}
                            className={`
                              flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200
                              ${
                                isActive
                                  ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-sm dark:from-blue-950/50 dark:to-indigo-950/50 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/50"
                                  : "text-slate-700 hover:bg-slate-100/80 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/50 dark:hover:text-slate-100"
                              }
                            `}
                            onClick={() =>
                              handleSelectCategoryAndClose(folder.category)
                            }
                            prefetch={false}
                          >
                            <div
                              className={`h-3 w-3 rounded-full ${
                                isActive ? "bg-blue-500" : "bg-slate-400"
                              }`}
                            />
                            <span className="flex-1">{folder.name}</span>
                          </Link>
                        );
                      })}
                    </>
                  )}
                </nav>
              </ScrollArea>
            </SheetContent>
          </Sheet>
        )}
      </nav>
    </div>
  );
}
