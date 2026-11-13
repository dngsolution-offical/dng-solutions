// src/pages/TestFiles.jsx — Test file creation
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebase';

export default function TestFiles() {
  const { currentUser } = useAuth();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testCreateFile = async (mode, prompt) => {
    setLoading(true);
    setResult(null);
    try {
      const idToken = await auth.currentUser?.getIdToken();
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: prompt, mode, idToken }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ error: err.message });
    }
    setLoading(false);
  };

  if (!currentUser) {
    return <div className="min-h-screen bg-[#050505] text-white p-8">Please sign in first</div>;
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8">
      <h1 className="text-3xl font-bold mb-6">File Creation Test</h1>

      <div className="space-y-3 mb-8">
        <button onClick={() => testCreateFile('file', 'Create CSV file with 3 orders: date, client, guests, total')}
          disabled={loading} className="block w-full max-w-md px-6 py-3 bg-blue-500 rounded-lg font-bold">
          Test: Create CSV
        </button>

        <button onClick={() => testCreateFile('file', 'Create JSON config for website with name, colors, social links')}
          disabled={loading} className="block w-full max-w-md px-6 py-3 bg-green-500 rounded-lg font-bold">
          Test: Create JSON
        </button>

        <button onClick={() => testCreateFile('code', 'Write React counter component with hooks')}
          disabled={loading} className="block w-full max-w-md px-6 py-3 bg-purple-500 rounded-lg font-bold">
          Test: Create React Component
        </button>
      </div>

      {loading && <p>Loading...</p>}

      {result && (
        <div className="bg-white/5 p-4 rounded-lg">
          <h2 className="text-xl font-bold mb-2">Result:</h2>
          <pre className="text-xs overflow-auto">{JSON.stringify(result, null, 2)}</pre>

          {result.files?.map((file, i) => (
            <div key={i} className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <p className="font-bold">{file.name}</p>
              <p className="text-xs text-gray-400">{file.mime} · {file.size} bytes</p>
              <button onClick={() => {
                const blob = new Blob([file.content], { type: file.mime });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = file.name;
                a.click();
                URL.revokeObjectURL(url);
              }} className="mt-2 px-4 py-2 bg-green-500 rounded text-white font-bold">
                Download {file.name}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}