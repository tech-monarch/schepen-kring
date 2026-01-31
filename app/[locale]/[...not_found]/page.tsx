import {notFound} from "next/navigation"

export async function generateStaticParams() {
  return [
    { locale: 'en', not_found: ['404'] },
    { locale: 'nl', not_found: ['404'] },
  ];
}

export default function NotFoundCatchAll() {
  notFound()
}