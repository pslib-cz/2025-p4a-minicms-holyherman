"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function AvatarUpload({ currentImage, userName }: { currentImage: string | null; userName: string | null }) {
  const [preview, setPreview] = useState<string | null>(currentImage);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    if (file.size > 1024 * 1024) {
      alert("Image must be less than 1MB.");
      return;
    }

    // Show local preview immediately
    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await fetch("/api/profile/avatar", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setPreview(data.image);
        router.refresh();
      } else {
        const msg = await res.text();
        alert(msg || "Failed to upload avatar.");
        setPreview(currentImage);
      }
    } catch {
      alert("An error occurred.");
      setPreview(currentImage);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative group cursor-pointer" onClick={() => fileRef.current?.click()}>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        disabled={uploading}
      />
      {preview ? (
        <img
          src={preview}
          alt={userName || "Profile"}
          className="rounded-full w-24 h-24 sm:w-32 sm:h-32 object-cover bg-surface-low"
        />
      ) : (
        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-primary-fixed/30 flex items-center justify-center text-4xl text-primary font-bold">
          {userName?.[0] || "?"}
        </div>
      )}
      <div className="absolute inset-0 rounded-full bg-on-surface/0 group-hover:bg-on-surface/40 transition-colors flex items-center justify-center">
        <svg
          className="w-8 h-8 text-on-primary opacity-0 group-hover:opacity-100 transition-opacity"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>
      {uploading && (
        <div className="absolute inset-0 rounded-full bg-on-surface/50 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-on-primary border-t-transparent animate-spin"></div>
        </div>
      )}
    </div>
  );
}
