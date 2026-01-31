import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

interface WebshopCardProps {
  webshop: {
    id: string
    name: string
    logo: string
    cashback: string
    description: string
  }
}

export default function WebshopCard({ webshop }: WebshopCardProps) {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
        <Image
          src={webshop.logo || "/placeholder.svg"}
          width={60}
          height={60}
          alt={`${webshop.name} logo`}
          className="rounded-full object-cover"
        />
        <div>
          <CardTitle className="text-lg">{webshop.name}</CardTitle>
          <CardDescription className="text-sm text-primary font-semibold">
            {webshop.cashback}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex-1 text-sm text-muted-foreground">
        <p>{webshop.description}</p>
      </CardContent>
      <CardFooter>
        <Link href={`/webshops/${webshop.id}`} className="w-full">
          <Button variant="outline" className="w-full">
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
