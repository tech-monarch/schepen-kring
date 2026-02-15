"use client";
import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';

export default function BoatCenter() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const VPS_URL = "https://schepen-kring.nl"; // Change to your domain

  // Load all boats on mount
  useEffect(() => {
    handleSearch("");
  }, []);

  // Search boats (empty query returns all)
  const handleSearch = async (text: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${VPS_URL}/api/search-boats?query=${encodeURIComponent(text)}`);
      const data = await res.json();
      // Expecting { results: { matches: [...] } }
      setResults(data.results?.matches || []);
    } catch (e) {
      console.error("Search failed", e);
    } finally {
      setLoading(false);
    }
  };

  // Upload image
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
      if (data.status === 'success') {
        alert("Boat synced successfully!");
        handleSearch(""); // Refresh gallery
      } else {
        alert(data.message || "Upload failed");
      }
    } catch (error) {
      alert("Upload connection failed.");
    } finally {
      setIsUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false,
  });

  // Delete a boat by filename (id)
  const handleDelete = async (filename: string) => {
    if (!confirm("Are you sure you want to delete this boat image? This action cannot be undone.")) {
      return;
    }

    setDeletingId(filename);
    try {
      const res = await fetch(`${VPS_URL}/api/boats/${encodeURIComponent(filename)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        alert("Boat deleted successfully!");
        handleSearch(""); // Refresh gallery
      } else {
        alert(data.message || "Delete failed");
      }
    } catch (error) {
      alert("Delete connection failed.");
    } finally {
      setDeletingId(null);
    }
  };

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
                <div key={boat.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100 hover:shadow-lg transition group relative">
                  <div className="aspect-square relative">
                    <img 
                      src={boat.metadata?.url || boat.url} 
                      alt="Boat" 
                      className="object-cover w-full h-full"
                      onError={(e) => (e.currentTarget.src = '/placeholder-boat.jpg')}
                    />
                    {/* Delete button */}
                    <button
                      onClick={() => handleDelete(boat.id)}
                      disabled={deletingId === boat.id}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete image"
                    >
                      {deletingId === boat.id ? (
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>
                  </div>
                  <div className="p-3 bg-white">
                    <p className="text-xs text-slate-500 truncate">{boat.id}</p>
                    {boat.score && (
                      <div className="mt-1 text-xs font-bold text-green-600">
                        Match: {Math.round(boat.score * 100)}%
                      </div>
                    )}
                    {boat.metadata?.description && (
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2">{boat.metadata.description}</p>
                    )}
                  </div>
                </div>
              ))}
              {results.length === 0 && !loading && (
                <p className="col-span-full text-center text-slate-500 py-10">No boats found. Upload some images to get started.</p>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}