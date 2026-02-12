"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import PublicFleetGallery from "@/components/PublicFleetGallery"; // reuse your existing component

export default function PartnerFleetPage() {
  const { token } = useParams();
  const [partner, setPartner] = useState<any>(null);
  const [yachts, setYachts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!token) return;

    api.get(`/partner-fleet/${token}`)
      .then(({ data }) => {
        setPartner(data.partner);
        setYachts(data.yachts);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div>Loading fleet...</div>;
  if (error) return <div>Invalid or expired link.</div>;

  // Reuse your existing PublicFleetGallery, but inject the yachts data
  return (
    <div>
      <div className="bg-blue-50 p-4 text-center">
        <h1 className="text-xl font-bold">{partner.name}'s Fleet</h1>
        <p className="text-sm">Exclusive preview of vessels from {partner.name}</p>
      </div>
      <PublicFleetGallery initialYachts={yachts} hideDrafts />
    </div>
  );
}