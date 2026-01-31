"use client"

import { Menu, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Sidebar } from "./Sidebar"
import { useState } from "react"

interface MobileNavProps {
  selectedCategory: string | null
  onSelectCategory: (category: string | null) => void
}

export function MobileNav({ selectedCategory, onSelectCategory }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleSelectCategoryAndClose = (category: string | null) => {
    onSelectCategory(category)
    setIsOpen(false) // Close the sheet after selecting a category
  }

  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-background shadow-sm md:hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="text-gray-700">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64 bg-background">
          <Sidebar selectedCategory={selectedCategory} onSelectCategory={handleSelectCategoryAndClose} />
        </SheetContent>
      </Sheet>
      <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
        <Mail className="h-6 w-6 text-calmBlue-600" />
        <span>Mailbox</span>
      </div>
    </div>
  )
}
