import { Button } from "@/components/ui/button";
import Image from "next/image";
import HomePage from "@/components/homepage";

export async function generateStaticParams() {
  return [
    { locale: 'en' },
    { locale: 'nl' },
  ];
}

export default function Home() {
  return (
    <div>
     <HomePage/>
     
    </div>
  );
}
