'use client';

import { useState } from 'react';
import Image from 'next/image';
import { UploadCloud, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import type { CloudinaryUploadResult } from '@/types';

interface ImageUploaderProps {
  onUploadSuccess: (result: CloudinaryUploadResult) => void;
  currentImageUrl?: string;
  label?: string;
  folder?: string;
}

export default function ImageUploader({
  onUploadSuccess,
  currentImageUrl,
  label = 'Upload Image',
  folder = 'allwin_music_school',
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setErrorMessage(null);
    setIsUploading(true);

    try {
      // Step 1: Request signature from server
      const timestamp = Math.round(new Date().getTime() / 1000);
      const paramsToSign = {
        timestamp,
        folder,
      };

      const signRes = await fetch('/api/cloudinary-signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paramsToSign }),
      });

      if (!signRes.ok) {
        throw new Error('Failed to generate secure upload signature');
      }

      const { signature } = await signRes.json();
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'gkw3rcxj';
      const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || '766659989326524';

      // Step 2: Direct signed upload to Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', apiKey);
      formData.append('timestamp', timestamp.toString());
      formData.append('signature', signature);
      formData.append('folder', folder);

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!uploadRes.ok) {
        throw new Error('Cloudinary upload failed');
      }

      const data = await uploadRes.json();

      const result: CloudinaryUploadResult = {
        secure_url: data.secure_url,
        public_id: data.public_id,
        width: data.width,
        height: data.height,
        format: data.format,
        bytes: data.bytes,
      };

      setPreviewUrl(data.secure_url);
      onUploadSuccess(result);
    } catch (err: any) {
      console.error('Upload failed:', err);
      setErrorMessage(err.message || 'Image upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClear = () => {
    setPreviewUrl(null);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-text-primary">{label}</label>

      {errorMessage && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {previewUrl ? (
        <div className="relative w-full h-48 sm:h-60 rounded-2xl overflow-hidden border border-border bg-slate-50 group">
          <Image
            src={previewUrl}
            alt="Upload Preview"
            fill
            sizes="100vw"
            className="object-contain"
          />
          {isUploading && (
            <div className="absolute inset-0 bg-navy/70 backdrop-blur-sm flex flex-col items-center justify-center text-white space-y-2">
              <Loader2 className="w-8 h-8 animate-spin text-orange" />
              <span className="text-xs font-semibold">Uploading to Cloudinary...</span>
            </div>
          )}
          {!isUploading && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-navy/80 text-white hover:bg-navy transition-all"
              aria-label="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-border rounded-2xl cursor-pointer hover:bg-surface-dim hover:border-violet/50 transition-all group">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <UploadCloud className="w-8 h-8 mb-2 text-text-muted group-hover:text-violet transition-colors" />
            <p className="text-xs font-semibold text-text-primary">
              Click to upload photo
            </p>
            <p className="text-[11px] text-text-muted mt-1">
              PNG, JPG, WEBP up to 10MB
            </p>
          </div>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </label>
      )}
    </div>
  );
}
