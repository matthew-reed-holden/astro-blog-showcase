import type { Icon as PhosphorIcon } from '@phosphor-icons/react';
import { TreeStructure, Lightning, Code, Broadcast, ChartLine, Image as ImageIcon, Gear, Database, Bell, ShieldCheck } from '@phosphor-icons/react';

interface FeatureCardProps {
    title: string;
    description: string;
    icon?: string;
    items?: string[];
}

const iconMap: Record<string, PhosphorIcon> = {
    'tree-structure': TreeStructure,
    'lightning': Lightning,
    'code': Code,
    'broadcast': Broadcast,
    'chart-line': ChartLine,
    'image': ImageIcon,
    'gear': Gear,
    'database': Database,
    'bell': Bell,
    'shield-check': ShieldCheck,
};

const getIcon = (iconName?: string) => {
    if (!iconName) return null;
    const IconComponent = iconMap[iconName];
    return IconComponent ? <IconComponent size={32} weight="duotone" /> : null;
};

export default function FeatureCard({ title, description, icon, items }: FeatureCardProps) {
    return (
        <div className="glass-panel p-6 md:p-8 rounded-2xl border border-[var(--color-glass-border)] hover:border-[var(--color-primary)]/40 hover:shadow-[0_0_30px_rgba(130,80,210,0.15)] transition-all duration-300 group hover:-translate-y-1 relative overflow-hidden h-full flex flex-col">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-primary)]/5 rounded-full blur-[40px] -z-10 group-hover:bg-[var(--color-primary)]/10 transition-colors"></div>
            
            <div className="mb-6 text-[var(--color-primary)] opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all origin-left">
                {getIcon(icon)}
            </div>
            
            <h3 className="text-xl font-bold text-white mb-3 font-mono">{title}</h3>
            
            <p className="text-gray-400 text-sm md:text-base leading-relaxed mb-6 flex-grow">
                {description}
            </p>
            
            {items && items.length > 0 && (
                <ul className="space-y-2 mt-auto pt-4 border-t border-white/5">
                    {items.map((item, index) => (
                        <li key={index} className="flex items-start text-sm text-gray-300">
                            <span className="text-[var(--color-primary)] mr-2 mt-0.5 opacity-70">▹</span>
                            <span className="leading-snug">{item}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
