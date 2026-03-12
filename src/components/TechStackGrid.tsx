import React from 'react';

interface TechCategory {
    name: string;
    items: string[];
}

interface TechStackGridProps {
    categories: TechCategory[];
}

export default function TechStackGrid({ categories }: TechStackGridProps) {
    if (!categories || categories.length === 0) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-8">
            {categories.map((category) => (
                <div 
                    key={category.name} 
                    className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-colors"
                >
                    <h3 className="text-sm uppercase tracking-widest text-gray-400 font-semibold mb-4 font-mono border-b border-white/10 pb-2">
                        {category.name}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {category.items.map((item) => (
                            <span 
                                key={item} 
                                className="px-3 py-1 bg-black/40 text-gray-200 rounded-md text-sm border border-white/5"
                            >
                                {item}
                            </span>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
