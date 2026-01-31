import InvoiceCard from "@/components/Invoice/InvoiceCard";
import React from "react";

export async function generateStaticParams() {
  return [
    { locale: 'en', transactionId: 'txn-1' },
    { locale: 'en', transactionId: 'txn-2' },
    { locale: 'en', transactionId: 'txn-3' },
    { locale: 'en', transactionId: 'txn-4' },
    { locale: 'en', transactionId: 'txn-5' },
    { locale: 'nl', transactionId: 'txn-1' },
    { locale: 'nl', transactionId: 'txn-2' },
    { locale: 'nl', transactionId: 'txn-3' },
    { locale: 'nl', transactionId: 'txn-4' },
    { locale: 'nl', transactionId: 'txn-5' },
  ];
}

const Page = async (props: any) => {
  const params = await props.params;

  return <InvoiceCard transactionId={params.transactionId} />;
};

export default Page;
