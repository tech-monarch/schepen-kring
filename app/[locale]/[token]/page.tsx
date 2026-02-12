import { notFound } from 'next/navigation';
import { api } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';

type Props = {
  params: Promise<{ token: string }>;
};

// ─────────────────────────────────────────────────────────────
// 1. Fetch data on the server (SSR)
// ─────────────────────────────────────────────────────────────
async function getPartnerFleet(token: string) {
  try {
    const { data } = await api.get(`/partner-fleet/${token}`);
    return data;
  } catch (error: any) {
    if (error.response?.status === 404) return null;
    throw new Error('Failed to load fleet');
  }
}

// ─────────────────────────────────────────────────────────────
// 2. Generate metadata for the page
// ─────────────────────────────────────────────────────────────
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  const data = await getPartnerFleet(token);
  if (!data) {
    return {
      title: 'Fleet not found',
      description: 'This partner fleet link is invalid or expired.',
    };
  }
  return {
    title: `${data.partner.name}'s Fleet | Schepen Kring`,
    description: `Browse the exclusive fleet of ${data.partner.name}.`,
  };
}

// ─────────────────────────────────────────────────────────────
// 3. Page component (server component)
// ─────────────────────────────────────────────────────────────
export default async function PartnerFleetPage({ params }: Props) {
  const { token } = await params;
  const data = await getPartnerFleet(token);

  if (!data) {
    notFound();
  }

  const { partner, yachts } = data;
  const baseStorageUrl = process.env.NEXT_PUBLIC_STORAGE_URL || 'https://schepen-kring.nl/storage/';
  const placeholderImage = 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?auto=format&fit=crop&w=600&q=80';

  const formatCurrency = (amount: number | null | undefined) => {
    const num = Number(amount);
    return !isNaN(num) && num > 0
      ? new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(num)
      : '€ --';
  };

  const getImageUrl = (path: string | null) => {
    if (!path) return placeholderImage;
    if (path.startsWith('http')) return path;
    return `${baseStorageUrl}${path}`;
  };

  return (
    <main className="min-h-screen bg-white text-[#003566]">
      {/* Partner header */}
      <div className="bg-[#001D3D] text-white py-12 px-6 md:px-12">
        <div className="max-w-[1400px] mx-auto">
          <h1 className="text-3xl md:text-5xl font-serif italic mb-2">
            {partner.name}'s Fleet
          </h1>
          <p className="text-white/70 text-sm md:text-base">
            Exclusive preview of vessels offered by {partner.name}.
          </p>
        </div>
      </div>

      {/* Fleet grid */}
      <section className="max-w-[1400px] mx-auto px-6 md:px-12 py-16">
        {yachts.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">⛵</div>
            <h3 className="text-xl font-serif text-slate-400 mb-2">No vessels available</h3>
            <p className="text-slate-500">This partner currently has no published yachts.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
            {yachts.map((yacht: any) => {
              const detailUrl = `/nl/yachts/${yacht.id}/${generateSlug(yacht.boat_name || yacht.vessel_id || `yacht-${yacht.id}`)}`;
              return (
                <div key={yacht.id} className="group">
                  <Link href={detailUrl} className="block relative aspect-[4/5] overflow-hidden bg-slate-100">
                    <img
                      src={getImageUrl(yacht.main_image)}
                      alt={yacht.boat_name || 'Unnamed vessel'}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      onError={(e) => {
                        e.currentTarget.src = placeholderImage;
                        e.currentTarget.classList.add('opacity-50', 'grayscale');
                      }}
                    />
                    <div className="absolute top-6 left-6">
                      <span className="px-4 py-2 text-[9px] font-black uppercase tracking-widest bg-blue-600 text-white border border-blue-700">
                        {yacht.status === 'For Bid' ? 'Auction' : yacht.status === 'For Sale' ? 'For Sale' : yacht.status}
                      </span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-white text-xs font-black uppercase tracking-widest mb-1">
                            {yacht.builder || 'N/A'}
                          </p>
                          <p className="text-white text-lg font-serif italic">
                            {yacht.boat_name || 'Unnamed Vessel'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-white text-xs font-bold uppercase tracking-widest mb-1">
                            Valuation
                          </p>
                          <p className="text-white text-2xl font-bold">
                            {formatCurrency(yacht.price)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>

                  <div className="pt-6">
                    {/* specs */}
                    <div className="grid grid-cols-4 gap-2 mb-6">
                      <div className="text-center">
                        <p className="text-[8px] font-black uppercase text-slate-400 mb-1">LOA</p>
                        <p className="text-sm font-serif font-bold text-[#003566]">{yacht.loa || '--'}m</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[8px] font-black uppercase text-slate-400 mb-1">Year</p>
                        <p className="text-sm font-serif font-bold text-[#003566]">{yacht.year || '--'}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[8px] font-black uppercase text-slate-400 mb-1">Cabins</p>
                        <p className="text-sm font-serif font-bold text-[#003566]">{yacht.cabins || '0'}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[8px] font-black uppercase text-slate-400 mb-1">Beam</p>
                        <p className="text-sm font-serif font-bold text-[#003566]">{yacht.beam || '--'}m</p>
                      </div>
                    </div>

                    <Link
                      href={detailUrl}
                      className="block w-full bg-[#003566] text-white px-6 py-3 text-xs font-black uppercase tracking-widest hover:bg-blue-800 transition-all text-center"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

// Helper slug generator
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
}