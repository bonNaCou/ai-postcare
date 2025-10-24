"use client";
import { useState } from "react";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import app from "@/lib/firebaseConfig";

export default function FileUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const storage = getStorage(app);

  async function handleUpload() {
    if (!file) return;
    setLoading(true);
    try {
      const fileRef = ref(storage, `reports/${file.name}-${Date.now()}`);
      await uploadBytes(fileRef, file);
      const downloadURL = await getDownloadURL(fileRef);
      setUrl(downloadURL);
      alert("File uploaded successfully!");
    } catch (e) {
      console.error(e);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mt-6 shadow-sm">
      <h3 className="font-semibold text-purple-700 mb-2">Upload Medical Report</h3>
      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="block w-full text-sm text-gray-700 mb-2"
      />
      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md disabled:opacity-60"
      >
        {loading ? "Uploading..." : "Upload"}
      </button>
      {url && (
        <p className="mt-2 text-xs text-gray-500 break-all">
          File URL: <a href={url} target="_blank" className="text-purple-600 underline">{url}</a>
        </p>
      )}
    </div>
  );
}