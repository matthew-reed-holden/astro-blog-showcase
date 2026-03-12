import React, { useState, useEffect } from 'react';
import { X, CaretLeft, CaretRight } from '@phosphor-icons/react';

interface ImageType {
    src: string;
    alt: string;
    caption?: string;
}

interface ScreenshotGalleryProps {
    images: ImageType[];
}

export default function ScreenshotGallery({ images }: ScreenshotGalleryProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!images || images.length === 0) return null;

    const openLightbox = (index: number) => {
        setCurrentIndex(index);
        setIsOpen(true);
    };

    const closeLightbox = () => {
        setIsOpen(false);
    };

    const nextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowRight') setCurrentIndex((prev) => (prev + 1) % images.length);
            if (e.key === 'ArrowLeft') setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
        };

        window.addEventListener('keydown', handleKeyDown);
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [isOpen, images.length]);

    return (
        <div className="my-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {images.map((image, index) => (
                    <div 
                        key={image.src + index} 
                        className="group relative cursor-pointer overflow-hidden rounded-xl border border-white/10 aspect-video bg-black/50"
                        onClick={() => openLightbox(index)}
                    >
                        <img 
                            src={image.src} 
                            alt={image.alt} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                            {image.caption && (
                                <p className="p-4 text-white text-sm font-medium drop-shadow-md">
                                    {image.caption}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {isOpen && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 md:p-10 animate-fade-in"
                    onClick={closeLightbox}
                >
                    <button 
                        type="button"
                        className="absolute top-6 right-6 text-white/70 hover:text-white bg-black/50 p-2 rounded-full transition-colors z-50 border border-white/10"
                        onClick={closeLightbox}
                        aria-label="Close lightbox"
                    >
                        <X size={24} />
                    </button>

                    <div className="relative max-w-6xl w-full h-full flex flex-col items-center justify-center">
                        <button 
                            type="button"
                            className="absolute left-0 md:left-4 p-3 text-white/50 hover:text-white bg-black/50 rounded-full transition-all hover:scale-110 z-50 border border-white/10"
                            onClick={prevImage}
                            aria-label="Previous image"
                        >
                            <CaretLeft size={32} />
                        </button>

                        <div className="relative w-full max-h-[85vh] flex items-center justify-center p-8 md:p-16">
                            <img 
                                src={images[currentIndex].src} 
                                alt={images[currentIndex].alt} 
                                className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl animate-scale-in border border-white/10"
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>

                        {images[currentIndex].caption && (
                            <div 
                                className="absolute bottom-4 md:bottom-10 left-0 w-full text-center px-4"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <p className="inline-block bg-black/80 px-6 py-3 rounded-full text-white/90 text-sm md:text-base border border-white/10 backdrop-blur-sm shadow-xl">
                                    {images[currentIndex].caption}
                                </p>
                            </div>
                        )}

                        <button 
                            type="button"
                            className="absolute right-0 md:right-4 p-3 text-white/50 hover:text-white bg-black/50 rounded-full transition-all hover:scale-110 z-50 border border-white/10"
                            onClick={nextImage}
                            aria-label="Next image"
                        >
                            <CaretRight size={32} />
                        </button>
                        
                        <div className="absolute bottom-2 left-0 w-full text-center text-white/30 text-xs font-mono">
                            {currentIndex + 1} / {images.length}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
