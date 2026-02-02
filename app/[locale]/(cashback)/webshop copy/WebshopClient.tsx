"use client";
import React, { useEffect, useState, useMemo } from "react";
import {
  Search,
  Tag,
  ShoppingBag,
  X,
  Check,
  Loader2,
  Mail,
  ArrowRight,
  Users,
  Sparkles,
  Calendar,
  Globe,
  Bell,
  Download,
  Ticket,
  ChevronLeft,
  ChevronRight,
  Clock,
} from "lucide-react";
import Footer from "@/components/(webshop)/Footer";
import { toast } from "react-toastify";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import ChatWidget from "@/components/common/ChatWidget";
import { motion, AnimatePresence } from "framer-motion";
interface RequestedDeal {
  id: number | string;
  deal_name: string;
  deal_image: string | null;
  status: string;
  booking_date: string;
  customer_email: string;
  price?: string | number;
  deal_price?: string | number;
  people_count?: string | number;
}

const API_BASE = "https://kring.answer24.nl/api/v1";

const dummyDealsForWebshops = [
  {
    id: "w1",
    name: "Bol.com",
    logo: "https://images.unsplash.com/photo-1531297484001-80022131f5a1",
    cashback: "Tot 5%",
    category: "General",
    type: "webshop",
    description: "De winkel van ons allemaal met miljoenen artikelen.",
    long_description:
      "Bol.com is de grootste webwinkel van Nederland en België met een assortiment van boeken tot elektronica.",
    url: "https://www.bol.com",
    available_days: ["1", "2", "3", "4", "5", "6", "7"],
  },
  {
    id: "w2",
    name: "Coolblue",
    logo: "https://images.unsplash.com/photo-1498049794561-7780e7231661",
    cashback: "2.5% Reward",
    category: "Electronics",
    type: "webshop",
    description: "Alles voor een glimlach en specialist in elektronica.",
    long_description:
      "Coolblue staat bekend om de beste klantenservice en een groot aanbod aan consumentenelektronica.",
    url: "https://www.coolblue.nl",
    available_days: ["1", "2", "3", "4", "5", "6", "7"],
  },
  {
    id: "w3",
    name: "Albert Heijn",
    logo: "https://images.unsplash.com/photo-1542838132-92c53300491e",
    cashback: "€5.00 Korting",
    category: "Groceries",
    type: "webshop",
    description: "De grootste supermarkt van Nederland nu ook online.",
    long_description:
      "Bestel je dagelijkse boodschappen eenvoudig online bij Albert Heijn en laat ze thuisbezorgen.",
    url: "https://www.ah.nl",
    available_days: ["1", "2", "3", "4", "5", "6", "7"],
  },
  {
    id: "w4",
    name: "Zalando",
    logo: "https://images.unsplash.com/photo-1483985988355-763728e1935b",
    cashback: "4% Cashback",
    category: "Fashion",
    type: "webshop",
    description: "De nieuwste fashion en schoenen voor iedereen.",
    long_description:
      "Zalando biedt een enorme collectie kleding, schoenen en accessoires van topmerken.",
    url: "https://www.zalando.nl",
    available_days: ["1", "2", "3", "4", "5", "6", "7"],
  },
  {
    id: "w5",
    name: "MediaMarkt",
    logo: "https://images.unsplash.com/photo-1550009158-9ebf69173e03",
    cashback: "3% Reward",
    category: "Electronics",
    type: "webshop",
    description: "De grootste elektronicaketen met de scherpste deals.",
    long_description:
      "Bij MediaMarkt vind je alles op het gebied van multimedia, witgoed en gadgets.",
    url: "https://www.mediamarkt.nl",
    available_days: ["1", "2", "3", "4", "5", "6", "7"],
  },
  {
    id: "w6",
    name: "Wehkamp",
    logo: "https://images.unsplash.com/photo-1441986300917-64674bd600d8",
    cashback: "5% Cashback",
    category: "General",
    type: "webshop",
    description: "Hét online warenhuis voor mode, wonen en beauty.",
    long_description:
      "Wehkamp is een van de oudste en meest vertrouwde online warenhuizen in Nederland.",
    url: "https://www.wehkamp.nl",
    available_days: ["1", "2", "3", "4", "5", "6", "7"],
  },
  {
    id: "w7",
    name: "Booking.com",
    logo: "https://images.unsplash.com/photo-1436491865332-7a61a109c05d",
    cashback: "4% Reward",
    category: "Travel",
    type: "webshop",
    description: "Boek hotels, huizen en nog veel meer wereldwijd.",
    long_description:
      "Plan je volgende reis en verdien beloningen op elke overnachting via Booking.com.",
    url: "https://www.booking.com",
    available_days: ["1", "2", "3", "4", "5", "6", "7"],
  },
  {
    id: "w8",
    name: "Hema",
    logo: "https://images.unsplash.com/photo-1513506485906-8964e757d544",
    cashback: "3.5% Cashback",
    category: "General",
    type: "webshop",
    description: "Echt HEMA. Maakt het dagelijks leven leuker en makkelijker.",
    long_description:
      "Van rookworst tot handdoeken, bij HEMA vind je oer-Hollandse kwaliteit voor een goede prijs.",
    url: "https://www.hema.nl",
    available_days: ["1", "2", "3", "4", "5", "6", "7"],
  },
  {
    id: "w9",
    name: "H&M",
    logo: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5",
    cashback: "3% Reward",
    category: "Fashion",
    type: "webshop",
    description: "Mode en kwaliteit voor de beste prijs.",
    long_description:
      "Shop de nieuwste trends voor dames, heren en kinderen bij H&M Nederland.",
    url: "https://www.hm.com",
    available_days: ["1", "2", "3", "4", "5", "6", "7"],
  },
  {
    id: "w10",
    name: "Thuisbezorgd.nl",
    logo: "https://images.unsplash.com/photo-1526367790999-0150786486a9",
    cashback: "€1.50 per order",
    category: "Food",
    type: "webshop",
    description: "Eten bestellen bij duizenden restaurants in Nederland.",
    long_description:
      "Of je nu zin hebt in pizza, sushi of burgers, Thuisbezorgd brengt het bij je aan de deur.",
    url: "https://www.thuisbezorgd.nl",
    available_days: ["1", "2", "3", "4", "5", "6", "7"],
  },
  {
    id: "w11",
    name: "About You",
    logo: "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc",
    cashback: "6% Cashback",
    category: "Fashion",
    type: "webshop",
    description: "Jouw persoonlijke online modewinkel.",
    long_description:
      "Ontdek kleding die bij jouw stijl past met een unieke gepersonaliseerde shopervaring.",
    url: "https://www.aboutyou.nl",
    available_days: ["1", "2", "3", "4", "5", "6", "7"],
  },
  {
    id: "w12",
    name: "BCC",
    logo: "https://images.unsplash.com/photo-1550009158-9ebf69173e03",
    cashback: "2.5% Reward",
    category: "Electronics",
    type: "webshop",
    description: "BCC maakt het je makkelijk met elektronica.",
    long_description:
      "Hoogwaardige huishoudelijke apparatuur en multimedia tegen scherpe prijzen.",
    url: "https://www.bcc.nl",
    available_days: ["1", "2", "3", "4", "5", "6", "7"],
  },
  {
    id: "w13",
    name: "Jumbo",
    logo: "https://images.unsplash.com/photo-1506617564039-2f3b650ad701",
    cashback: "€4.00 Korting",
    category: "Groceries",
    type: "webshop",
    description: "Hallo Jumbo. Voor al je boodschappen tegen de laagste prijs.",
    long_description:
      "Bestel je Jumbo boodschappen online en haal ze op bij een Pick Up Point of laat ze thuisbezorgen.",
    url: "https://www.jumbo.com",
    available_days: ["1", "2", "3", "4", "5", "6", "7"],
  },
  {
    id: "w14",
    name: "Rituals",
    logo: "https://images.unsplash.com/photo-1590439471364-192aa70c0b53",
    cashback: "5% Cashback",
    category: "Wellness",
    type: "webshop",
    description: "Luxe cosmetica en geuren voor in huis.",
    long_description:
      "Transformeer je dagelijkse routines in betekenisvolle momenten met Rituals.",
    url: "https://www.rituals.com",
    available_days: ["1", "2", "3", "4", "5", "6", "7"],
  },
  {
    id: "w15",
    name: "Douglas",
    logo: "https://images.unsplash.com/photo-1596462502278-27bfad450216",
    cashback: "7% Reward",
    category: "Wellness",
    type: "webshop",
    description: "Jouw specialist in parfum, beauty en verzorging.",
    long_description:
      "Vind de beste merken parfum, make-up en huidverzorging bij Parfumerie Douglas.",
    url: "https://www.douglas.nl",
    available_days: ["1", "2", "3", "4", "5", "6", "7"],
  },
  {
    id: "w16",
    name: "Gamma",
    logo: "https://images.unsplash.com/photo-1581141849291-1110b9c16307",
    cashback: "3% Cashback",
    category: "General",
    type: "webshop",
    description: "De bouwmarkt die je helpt met elke klus.",
    long_description:
      "Alles voor bouwen, verbouwen en inrichten vind je online bij GAMMA.",
    url: "https://www.gamma.nl",
    available_days: ["1", "2", "3", "4", "5", "6", "7"],
  },
  {
    id: "w17",
    name: "Karwei",
    logo: "https://images.unsplash.com/photo-1581141849291-1110b9c16307",
    cashback: "3% Reward",
    category: "General",
    type: "webshop",
    description: "De decoratieve bouwmarkt voor een mooi huis.",
    long_description:
      "Combineer klussen met inrichten bij Karwei voor een stijlvol resultaat.",
    url: "https://www.karwei.nl",
    available_days: ["1", "2", "3", "4", "5", "6", "7"],
  },
  {
    id: "w18",
    name: "Praxis",
    logo: "https://images.unsplash.com/photo-1581141849291-1110b9c16307",
    cashback: "4% Cashback",
    category: "General",
    type: "webshop",
    description: "Voor de makers. Alles voor je huis en tuin.",
    long_description:
      "Bij Praxis vind je gereedschap, bouwmaterialen en inspiratie voor elke klus.",
    url: "https://www.praxis.nl",
    available_days: ["1", "2", "3", "4", "5", "6", "7"],
  },
  {
    id: "w19",
    name: "De Bijenkorf",
    logo: "https://images.unsplash.com/photo-1533929736458-ca588d08c8be",
    cashback: "3% Reward",
    category: "Fashion",
    type: "webshop",
    description: "Het meest inspirerende warenhuis van Nederland.",
    long_description:
      "Luxe merken, exclusieve mode en hoogwaardige woonaccessoires bij de Bijenkorf.",
    url: "https://www.debijenkorf.nl",
    available_days: ["1", "2", "3", "4", "5", "6", "7"],
  },
  {
    id: "w20",
    name: "Nike",
    logo: "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
    cashback: "5% Cashback",
    category: "Fashion",
    type: "webshop",
    description: "Just Do It. Innovatieve sportkleding en sneakers.",
    long_description:
      "Bestel direct bij Nike voor de nieuwste sneakers, hardloopkleding en sportgear.",
    url: "https://www.nike.com/nl",
    available_days: ["1", "2", "3", "4", "5", "6", "7"],
  },
  {
    id: "w21",
    name: "Adidas",
    logo: "https://images.unsplash.com/photo-1511556532299-8f662fc26c06",
    cashback: "6% Reward",
    category: "Fashion",
    type: "webshop",
    description: "De legendarische 3-Stripes sportmode.",
    long_description:
      "Ontdek de nieuwste collecties van Adidas Originals en performance sportkleding.",
    url: "https://www.adidas.nl",
    available_days: ["1", "2", "3", "4", "5", "6", "7"],
  },
  {
    id: "w22",
    name: "Decathlon",
    logo: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438",
    cashback: "3% Cashback",
    category: "Electronics",
    type: "webshop",
    description: "Sport voor iedereen. Alles voor 65+ sporten.",
    long_description:
      "Decathlon maakt sport toegankelijk met kwalitatieve en betaalbare sportuitrusting.",
    url: "https://www.decathlon.nl",
    available_days: ["1", "2", "3", "4", "5", "6", "7"],
  },
  {
    id: "w23",
    name: "AliExpress",
    logo: "https://images.unsplash.com/photo-1607083206869-4c7672e72a8a",
    cashback: "Tot 8% Reward",
    category: "General",
    type: "webshop",
    description: "Smarter Shopping, Better Living.",
    long_description:
      "Miljoenen producten tegen zeer lage prijzen direct uit China verzonden.",
    url: "https://www.aliexpress.com",
    available_days: ["1", "2", "3", "4", "5", "6", "7"],
  },
  {
    id: "w24",
    name: "Amazon.nl",
    logo: "https://images.unsplash.com/photo-1523240795612-9a054b0db644",
    cashback: "Tot 7% Cashback",
    category: "General",
    type: "webshop",
    description: "Lage prijzen, snelle bezorging en enorm assortiment.",
    long_description:
      "Amazon Nederland biedt alles van elektronica en boeken tot huishoudelijke artikelen.",
    url: "https://www.amazon.nl",
    available_days: ["1", "2", "3", "4", "5", "6", "7"],
  },
  {
    id: "w25",
    name: "Zalando Lounge",
    logo: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e12",
    cashback: "4% Reward",
    category: "Fashion",
    type: "webshop",
    description: "Exclusieve merken met kortingen tot 75%.",
    long_description:
      "Shop dagelijks nieuwe deals van topmerken in de exclusieve shopping club van Zalando.",
    url: "https://www.zalando-lounge.nl",
    available_days: ["1", "2", "3", "4", "5", "6", "7"],
  },
  {
    id: "w26",
    name: "Vattenfall",
    logo: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e",
    cashback: "€50 Cadeaubon",
    category: "General",
    type: "webshop",
    description: "Stap over op duurzame energie.",
    long_description:
      "Ontvang een exclusieve beloning bij het afsluiten van een nieuw energiecontract.",
    url: "https://www.vattenfall.nl",
    available_days: ["1", "2", "3", "4", "5", "6", "7"],
  },
  {
    id: "w27",
    name: "Transavia",
    logo: "https://images.unsplash.com/photo-1436491865332-7a61a109c05d",
    cashback: "€5 Reward",
    category: "Travel",
    type: "webshop",
    description: "Voordelig vliegen naar de mooiste bestemmingen.",
    long_description:
      "Boek je vlucht bij Transavia en geniet van een zorgeloze vakantie tegen een lage prijs.",
    url: "https://www.transavia.com",
    available_days: ["1", "2", "3", "4", "5", "6", "7"],
  },
  {
    id: "w28",
    name: "Kruidvat",
    logo: "https://images.unsplash.com/photo-1576091160550-2173dad99978",
    cashback: "3.5% Cashback",
    category: "Wellness",
    type: "webshop",
    description: "Steeds verrassend, altijd voordelig.",
    long_description:
      "De voordeligste drogisterij voor al je verzorging, babyartikelen en meer.",
    url: "https://www.kruidvat.nl",
    available_days: ["1", "2", "3", "4", "5", "6", "7"],
  },
  {
    id: "w29",
    name: "Etos",
    logo: "https://images.unsplash.com/photo-1512069772995-ec65ed45afd6",
    cashback: "3% Reward",
    category: "Wellness",
    type: "webshop",
    description: "Jouw welzijn, onze passie.",
    long_description:
      "Deskundig advies en een ruim assortiment aan beauty- en gezondheidsproducten.",
    url: "https://www.etos.nl",
    available_days: ["1", "2", "3", "4", "5", "6", "7"],
  },
  {
    id: "w30",
    name: "IKEA",
    logo: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc",
    cashback: "3% Cashback",
    category: "General",
    type: "webshop",
    description: "Betaalbaar design voor elk huis.",
    long_description:
      "Shop het volledige assortiment meubels en woonaccessoires van IKEA online.",
    url: "https://www.ikea.nl",
    available_days: ["1", "2", "3", "4", "5", "6", "7"],
  },
  {
    id: "w31",
    name: "Leen Bakker",
    logo: "https://images.unsplash.com/photo-1524758631624-e2822e304c36",
    cashback: "4% Reward",
    category: "General",
    type: "webshop",
    description: "Gezellig wonen voor iedereen.",
    long_description:
      "Vind alles voor je interieur, van banken tot gordijnen, bij Leen Bakker.",
    url: "https://www.leenbakker.nl",
    available_days: ["1", "2", "3", "4", "5", "6", "7"],
  },
  {
    id: "w32",
    name: "Kwantum",
    logo: "https://images.unsplash.com/photo-1524758631624-e2822e304c36",
    cashback: "4% Cashback",
    category: "General",
    type: "webshop",
    description: "Daar woon je beter van!",
    long_description:
      "De laagste prijs in vloeren, gordijnen en leuke woonaccessoires.",
    url: "https://www.kwantum.nl",
    available_days: ["1", "2", "3", "4", "5", "6", "7"],
  },
  {
    id: "w33",
    name: "ANWB",
    logo: "https://images.unsplash.com/photo-1502877338535-766e1452684a",
    cashback: "5% Reward",
    category: "General",
    type: "webshop",
    description: "Alles voor onbezorgd onderweg.",
    long_description:
      "Shop outdoor kleding, kampeerartikelen en reisaccessoires in de ANWB webwinkel.",
    url: "https://www.anwb.nl/webwinkel",
    available_days: ["1", "2", "3", "4", "5", "6", "7"],
  },
  {
    id: "w34",
    name: "Corendon",
    logo: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
    cashback: "€15 per boeking",
    category: "Travel",
    type: "webshop",
    description: "Altijd de beste vakantiedeals.",
    long_description:
      "Boek je zonvakantie naar Turkije, Griekenland of Curaçao voordelig bij Corendon.",
    url: "https://www.corendon.nl",
    available_days: ["1", "2", "3", "4", "5", "6", "7"],
  },
  {
    id: "w35",
    name: "TUI",
    logo: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
    cashback: "€20 per boeking",
    category: "Travel",
    type: "webshop",
    description: "Ontdek jouw ideale vakantie.",
    long_description:
      "Van all-inclusive resorts tot verre rondreizen, TUI heeft het allemaal.",
    url: "https://www.tui.nl",
    available_days: ["1", "2", "3", "4", "5", "6", "7"],
  },
  {
    id: "w36",
    name: "Omoda",
    logo: "https://images.unsplash.com/photo-1549298916-b41d501d3772",
    cashback: "5% Cashback",
    category: "Fashion",
    type: "webshop",
    description: "De beste selectie schoenen en mode.",
    long_description:
      "Vind de perfecte schoenen en kleding bij de grootste schoenenspecialist van Nederland.",
    url: "https://www.omoda.nl",
    available_days: ["1", "2", "3", "4", "5", "6", "7"],
  },
  {
    id: "w37",
    name: "VanHaren",
    logo: "https://images.unsplash.com/photo-1549298916-b41d501d3772",
    cashback: "4% Reward",
    category: "Fashion",
    type: "webshop",
    description: "Schoenen voor het hele gezin.",
    long_description:
      "Modieuze en betaalbare schoenen voor dames, heren en kinderen bij VanHaren.",
    url: "https://www.vanharen.nl",
    available_days: ["1", "2", "3", "4", "5", "6", "7"],
  },
  {
    id: "w38",
    name: "Bristol",
    logo: "https://images.unsplash.com/photo-1549298916-b41d501d3772",
    cashback: "5% Cashback",
    category: "Fashion",
    type: "webshop",
    description: "Budgetvriendelijke mode en sportartikelen.",
    long_description:
      "De leukste schoenen en kleding voor de laagste prijs vind je bij Bristol.",
    url: "https://www.bristol.nl",
    available_days: ["1", "2", "3", "4", "5", "6", "7"],
  },
  {
    id: "w39",
    name: "Intertoys",
    logo: "https://images.unsplash.com/photo-1532330393533-443990a51d10",
    cashback: "3% Reward",
    category: "General",
    type: "webshop",
    description: "Speelgoed voor alle leeftijden.",
    long_description:
      "De grootste speelgoedwinkel van Nederland met alle populaire merken zoals LEGO en Playmobil.",
    url: "https://www.intertoys.nl",
    available_days: ["1", "2", "3", "4", "5", "6", "7"],
  },
  {
    id: "w40",
    name: "Blokker",
    logo: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a",
    cashback: "4% Cashback",
    category: "General",
    type: "webshop",
    description: "Alles voor je huishouden.",
    long_description:
      "Van keukenapparatuur tot schoonmaakartikelen, Blokker heeft alles in huis.",
    url: "https://www.blokker.nl",
    available_days: ["1", "2", "3", "4", "5", "6", "7"],
  },
  {
    id: "w41",
    name: "Holland & Barrett",
    logo: "https://images.unsplash.com/photo-1547922657-b370d188be9b",
    cashback: "6% Reward",
    category: "Wellness",
    type: "webshop",
    description: "Natuurlijke gezondheid en verzorging.",
    long_description:
      "Specialist in vitaminen, supplementen en natuurlijke huidverzorging.",
    url: "https://www.hollandandbarrett.nl",
    available_days: ["1", "2", "3", "4", "5", "6", "7"],
  },
  {
    id: "w42",
    name: "C&A",
    logo: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5",
    cashback: "5% Cashback",
    category: "Fashion",
    type: "webshop",
    description: "Stijlvolle mode voor een eerlijke prijs.",
    long_description:
      "Shop duurzame en trendy collecties voor het hele gezin bij C&A.",
    url: "https://www.cea.nl",
    available_days: ["1", "2", "3", "4", "5", "6", "7"],
  },
  {
    id: "w43",
    name: "Bonprix",
    logo: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5",
    cashback: "4% Reward",
    category: "Fashion",
    type: "webshop",
    description: "Betaalbare mode en interieur.",
    long_description:
      "Bonprix maakt mode toegankelijk voor iedereen met een ruim aanbod in alle maten.",
    url: "https://www.bonprix.nl",
    available_days: ["1", "2", "3", "4", "5", "6", "7"],
  },
  {
    id: "w44",
    name: "HelloFresh",
    logo: "https://images.unsplash.com/photo-1547592166-23ac45744acd",
    cashback: "€10 Korting",
    category: "Groceries",
    type: "webshop",
    description: "Gezonde recepten en verse ingrediënten bij je thuis.",
    long_description:
      "Kook elke week iets nieuws en gezonds met de maaltijdboxen van HelloFresh.",
    url: "https://www.hellofresh.nl",
    available_days: ["1", "2", "3", "4", "5", "6", "7"],
  },
  {
    id: "w45",
    name: "FonQ",
    logo: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6",
    cashback: "3% Cashback",
    category: "General",
    type: "webshop",
    description: "Vind jouw mooie woonitems bij fonQ.",
    long_description:
      "Een webwarenhuis vol inspiratie en de mooiste merken op het gebied van wonen, koken en lifestyle.",
    url: "https://www.fonq.nl",
    available_days: ["1", "2", "3", "4", "5", "6", "7"],
  },
  {
    id: "w46",
    name: "Efteling",
    logo: "https://images.unsplash.com/photo-1502134249126-9f3755a50d78",
    cashback: "€2 Reward",
    category: "General",
    type: "webshop",
    description: "Een wereld vol wonderen.",
    long_description:
      "Koop je tickets voor de Efteling online en vermijd de wachtrij bij de kassa.",
    url: "https://www.efteling.com",
    available_days: ["1", "2", "3", "4", "5", "6", "7"],
  },
  {
    id: "w47",
    name: "Landal GreenParks",
    logo: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b",
    cashback: "€12.50 Cashback",
    category: "Travel",
    type: "webshop",
    description: "Ontspanning midden in de natuur.",
    long_description:
      "Boek een vakantiehuisje op een van de vele Landal parken in binnen- en buitenland.",
    url: "https://www.landal.nl",
    available_days: ["1", "2", "3", "4", "5", "6", "7"],
  },
  {
    id: "w48",
    name: "Vrijbuiter",
    logo: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4",
    cashback: "4% Reward",
    category: "General",
    type: "webshop",
    description: "Kamperen en outdoor specialist.",
    long_description:
      "Alles voor je kampeeravontuur, van tenten tot wandelschoenen, vind je bij Vrijbuiter.",
    url: "https://www.vrijbuiter.nl",
    available_days: ["1", "2", "3", "4", "5", "6", "7"],
  },
  {
    id: "w49",
    name: "Swiss Sense",
    logo: "https://images.unsplash.com/photo-1505691938895-1758d7eaa511",
    cashback: "3% Cashback",
    category: "General",
    type: "webshop",
    description: "Geniet van een heerlijke nachtrust.",
    long_description:
      "Specialist in boxsprings, matrassen en beddengoed van hoge kwaliteit.",
    url: "https://www.swisssense.nl",
    available_days: ["1", "2", "3", "4", "5", "6", "7"],
  },
  {
    id: "w50",
    name: "Body & Fit",
    logo: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438",
    cashback: "6% Reward",
    category: "Wellness",
    type: "webshop",
    description: "Alles voor je sportieve doelen.",
    long_description:
      "Marktleider in sportvoeding, supplementen en fitnessaccessoires.",
    url: "https://www.bodyandfit.com",
    available_days: ["1", "2", "3", "4", "5", "6", "7"],
  },
];

