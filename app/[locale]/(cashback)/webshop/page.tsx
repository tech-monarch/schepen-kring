import React from "react";
import WebshopClient from "./WebshopClient";

export async function generateStaticParams() {
  return [
    { locale: 'en' },
    { locale: 'nl' },
  ];
}

const CashbackHomepage = () => {
  return <WebshopClient />;
};

export default CashbackHomepage;