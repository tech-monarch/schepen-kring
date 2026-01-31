import FaqAdmin from "@/components/faq/FaqAdmin";

export async function generateStaticParams() {
  return [
    { locale: 'en' },
    { locale: 'nl' },
  ];
}
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "FAQ Management | Admin Dashboard",
  description: "Manage frequently asked questions",
};

export default async function FaqAdminPage() {
  return (
    <div className="flex flex-col h-full py-20 px-10">
      <FaqAdmin />
    </div>
  );
}