const categories = [
  { id: "all", name: "All", icon: ShoppingBag },
  { id: "General", name: "General", icon: ShoppingBag },
  { id: "Electronics", name: "Electronics", icon: Sparkles },
  { id: "Fashion", name: "Fashion", icon: Tag },
  { id: "Travel", name: "Travel", icon: Globe },
];

export default function WebshopPage() {
  const [activeMainTab, setActiveMainTab] = useState("webshops");
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // POPUP STATE
  const [paymentStep, setPaymentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [customerEmail, setCustomerEmail] = useState("");
  const [peopleCount, setPeopleCount] = useState(1);
  const [bookingDate, setBookingDate] = useState("");
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  // 1. Ensure state is initialized correctly
  const [requestedDeals, setRequestedDeals] = useState<RequestedDeal[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [pageKey, setPageKey] = useState(0);
  // 2. Ensure the fetch function updates that state

  // 1. Add this at the top of your WebshopPage component
  useEffect(() => {
    const handleUrlChange = () => {
      // When the URL changes, wait 3 seconds then reload the whole browser
      const timer = setTimeout(() => {
        window.location.reload();
      }, 3000);

      return () => clearTimeout(timer);
    };

    // Listen for when the user clicks a link that changes the #hash
    window.addEventListener("hashchange", handleUrlChange);

    // Also run the logic to set the correct tab on initial load
    const currentHash = window.location.hash;
    setActiveMainTab("webshops");

    return () => window.removeEventListener("hashchange", handleUrlChange);
  }, []);

  useEffect(() => {
    const fetchPersonalDeals = async () => {
      try {
        const token = localStorage.getItem("auth_token"); // Make sure this matches your localStorage key
        const res = await fetch(`${API_BASE}/requested-deals`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });
        const result = await res.json();

        if (result.success) {
          setRequestedDeals(result.data); // This fills the variable
          console.log("Deals loaded into state:", result.data);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    if (activeMainTab === "requested") {
      fetchPersonalDeals();
    }
  }, [activeMainTab]);

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;

      setActiveMainTab("webshops");

      // This triggers the "Full Page Refresh" effect
      setPageKey((prev) => prev + 1);
    };

    window.addEventListener("hashchange", handleHash);
    handleHash(); // Run on initial load

    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const response = await fetch(`${API_BASE}/merchant/deals`);
        const result = await response.json();
        if (result.success) setDeals(result.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDeals();
  }, []);

  const filteredItems = useMemo(() => {
    // If we are in "requested" mode, we still filter deals to avoid crash,
    // though they aren't displayed in the grid.
    const baseList =
      activeMainTab === "webshops" ? dummyDealsForWebshops : deals;
    return baseList.filter((item: any) => {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCategory =
        activeCategory === "all" || item.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [activeMainTab, deals, searchQuery, activeCategory]);

  return (
    <div
      key={typeof window !== "undefined" ? window.location.hash : "main"}
      className="min-h-screen bg-[#F8FAFC]"
    >
      <DashboardHeader />
      <ChatWidget />

      {/* --- PROFESSIONAL BLUE HEADER --- */}
      <div className="bg-blue-600 pt-20 pb-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl md:text-4xl font-black text-white mb-4">
              Bespaar bij je favoriete winkels
            </h1>

            <p className="text-blue-100 text-base mb-6 max-w-2xl mx-auto">
              Ontdek exclusieve aanbiedingen en verdien direct cashback bij
              honderden Nederlandse webshops.
            </p>

            {/* Search Bar */}
            <div className="max-w-lg mx-auto relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                placeholder="Zoek naar een winkel..."
                className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white shadow-xl focus:ring-2 focus:ring-blue-400 outline-none text-gray-800"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-10 relative z-20 pb-32">
        {/* CATEGORY NAVIGATION */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-12">
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-6 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest whitespace-nowrap transition-all border ${
                  activeCategory === cat.id
                    ? "bg-white text-blue-600 border-blue-600 shadow-md"
                    : "bg-white text-slate-400 border-slate-200 hover:border-slate-300"
                }`}
              >
                <cat.icon className="w-4 h-4" /> {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* --- MAIN CONTENT AREA (WEBSHOPS ONLY) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredItems.map((item) => (
            <motion.div
              key={item.id}
              layoutId={item.id}
              onClick={() => {
                setSelectedItem(item);
                setCurrentImageIndex(0);
              }}
              whileHover={{ y: -8 }}
              className="group bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.12)] transition-all cursor-pointer"
            >
              <div className="relative h-64 overflow-hidden">
                <img
                  src={item.image_url || item.logo}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-6 left-6">
                  <span className="px-4 py-2 bg-white/95 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-slate-900 shadow-sm">
                    {item.category}
                  </span>
                </div>
              </div>

              <div className="p-8">
                <h3 className="text-2xl font-black text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {item.name}
                </h3>
                <p className="text-slate-500 font-medium mb-6 line-clamp-2 text-sm">
                  {item.description}
                </p>

                <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">
                      Direct Cashback
                    </span>
                    <span className="text-2xl font-[1000] text-slate-900">
                      {item.cashback}
                    </span>
                  </div>
                  <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center group-hover:bg-blue-600 transition-all group-hover:rotate-12">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* --- WEBSHOP DETAIL POPUP --- */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            className="fixed inset-0 z-[100] bg-white overflow-y-auto"
          >
            <div className="min-h-screen flex flex-col relative">
              <div className="fixed top-6 right-6 z-[110]">
                <button
                  onClick={() => setSelectedItem(null)}
                  className="p-4 bg-gray-900/10 backdrop-blur-md rounded-full hover:bg-gray-900/20 transition-all"
                >
                  <X className="w-6 h-6 text-slate-900" />
                </button>
              </div>

              <div className="relative h-[55vh] bg-slate-100">
                <img
                  src={selectedItem.image_url || selectedItem.logo}
                  className="w-full h-full object-cover"
                  alt="Header"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-12 flex flex-col justify-end">
                  <div className="max-w-7xl mx-auto w-full">
                    <span className="px-4 py-2 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest mb-4 inline-block shadow-lg">
                      {selectedItem.category}
                    </span>
                    <h3 className="text-5xl md:text-7xl font-[1000] text-white tracking-tighter">
                      {selectedItem.name}
                    </h3>
                  </div>
                </div>
              </div>

              <div className="max-w-7xl mx-auto w-full p-6 md:p-12 grid grid-cols-1 lg:grid-cols-3 gap-16 pb-32">
                <div className="lg:col-span-2 space-y-12">
                  <section>
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                      <div className="w-6 h-6 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-bold text-[10px]">
                        01
                      </div>
                      Over {selectedItem.name}
                    </h4>
                    <div className="text-slate-600 leading-[1.8] text-xl font-medium whitespace-pre-line bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100">
                      {selectedItem.long_description ||
                        selectedItem.description}
                    </div>
                  </section>
                </div>

                {/* SIDEBAR - ACTION */}
                <div className="lg:sticky lg:top-10 h-fit">
                  <div className="bg-blue-600 rounded-[2rem] p-8 text-white shadow-2xl shadow-blue-200 space-y-6">
                    <div className="space-y-1">
                      <h3 className="text-3xl font-black">Shoppen</h3>
                      <p className="text-4xl font-[1000]">
                        {selectedItem.cashback}
                      </p>
                    </div>
                    <p className="text-blue-100 font-medium text-sm opacity-90 leading-relaxed">
                      Shop via de onderstaande knop om je cashback automatisch
                      te registreren.
                    </p>
                    <a
                      href={selectedItem.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-white text-blue-600 py-5 rounded-2xl font-black shadow-lg flex items-center justify-center gap-2 group transition-all active:scale-95"
                    >
                      Bezoek Website{" "}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
