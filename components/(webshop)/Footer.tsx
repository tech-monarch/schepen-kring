import Link from "next/link";
import { Mountain } from "lucide-react";

export default function Footer() {
  return (
    <footer className="flex flex-col gap-4 sm:flex-row py-8 w-full shrink-0 items-center px-4 md:px-6 border-t bg-muted text-muted-foreground">
      <div className="flex items-center gap-2">
        <Mountain className="h-6 w-6" />
        <span className="font-semibold">Answer24</span>
      </div>
      <p className="text-xs text-center sm:text-left">
        &copy; {new Date().getFullYear()} Answer24. All rights reserved.
      </p>
      <nav className="sm:ml-auto flex flex-wrap justify-center sm:justify-end gap-4 sm:gap-6">
        <Link href="#" className="text-xs hover:underline underline-offset-4">
          About Us
        </Link>
        <Link href="#" className="text-xs hover:underline underline-offset-4">
          Terms of Service
        </Link>
        <Link href="#" className="text-xs hover:underline underline-offset-4">
          Privacy Policy
        </Link>
        <Link href="#" className="text-xs hover:underline underline-offset-4">
          FAQ
        </Link>
      </nav>
    </footer>
  );
}
