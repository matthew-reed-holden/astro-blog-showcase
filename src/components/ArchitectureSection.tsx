import React from 'react';

interface DiagramType {
    src: string;
    alt: string;
    caption?: string;
    description?: string;
}

interface ArchitectureSectionProps {
    diagrams: DiagramType[];
}

export default function ArchitectureSection({ diagrams }: ArchitectureSectionProps) {
    if (!diagrams || diagrams.length === 0) return null;

    return (
        <div className="space-y-16 my-10">
            {diagrams.map((diagram, index) => (
                <div key={index} className="flex flex-col gap-6">
                    <div className="rounded-xl overflow-hidden border border-white/10 bg-black/40 shadow-2xl p-2 md:p-4">
                        <img 
                            src={diagram.src} 
                            alt={diagram.alt} 
                            className="w-full h-auto rounded-lg object-contain bg-white/5"
                        />
                    </div>
                    
                    {(diagram.caption || diagram.description) && (
                        <div className="max-w-3xl mx-auto text-center space-y-3 px-4">
                            {diagram.caption && (
                                <h4 className="text-lg font-medium text-white/90 font-mono">
                                    {diagram.caption}
                                </h4>
                            )}
                            {diagram.description && (
                                <p className="text-gray-400 leading-relaxed text-sm md:text-base">
                                    {diagram.description}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
