import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Copy, Check, ExternalLink } from 'lucide-react';

export default function PartnerFleetLinkPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Assuming you have a /api/user endpoint that returns the authenticated user
        const { data } = await api.get('/user');
        
        // Only partners can access this page
        if (data.role !== 'Partner') {
          router.push('/dashboard');
          return;
        }

        setUser(data);
        setToken(data.partner_token);
      } catch (error) {
        console.error('Failed to fetch user', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [router]);

  const fullUrl = token ? `${window.location.origin}/nl/${token}` : '';

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#003566]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-6 bg-white">
      <h1 className="text-3xl font-serif text-[#003566] mb-4">Your Shareable Fleet Link</h1>
      <p className="text-slate-600 mb-8">
        Share this unique URL with your customers to showcase all your published yachts.
      </p>

      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="flex-1 bg-slate-50 px-4 py-3 rounded-lg font-mono text-sm break-all">
            {fullUrl || 'No token generated yet.'}
          </div>
          <div className="flex gap-2">
            <button
              onClick={copyToClipboard}
              disabled={!token}
              className="px-5 py-3 bg-[#003566] text-white text-sm font-bold uppercase tracking-wider rounded-lg hover:bg-blue-800 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
            {token && (
              <a
                href={fullUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 bg-slate-100 text-[#003566] text-sm font-bold uppercase tracking-wider rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-2"
              >
                <ExternalLink size={18} />
                Visit
              </a>
            )}
          </div>
        </div>

        {!token && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-amber-800 text-sm">
              Your partner token is being generated. Please refresh the page in a few seconds.
            </p>
          </div>
        )}
      </div>

      <div className="mt-8 p-6 bg-blue-50 border border-blue-100 rounded-lg">
        <h2 className="text-lg font-bold text-[#003566] mb-2">How it works</h2>
        <ul className="list-disc list-inside text-slate-700 space-y-1 text-sm">
          <li>This link gives public access to all your <strong>published</strong> yachts (status ≠ Draft).</li>
          <li>Any vessel marked as Draft will be hidden automatically.</li>
          <li>The link never expires, but you can request a new token if needed (contact admin).</li>
        </ul>
      </div>
    </div>
  );
}