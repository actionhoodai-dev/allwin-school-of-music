'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, X, ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import { getPublishedDocuments } from '@/lib/firebase/firestore';
import { GALLERY_CATEGORIES } from '@/lib/constants';
import type { GalleryImage } from '@/types';

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getPublishedDocuments<GalleryImage>('gallery', 'createdAt', 'desc');
        setImages(data);
      } catch {
        setImages([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = selectedCategory === 'all'
    ? images
    : images.filter((img) => img.category === selectedCategory);

  const activeImage = activeImageIndex !== null ? filtered[activeImageIndex] : null;

  const nextImage = () => {
    if (activeImageIndex !== null) {
      setActiveImageIndex((activeImageIndex + 1) % filtered.length);
    }
  };

  const prevImage = () => {
    if (activeImageIndex !== null) {
      setActiveImageIndex((activeImageIndex - 1 + filtered.length) % filtered.length);
    }
  };

  return (
    <div className="bg-surface">
      {/* Hero */}
      <section className="relative py-20 lg:py-28 gradient-hero text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-orange text-xs sm:text-sm font-semibold uppercase tracking-wider border border-white/15">
            Moments in Harmony
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-extrabold text-white tracking-tight">
            Academy <span className="bg-gradient-to-r from-white via-purple-200 to-orange bg-clip-text text-transparent">Gallery</span>
          </h1>

          <p className="text-base sm:text-lg text-white/80 max-w-2xl mx-auto font-sans">
            Capturing classroom training, student recitals, grade examination preparation, and special events at Allwin.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 bg-surface-dim">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          {/* Category Filter Pills */}
          <div className="flex items-center justify-center flex-wrap gap-2">
            {GALLERY_CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => {
                  setSelectedCategory(cat.value);
                  setActiveImageIndex(null);
                }}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  selectedCategory === cat.value
                    ? 'bg-navy text-white shadow-md'
                    : 'bg-white text-text-secondary hover:bg-slate-100 border border-border'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Masonry / Grid */}
          {filtered.length > 0 ? (
            <div className="masonry-grid">
              {filtered.map((img, idx) => (
                <div
                  key={img.id || idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className="group relative rounded-2xl overflow-hidden shadow-md cursor-pointer bg-slate-900 mb-4"
                >
                  <Image
                    src={img.imageUrl}
                    alt={img.title || 'Allwin School of Music Gallery Image'}
                    width={img.width || 600}
                    height={img.height || 450}
                    className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-orange tracking-wider">
                          {img.category}
                        </span>
                        <h4 className="font-heading font-semibold text-sm line-clamp-1">
                          {img.title}
                        </h4>
                      </div>
                      <ZoomIn className="w-5 h-5 text-white/80" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="max-w-2xl mx-auto text-center p-10 sm:p-14 rounded-3xl bg-white border border-border shadow-lg space-y-6">
              <div className="w-20 h-20 rounded-full bg-purple-deep/5 flex items-center justify-center mx-auto text-violet">
                <ImageIcon className="w-10 h-10" />
              </div>

              <h2 className="text-2xl font-heading font-bold text-navy">
                Academy Gallery
              </h2>

              <p className="text-sm text-text-secondary leading-relaxed max-w-md mx-auto">
                Our academy gallery is being updated with high-resolution moments from classes, recitals, and examinations. Check back soon for new photos.
              </p>

              <div className="pt-2">
                <Button href="/contact" size="sm">
                  Visit Allwin Campus in Salem
                </Button>
              </div>
            </div>
          )}

        </div>
      </section>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {activeImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8"
          >
            <button
              onClick={() => setActiveImageIndex(null)}
              className="absolute top-6 right-6 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all z-20"
              aria-label="Close Lightbox"
            >
              <X className="w-6 h-6" />
            </button>

            {filtered.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all z-20"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all z-20"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            <div className="relative max-w-5xl max-h-[85vh] w-full h-full flex flex-col items-center justify-center">
              <div className="relative w-full h-[70vh]">
                <Image
                  src={activeImage.imageUrl}
                  alt={activeImage.title || 'Allwin School of Music'}
                  fill
                  sizes="100vw"
                  className="object-contain"
                  priority
                />
              </div>

              {activeImage.title && (
                <div className="mt-4 text-center text-white">
                  <p className="text-xs uppercase font-bold text-orange tracking-wider">
                    {activeImage.category}
                  </p>
                  <h3 className="font-heading font-semibold text-lg">
                    {activeImage.title}
                  </h3>
                  {activeImage.description && (
                    <p className="text-xs text-white/70 mt-1 max-w-lg mx-auto">
                      {activeImage.description}
                    </p>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
