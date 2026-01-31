import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { ClientHomepageData } from "@/types/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export async function generateStaticParams() {
  return [
    { locale: 'en', slug: 'client1' },
    { locale: 'en', slug: 'client2' },
    { locale: 'en', slug: 'client3' },
    { locale: 'en', slug: 'client4' },
    { locale: 'en', slug: 'client5' },
    { locale: 'nl', slug: 'client1' },
    { locale: 'nl', slug: 'client2' },
    { locale: 'nl', slug: 'client3' },
    { locale: 'nl', slug: 'client4' },
    { locale: 'nl', slug: 'client5' },
  ];
}

interface ClientHomepageProps {
  params: Promise<{ slug: string; locale: string }>;
}

async function getClientData(slug: string): Promise<ClientHomepageData | null> {
  // For static export, we'll return mock data instead of fetching
  // In a real application, you would fetch from your actual backend API
  const mockData: ClientHomepageData = {
    id: slug,
    name: `Client ${slug}`,
    logoUrl: "/placeholder.svg",
    introText: `Welcome to ${slug} - your trusted partner`,
    whatsappLink: `https://wa.me/1234567890`,
    seoTitle: `${slug} - Professional Services`,
    seoDescription: `Professional services by ${slug}`,
    aiGeneratedContent: {
      title: "About Our Services",
      paragraphs: [
        "We provide excellent services to our clients.",
        "Our team is dedicated to delivering quality results.",
        "Contact us today to learn more about our offerings."
      ]
    },
    pages: [
      {
        slug: "services",
        title: "Our Services",
        aiText: "Learn about our comprehensive service offerings."
      },
      {
        slug: "about",
        title: "About Us",
        aiText: "Discover more about our company and mission."
      }
    ],
    contactInfo: {
      email: `contact@${slug}.com`,
      phone: "+31 123 456 789",
      address: "Amsterdam, Netherlands"
    }
  };

  return mockData;
}

export async function generateMetadata({
  params,
}: ClientHomepageProps): Promise<Metadata> {
  const { slug } = await params;
  const clientData = await getClientData(slug);

  if (!clientData) {
    return {
      title: "Page Not Found",
      description: "The requested client page could not be found.",
    };
  }

  return {
    title: clientData.seoTitle,
    description: clientData.seoDescription,
  };
}

export default async function ClientHomepage({ params }: ClientHomepageProps) {
  const { slug } = await params;
  const clientData = await getClientData(slug);

  if (!clientData) {
    notFound();
  }

  return (
    <div className="min-h-screen -mt-20 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-50">
      {/* Header Section */}
      <header className="bg-white dark:bg-gray-800 shadow-sm py-4">
        <div className="container mx-auto flex justify-between items-center px-4">
          <img
            src={clientData.logoUrl || "/placeholder.svg"}
            alt={`${clientData.name} Logo`}
            width={50}
            height={60}
            className="object-contain"
          />
          <nav>
            <ul className="flex space-x-4">
              <li>
                <a
                  href={`/client-homepage/${clientData.id}`}
                  className="hover:text-blue-600 dark:hover:text-blue-400"
                >
                  Home
                </a>
              </li>
              {clientData.pages.map((page) => (
                <li key={page.slug}>
                  <a
                    href={`/client/${clientData.id}?page=${page.slug}`}
                    className="hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    {page.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-5xl font-extrabold mb-4 text-blue-700 dark:text-blue-400">
          {clientData.name}
        </h1>
        <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto mb-8">
          {clientData.introText}
        </p>
        <Button
          asChild
          size="lg"
          className="bg-green-500 hover:bg-green-600 text-white"
        >
          <a
            href={clientData.whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2 h-5 w-5"
            >
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z" />
            </svg>
            Contact via WhatsApp
          </a>
        </Button>
      </main>

      {/* AI-Generated Content Section */}
      <section className="bg-white dark:bg-gray-800 py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-8 text-blue-700 dark:text-blue-400">
            {clientData.aiGeneratedContent.title}
          </h2>
          <div className="max-w-4xl mx-auto space-y-6 text-lg text-gray-700 dark:text-gray-300">
            {clientData.aiGeneratedContent.paragraphs.map(
              (paragraph, index) => (
                <p key={index}>{paragraph}</p>
              )
            )}
          </div>
        </div>
      </section>

      {/* Other Pages Section (Simulating dynamic sub-pages for SEO) */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">
            Meer over {clientData.name}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {clientData.pages.map((page) => (
              <Card key={page.slug}>
                <CardHeader>
                  <CardTitle>{page.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    {page.aiText}
                  </p>
                  <Button asChild variant="outline">
                    <a
                      href={`/client-homepage/${clientData.id}?page=${page.slug}`}
                    >
                      Lees meer
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Info Section */}
      <section className="bg-white dark:bg-gray-800 py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6 text-blue-700 dark:text-blue-400">
            Contact {clientData.name}
          </h2>
          <div className="text-lg text-gray-700 dark:text-gray-300 space-y-2">
            <p>
              Email:{" "}
              <a
                href={`mailto:${clientData.contactInfo.email}`}
                className="text-blue-600 hover:underline"
              >
                {clientData.contactInfo.email}
              </a>
            </p>
            <p>
              Telefoon:{" "}
              <a
                href={`tel:${clientData.contactInfo.phone}`}
                className="text-blue-600 hover:underline"
              >
                {clientData.contactInfo.phone}
              </a>
            </p>
            <p>Adres: {clientData.contactInfo.address}</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 dark:bg-gray-950 text-white py-6 text-center">
        <div className="container mx-auto px-4">
          <p>
            &copy; {new Date().getFullYear()} {clientData.name}. Alle rechten
            voorbehouden.
          </p>
          <p className="text-sm mt-2">Powered by Answer24</p>
        </div>
      </footer>
    </div>
  );
}
