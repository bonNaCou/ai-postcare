"use client";

import { useState } from "react";
import { getStorage, ref, uploadBytes, getDownloadURL, listAll, deleteObject } from "firebase/storage";
import { app } from "@/lib/firebaseConfig";

export default function FileUploader({ userId }: { userId: string }) {
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<{ name: string; url: string }[]>([]);

  const storage = getStorage(app);

  async function fetchFiles() {
    const listRef = ref(storage, `patients/${userId}/uploads`);
    const res = await listAll(listRef);
    const urls = await Promise.all(
      res.items.map(async (itemRef) => ({
        name: itemRef.name,
        url: await getDownloadURL(itemRef),
      }))
    );
    setFiles(urls);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fileRef = ref(storage, `patients/${userId}/uploads/${Date.now()}_${file.name}`);
      await uploadBytes(fileRef, file);
      await fetchFiles();
      alert("File uploaded successfully.");
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(name: string) {
    const fileRef = ref(storage, `patients/${userId}/uploads/${name}`);
    await deleteObject(fileRef);
    await fetchFiles();
  }

  return (
    <section className="bg-white dark:bg-neutral-800 rounded-xl shadow p-6 border border-purple-100 dark:border-purple-800 max-w-lg">
      <h3 className="text-base font-semibold text-purple-700 dark:text-purple-300 mb-3">
        Upload Medical Reports
      </h3>
      <input
        type="file"
        accept=".pdf,image/*"
        onChange={handleUpload}
        disabled={uploading}
        className="block w-full text-sm text-gray-600 dark:text-gray-300 mb-2"
      />
      {uploading && <p className="text-xs text-gray-500">Uploading...</p>}

      <ul className="mt-3 text-sm text-gray-700 dark:text-gray-300 space-y-1">
        {files.map((f) => (
          <li key={f.name} className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-1">
            <a href={f.url} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">
              {f.name}
            </a>
            <button
              onClick={() => handleDelete(f.name)}
              className="text-xs text-red-600 hover:text-red-800"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}