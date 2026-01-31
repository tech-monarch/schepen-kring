import Link from "next/link"
import { Bell, User, Search, ChevronDown, LayoutDashboard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { navLinks } from "@/lib/data"

export function Header() {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-blue-600 px-4 text-white md:px-6">
      <div className="flex items-center gap-4">
        <Link href="#" className="flex items-center gap-2 font-semibold text-white" prefetch={false}>
          <LayoutDashboard className="h-6 w-6" />
          <span className="sr-only">Dashboard</span>
        </Link>
        <nav className="hidden md:flex items-center gap-4 text-sm lg:gap-6">
          {navLinks.map((link) => (
            <DropdownMenu key={link.name}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-white hover:bg-blue-700 hover:text-white">
                  {link.name}
                  <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="bg-white text-gray-900">
                {link.dropdown.map((item) => (
                  <DropdownMenuItem key={item.name}>
                    <Link href={item.href} className="block w-full" prefetch={false}>
                      {item.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-full rounded-lg bg-blue-700 pl-8 text-white placeholder:text-gray-300 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <Button variant="ghost" size="icon" className="text-white hover:bg-blue-700 hover:text-white">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notifications</span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full text-white hover:bg-blue-700 hover:text-white">
              <User className="h-5 w-5" />
              <span className="sr-only">User menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white text-gray-900">
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
