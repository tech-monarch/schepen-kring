"use client";
import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';

export default function BoatCenter() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const VPS_URL = "https://schepen-kring.nl"; // Change this to your VPS IP

  // 1. Load initial boats (just a blank search to fill the page)
  useEffect(() => { handleSearch(""); }, []);

  const handleSearch = async (text: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${VPS_URL}/api/search-boats?query=${text}`);
      const data = await res.json();
      setResults(data.results.matches || []);
    } catch (e) {
      console.error("Search failed");
    } finally {
      setLoading(false);
    }
  };

  // 2. Drag & Drop Upload Logic
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsUploading(true);
    const file = acceptedFiles[0];
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch(`${VPS_URL}/api/upload-boat`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      alert(data.status === 'success' ? "Boat synced successfully!" : data.message);
      handleSearch(""); // Refresh gallery
    } catch (error) {
      alert("Upload failed connection.");
    } finally {
      setIsUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept: {'image/*': []},
    multiple: false 
  });

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* SECTION 1: UPLOAD/TRAIN BOX */}
        <section>
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Train the AI</h2>
          <div 
            {...getRootProps()} 
            className={`border-4 border-dashed rounded-2xl p-10 text-center transition cursor-pointer
              ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-white hover:border-blue-400'}`}
          >
            <input {...getInputProps()} />
            {isUploading ? (
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-2"></div>
                <p className="text-blue-600 font-semibold">Gemini is analyzing and syncing...</p>
              </div>
            ) : (
              <div>
                <p className="text-3xl mb-2">🛥️</p>
                <p className="text-lg text-slate-600">
                  {isDragActive ? "Drop the boat image here" : "Drag & drop a boat image to train the AI"}
                </p>
                <p className="text-sm text-slate-400 mt-2">Supports JPG, PNG (Max 10MB)</p>
              </div>
            )}
          </div>
        </section>

        <hr className="border-slate-200" />

        {/* SECTION 2: SEARCH & GALLERY */}
        <section className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-slate-800">Boat Library</h2>
            
            <div className="relative flex-1 max-w-md">
              <input 
                type="text" 
                placeholder="Describe a boat..."
                className="w-full pl-4 pr-12 py-3 rounded-full border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
              />
              <button 
                onClick={() => handleSearch(query)}
                className="absolute right-2 top-1.5 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition"
              >
                🔍
              </button>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1,2,3,4].map(i => <div key={i} className="h-64 bg-slate-200 animate-pulse rounded-xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {results.map((boat) => (
                <div key={boat.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100 hover:shadow-lg transition">
                  <div className="aspect-square relative">
                    <img 
                      src={boat.metadata.url} 
                      alt="Boat" 
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="p-3 bg-white">
                    <p className="text-xs text-slate-500 truncate">{boat.id}</p>
                    {boat.score && (
                      <div className="mt-1 text-xs font-bold text-green-600">
                        Match: {Math.round(boat.score * 100)}%
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}