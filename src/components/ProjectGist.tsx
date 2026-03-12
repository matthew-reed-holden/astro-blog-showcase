import React from 'react';

interface Highlight {
    label: string;
    value: string;
}

interface ProjectGistProps {
    description: string;
    role?: string;
    timeline?: string;
    highlights?: Highlight[];
}

export default function ProjectGist({ description, role, timeline, highlights }: ProjectGistProps) {
    return (
        <div className="glass-panel p-6 md:p-8 rounded-2xl border border-[var(--color-glass-border)] mb-12 relative overflow-hidden">
            {/* Background elements for depth */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-primary)]/10 rounded-full blur-[80px] -z-10 translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-[var(--color-link)]/10 rounded-full blur-[60px] -z-10 -translate-x-1/2 translate-y-1/2"></div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
                <div className="lg:col-span-2 space-y-6">
                    <p className="text-xl md:text-2xl font-light leading-relaxed text-gray-200">
                        {description}
                    </p>
                    
                    <div className="flex flex-wrap gap-6 pt-4 border-t border-white/10">
                        {role && (
                            <div>
                                <h3 className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-1 font-mono">Role</h3>
                                <p className="text-gray-200 font-medium">{role}</p>
                            </div>
                        )}
                        {timeline && (
                            <div>
                                <h3 className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-1 font-mono">Timeline</h3>
                                <p className="text-gray-200 font-medium">{timeline}</p>
                            </div>
                        )}
                    </div>
                </div>

                {highlights && highlights.length > 0 && (
                    <div className="lg:col-span-1 grid grid-cols-2 gap-4">
                        {highlights.map((highlight, index) => (
                            <div 
                                key={index} 
                                className="bg-black/30 border border-white/5 rounded-xl p-4 flex flex-col justify-center items-center text-center hover:bg-black/40 transition-colors group"
                            >
                                <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white to-gray-400 group-hover:to-[var(--color-primary)] transition-all drop-shadow-[0_0_10px_rgba(255,255,255,0.1)] mb-2 font-mono">
                                    {highlight.value}
                                </span>
                                <span className="text-xs text-gray-400 tracking-wide">{highlight.label}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
