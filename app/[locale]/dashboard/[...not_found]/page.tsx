import {notFound} from "next/navigation"

export async function generateStaticParams() {
  return [
    { locale: 'en', not_found: ['404'] },
    { locale: 'en', not_found: ['not-found'] },
    { locale: 'en', not_found: ['error'] },
    { locale: 'nl', not_found: ['404'] },
    { locale: 'nl', not_found: ['not-found'] },
    { locale: 'nl', not_found: ['error'] },
  ];
}

export default function NotFoundCatchAll() {
  notFound()
}