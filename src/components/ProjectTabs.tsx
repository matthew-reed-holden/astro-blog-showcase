import { useState, useEffect, useRef } from 'react';
import type { Icon as PhosphorIcon } from '@phosphor-icons/react';
import { TreeStructure, Lightning, Code, Broadcast, ChartLine } from '@phosphor-icons/react';
import MermaidDiagram from './MermaidDiagram';
import OEETrendsChart from './OEETrendsChart';

interface Section {
    id: string;
    title: string;
    icon?: string;
}

interface DiagramConfig {
    chart: string;
    caption?: string;
}

interface ProjectTabsProps {
    sections: Section[];
    content: Record<string, string>;
    diagrams?: Record<string, DiagramConfig>;
}

const iconMap: Record<string, PhosphorIcon> = {
    'tree-structure': TreeStructure,
    'lightning': Lightning,
    'code': Code,
    'broadcast': Broadcast,
    'chart-line': ChartLine,

};

const getIcon = (iconName?: string) => {
    if (!iconName) return null;
    const IconComponent = iconMap[iconName];
    return IconComponent ? <IconComponent size={20} weight="duotone" /> : null;
};

export default function ProjectTabs({ sections, content, diagrams }: ProjectTabsProps) {
    const [activeTab, setActiveTab] = useState(sections?.[0]?.id || '');
    const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
    const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);

    useEffect(() => {
        if (!sections || sections.length === 0) return;
        const activeIndex = sections.findIndex(s => s.id === activeTab);
        const activeElement = tabsRef.current[activeIndex];
        
        if (activeElement) {
            setIndicatorStyle({
                left: activeElement.offsetLeft,
                width: activeElement.offsetWidth
            });
        }
    }, [activeTab, sections]);

    if (!sections || sections.length === 0) return null;

    return (
        <div className="w-full mt-16 mb-24">
            {/* Tab Navigation */}
            <div className="relative border-b border-white/10 mb-8 overflow-x-auto hide-scrollbar">
                <div className="flex min-w-max md:min-w-0 pb-4 relative">
                    {sections.map((section, index) => {
                        const isActive = activeTab === section.id;
                        return (
                                <button
                                    type="button"
                                    key={section.id}
                                    ref={el => tabsRef.current[index] = el}
                                    onClick={() => setActiveTab(section.id)}
                                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg transition-all duration-300 relative z-10 font-mono text-xs md:text-sm whitespace-nowrap ${
                                        isActive 
                                            ? 'text-white font-semibold' 
                                            : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                                    }`}
                                    aria-selected={isActive}
                                    role="tab"
                                >
                                {section.icon && (
                                    <span className={isActive ? 'text-[var(--color-primary)]' : ''}>
                                        {getIcon(section.icon)}
                                    </span>
                                )}
                                <span>{section.title}</span>
                            </button>
                        );
                    })}
                    
                    {/* Animated active indicator */}
                    <div 
                        className="absolute bottom-0 h-1 bg-[var(--color-primary)] rounded-t-full transition-all duration-300 ease-out shadow-[0_0_15px_rgba(130,80,210,0.6)]"
                        style={{
                            left: indicatorStyle.left,
                            width: indicatorStyle.width,
                            transform: 'translateY(4px)'
                        }}
                    />
                </div>
            </div>

            {/* Tab Content Panels */}
            <div className="relative min-h-[300px]">
                {sections.map((section) => (
                    <div
                        key={section.id}
                        role="tabpanel"
                        id={`panel-${section.id}`}
                        aria-labelledby={`tab-${section.id}`}
                        className={`transition-all duration-500 absolute top-0 left-0 w-full ${
                            activeTab === section.id
                                ? 'opacity-100 translate-y-0 pointer-events-auto relative'
                                : 'opacity-0 translate-y-4 pointer-events-none'
                        }`}
                    >
                        {content[section.id] || diagrams?.[section.id] ? (
                            <div className="animate-fade-in">
                                {diagrams?.[section.id] && (
                                    <div className="mb-8">
                                        <MermaidDiagram 
                                            chart={diagrams[section.id].chart}
                                            caption={diagrams[section.id].caption}
                                        />
                                    </div>
                                )}
                                {content[section.id] && (
                                    <div 
                                        dangerouslySetInnerHTML={{ __html: content[section.id] }} 
                                    />
                                )}
                                {section.id === 'oee' && (
                                    <div className="mt-8">
                                        <OEETrendsChart />
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-48 text-gray-500 font-mono text-sm border border-dashed border-white/10 rounded-xl">
                                Content for {section.id} not available
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
