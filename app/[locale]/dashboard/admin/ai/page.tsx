"use client";
import { useState } from 'react';

export default function BoatUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);

  const handleUpload = async () => {
    if (!file) return alert("Please select an image first");

    setLoading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      // Replace with your actual VPS IP or domain
      const res = await fetch('https://schepen-kring.nl/api/upload-boat', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      setResponse(data);
    } catch (error) {
      console.error("Upload failed", error);
      setResponse({ status: 'error', message: 'Failed to connect to server' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-lg mx-auto bg-white rounded-xl shadow-md space-y-4 border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-800">Boat Image Uploader</h2>
      
      <input 
        type="file" 
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />

      <button
        onClick={handleUpload}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 transition"
      >
        {loading ? 'Processing AI Sync...' : 'Upload & Sync to Pinecone'}
      </button>

      {response && (
        <div className={`mt-4 p-4 rounded-lg text-sm ${response.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          <pre className="whitespace-pre-wrap">{JSON.stringify(response, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}