import Link from "next/link"
import { Mountain, Search, User } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function Header() {
  return (
    <header className="flex h-16 -mt-14 items-center justify-between gap-4 border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-4">
        <Link href="#" className="flex items-center gap-2 font-semibold">
          <Mountain className="h-6 w-6" />
          <span className="sr-only">Answer24</span>
          <span className="hidden md:inline">Answer24</span>
        </Link>
      </div>
      <div className="relative flex-1 max-w-md hidden md:block">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search webshops..."
          className="w-full rounded-lg bg-background pl-8"
        />
      </div>
      <nav className="hidden md:flex items-center gap-4">
        <Link href="#" className="text-sm font-medium hover:underline underline-offset-4">
          How it works
        </Link>
        <Link href="#" className="text-sm font-medium hover:underline underline-offset-4">
          Offers
        </Link>
        <Link href="#" className="text-sm font-medium hover:underline underline-offset-4">
          Contact
        </Link>
        <Button variant="outline" size="sm" className="ml-4">
          <User className="h-4 w-4 mr-2" />
          Login / Register
        </Button>
      </nav>
      <Button variant="ghost" size="icon" className="md:hidden">
        <Search className="h-5 w-5" />
        <span className="sr-only">Search</span>
      </Button>
      <Button variant="ghost" size="icon" className="md:hidden">
        <User className="h-5 w-5" />
        <span className="sr-only">Login / Register</span>
      </Button>
    </header>
  )
}
    