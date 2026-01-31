import { Button } from "@/components/ui/button"
import Link from "next/link"
export default function CTASection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-primary text-primary-foreground">
      <div className="container px-4 md:px-6 text-center space-y-6">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
          Ready to Start Earning Cashback?
        </h2>
        <p className="mx-auto max-w-[700px] text-lg md:text-xl">
          Join thousands of smart shoppers who are already saving money on their online purchases.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="#" className="inline-flex h-12 items-center justify-center rounded-md bg-primary-foreground px-8 text-base font-medium text-primary shadow transition-colors hover:bg-primary-foreground/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
            Register Now
          </Link>
          <Link href="#" className="inline-flex h-12 items-center justify-center rounded-md border border-primary-foreground px-8 text-base font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary-foreground/20 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
            Login
          </Link>
        </div>
      </div>
    </section>
  )
}
