"use client";
import { useState } from 'react';
import Image from 'next/image';

interface Boat {
  id: string;
  score?: number;
  metadata: {
    url: string;
    filename: string;
  };
}

export default function BoatDashboard() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Boat[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // 1. Search Function (Text or Image results)
  const handleSearch = async () => {
    setLoading(true);
    try {
      const res = await fetch(`https://schepen-kring.nl/api/search-boats?query=${query}`);
      const data = await res.json();
      setResults(data.results.matches || []);
    } catch (e) {
      alert("Search failed");
    } finally {
      setLoading(false);
    }
  };

  // 2. Trigger Method B Sync (The Janitor)
  const runJanitorSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch('https://schepen-kring.nl/api/sync-remaining', { method: 'POST' });
      const data = await res.json();
      alert(data.message);
    } catch (e) {
      alert("Sync failed to start");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-blue-900">Schepen Kring Library</h1>
          <button 
            onClick={runJanitorSync}
            disabled={syncing}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition disabled:opacity-50"
          >
            {syncing ? "Syncing..." : "Repair/Sync Library"}
          </button>
        </header>

        {/* Search Bar */}
        <div className="flex gap-2 mb-12">
          <input 
            type="text" 
            placeholder="Search by description (e.g. 'Blue sailboat with 2 masts')"
            className="flex-1 p-3 rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button 
            onClick={handleSearch}
            className="bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 transition"
          >
            Search
          </button>
        </div>

        {/* Results Grid */}
        {loading ? (
          <div className="text-center py-20 text-gray-500 text-xl">Asking the AI...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {results.map((boat) => (
              <div key={boat.id} className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition group">
                <div className="relative h-48 w-full bg-gray-200">
                  <img 
                    src={boat.metadata.url} 
                    alt={boat.id}
                    className="object-cover w-full h-full group-hover:scale-105 transition duration-500"
                  />
                  {boat.score && (
                    <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm">
                      Match: {(boat.score * 100).toFixed(1)}%
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-sm font-medium text-gray-700 truncate">{boat.id}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && results.length === 0 && (
          <div className="text-center py-20 border-2 border-dashed border-gray-300 rounded-3xl">
            <p className="text-gray-400">Search for a boat to see the AI in action</p>
          </div>
        )}
      </div>
    </div>
  );
}