'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Copy, Check, ExternalLink, Share2 } from 'lucide-react';
import { Sidebar } from '@/components/dashboard/Sidebar';

export default function PartnerFleetLinkPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || 'nl';

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await api.get('/user');

        // Only partners can access this page
        if (data.role !== 'Partner') {
          router.push(`/${locale}/dashboard`);
          return;
        }

        setUser(data);
        setToken(data.partner_token);
      } catch (error) {
        console.error('Failed to fetch user', error);
        router.push(`/${locale}/login`);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [locale, router]);

  // ✅ Correct URL: /nl/partner-fleet/{token}
  const fullUrl = token
    ? `${window.location.origin}/${locale}/${token}`
    : '';

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  // Loading state – centered in the main content area
  if (loading) {
    return (
      <div className="flex min-h-screen bg-white">
        <Sidebar onCollapse={setIsSidebarCollapsed} />
        <div
          className="flex-1 flex items-center justify-center transition-all duration-300"
          style={{ marginLeft: isSidebarCollapsed ? '80px' : '280px' }}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#003566] border-t-transparent" />
            <p className="text-sm font-medium text-slate-500">Loading your fleet link...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <Sidebar onCollapse={setIsSidebarCollapsed} />

      {/* Main content – adjusts margin based on sidebar state */}
      <main
        className="flex-1 transition-all duration-300 bg-white"
        style={{ marginLeft: isSidebarCollapsed ? '80px' : '280px' }}
      >
        <div className="max-w-5xl mx-auto py-12 px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-[2px] bg-blue-600" />
              <span className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
                Partner Tools
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-serif text-[#003566] mb-3">
              Your Shareable Fleet Link
            </h1>
            <p className="text-slate-600 text-base max-w-2xl">
              Share this unique URL with your customers to showcase all your published yachts.
              Anyone with this link can browse your fleet – no login required.
            </p>
          </div>

          {/* Main card */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-[#003566] to-[#035c8f] px-6 py-4">
              <div className="flex items-center gap-3">
                <Share2 className="text-white/80" size={20} />
                <h2 className="text-white font-bold text-lg">Your unique fleet URL</h2>
              </div>
            </div>

            <div className="p-6 md:p-8">
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
                {/* URL display */}
                <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 font-mono text-sm text-slate-700 break-all">
                  {fullUrl || (
                    <span className="text-slate-400 italic">No token generated yet.</span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={copyToClipboard}
                    disabled={!token}
                    className="px-6 py-4 bg-[#003566] text-white text-sm font-bold uppercase tracking-wider rounded-xl hover:bg-blue-800 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    {copied ? <Check size={18} /> : <Copy size={18} />}
                    {copied ? 'Copied!' : 'Copy Link'}
                  </button>
                  {token && (
                    <a
                      href={fullUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-4 bg-white border-2 border-slate-200 text-[#003566] text-sm font-bold uppercase tracking-wider rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <ExternalLink size={18} />
                      Preview
                    </a>
                  )}
                </div>
              </div>

              {!token && (
                <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-amber-800 text-sm flex items-center gap-2">
                    <span className="inline-block w-1.5 h-1.5 bg-amber-500 rounded-full" />
                    Your partner token is being generated. Please refresh the page in a few seconds.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* How it works – refined */}
          <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6 md:p-8">
            <h2 className="text-lg font-bold text-[#003566] mb-4 flex items-center gap-2">
              <span className="inline-block w-1.5 h-5 bg-blue-600 rounded-full" />
              How the fleet link works
            </h2>
            <ul className="grid md:grid-cols-2 gap-4 text-slate-700">
              <li className="flex items-start gap-3">
                <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-100 text-blue-800 rounded-full text-xs font-bold mt-0.5">1</span>
                <span className="text-sm">Shows <strong>only published yachts</strong> (status ≠ Draft). Drafts remain hidden.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-100 text-blue-800 rounded-full text-xs font-bold mt-0.5">2</span>
                <span className="text-sm">The link <strong>never expires</strong> – you can use it indefinitely.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-100 text-blue-800 rounded-full text-xs font-bold mt-0.5">3</span>
                <span className="text-sm">No login required – customers can browse immediately.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-100 text-blue-800 rounded-full text-xs font-bold mt-0.5">4</span>
                <span className="text-sm">Need a new token? Contact an administrator.</span>
              </li>
            </ul>
          </div>

          {/* Optional: additional partner info */}
          {user && (
            <div className="mt-8 text-xs text-slate-400 border-t border-slate-100 pt-6">
              <p>Logged in as: {user.name} · {user.email}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}