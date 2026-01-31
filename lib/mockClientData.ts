import type { ClientHomepageData, DomainStatus } from "@/types/client"

export const mockClientData: Record<string, ClientHomepageData> = {
  autoservicejanssen: {
    id: "autoservicejanssen",
    name: "Autoservice Janssen",
    logoUrl: "https://avatar.iran.liara.run/public/45",
    seoTitle: "Autoservice Janssen - Uw Specialist voor Auto Onderhoud",
    seoDescription: "Professioneel auto onderhoud, reparatie en APK in uw regio. Betrouwbaar en betaalbaar.",
    introText:
      "Welkom bij Autoservice Janssen, uw vertrouwde partner voor al uw auto onderhoud en reparaties. Wij zorgen ervoor dat uw voertuig altijd in topconditie is.",
    aiGeneratedContent: {
      title: "Optimaliseer Uw Auto Prestaties met Onze Expertise",
      paragraphs: [
        "Ontdek hoe regelmatig onderhoud de levensduur van uw auto verlengt en onverwachte kosten voorkomt. Onze experts gebruiken de nieuwste diagnostische tools om elk probleem snel en efficiënt op te sporen.",
        "Van motorrevisies tot remcontroles en bandenwissels, wij bieden een compleet pakket aan diensten. Vertrouw op Autoservice Janssen voor een veilige en comfortabele rijervaring.",
      ],
    },
    whatsappLink: "https://wa.me/31612345678",
    contactInfo: {
      email: "info@autoservicejanssen.nl",
      phone: "+31 6 12345678",
      address: "Hoofdstraat 10, 1234 AB Amsterdam",
    },
    pages: [
      {
        slug: "onderhoud",
        title: "Auto Onderhoud",
        aiText:
          "Diepgaande informatie over onze onderhoudsdiensten, inclusief kleine en grote beurten, olieverversingen en vloeistofcontroles. Zorg voor de lange termijn gezondheid van uw voertuig.",
      },
      {
        slug: "apk",
        title: "APK Keuring",
        aiText:
          "Alles wat u moet weten over de jaarlijkse APK keuring. Wij zorgen voor een grondige inspectie en eventuele reparaties om uw auto veilig en legaal op de weg te houden.",
      },
    ],
  },
  fietsenmakerdevries: {
    id: "fietsenmakerdevries",
    name: "Fietsenmaker De Vries",
    logoUrl: "/placeholder.svg?height=80&width=200",
    seoTitle: "Fietsenmaker De Vries - Uw Specialist in Fietsreparatie",
    seoDescription:
      "Snelle en vakkundige fietsreparaties, onderhoud en verkoop van nieuwe en tweedehands fietsen in Utrecht.",
    introText:
      "Bij Fietsenmaker De Vries bent u aan het juiste adres voor alle fietsreparaties en onderhoud. Wij zorgen ervoor dat u snel weer veilig op weg kunt!",
    aiGeneratedContent: {
      title: "Houd Uw Fiets in Topconditie met Onze Service",
      paragraphs: [
        "Regelmatig onderhoud is cruciaal voor de levensduur van uw fiets. Onze ervaren monteurs staan klaar voor bandenplakken, remafstellingen, versnellingsproblemen en meer.",
        "Of u nu een stadsfiets, e-bike of racefiets heeft, wij bieden gespecialiseerde service. Kom langs voor een gratis inspectie en advies op maat.",
      ],
    },
    whatsappLink: "https://wa.me/31698765432",
    contactInfo: {
      email: "info@fietsenmakerdevries.nl",
      phone: "+31 6 98765432",
      address: "Fietsstraat 5, 3511 AA Utrecht",
    },
    pages: [
      {
        slug: "reparatie",
        title: "Fietsreparatie",
        aiText:
          "Gedetailleerde informatie over onze reparatiediensten, van lekke banden tot complexe versnellingsproblemen. Wij gebruiken alleen kwaliteitsonderdelen.",
      },
      {
        slug: "verkoop",
        title: "Fietsverkoop",
        aiText:
          "Ontdek ons assortiment nieuwe en tweedehands fietsen. Van stadsfietsen tot e-bikes, wij helpen u de perfecte fiets te vinden die bij uw behoeften past.",
      },
    ],
  },
}

export const mockDomainStatuses: DomainStatus[] = [
  { clientName: "Autoservice Janssen", domain: "autoservicejanssen.nl", status: "Active", lastUpdated: "2024-07-28" },
  {
    clientName: "Fietsenmaker De Vries",
    domain: "fietsenmakerdevries.nl",
    status: "Active",
    lastUpdated: "2024-07-27",
  },
  { clientName: "Bakkerij Pieters", domain: "bakkerijpieters.nl", status: "Pending DNS", lastUpdated: "2024-07-29" },
  { clientName: "Kapsalon Linda", domain: "kapsalonlinda.nl", status: "Registered", lastUpdated: "2024-07-29" },
  {
    clientName: "Schildersbedrijf Jansen",
    domain: "schildersbedrijfjansen.nl",
    status: "Error",
    lastUpdated: "2024-07-26",
  },
]
