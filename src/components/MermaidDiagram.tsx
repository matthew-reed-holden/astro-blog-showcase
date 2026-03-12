import { useEffect, useRef, useState, useId } from 'react';
import mermaid from 'mermaid';

interface MermaidDiagramProps {
    chart: string;
    caption?: string;
}

export default function MermaidDiagram({ chart, caption }: MermaidDiagramProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const uniqueId = `mermaid-${useId().replace(/:/g, '')}`;

    useEffect(() => {
        let isMounted = true;

        const renderDiagram = async () => {
            try {
                mermaid.initialize({
                    startOnLoad: false,
                    theme: 'base',
                    themeVariables: {
                        primaryColor: '#8250d2',
                        primaryTextColor: '#e2e8f0',
                        primaryBorderColor: '#6b3fa0',
                        lineColor: '#64748b',
                        secondaryColor: '#1e293b',
                        tertiaryColor: '#0f172a',
                        background: '#0a0a0f',
                        mainBkg: '#1e1e2e',
                        nodeBorder: '#6b3fa0',
                        clusterBkg: '#12121a',
                        clusterBorder: 'rgba(130,80,210,0.3)',
                        titleColor: '#e2e8f0',
                        edgeLabelBackground: '#1e1e2e',
                        fontSize: '14px',
                        fontFamily: 'ui-monospace, SFMono-Regular, monospace'
                    }
                });

                const { svg, bindFunctions } = await mermaid.render(uniqueId, chart);
                
                if (isMounted && containerRef.current) {
                    containerRef.current.innerHTML = svg;
                    bindFunctions?.(containerRef.current);
                    setIsLoading(false);
                }
            } catch (err) {
                if (isMounted) {
                    console.error('Failed to render Mermaid diagram:', err);
                    setError('Failed to render architecture diagram.');
                    setIsLoading(false);
                }
            }
        };

        renderDiagram();

        return () => {
            isMounted = false;
        };
    }, [chart, uniqueId]);

    return (
        <div className="w-full">
            <div className="bg-black/40 border border-white/10 rounded-xl p-6 overflow-x-auto">
                {isLoading && (
                    <div className="animate-pulse flex space-x-4 items-center justify-center h-64">
                        <div className="text-gray-500 font-mono">Loading architecture...</div>
                    </div>
                )}
                {error && (
                    <div className="flex items-center justify-center h-64 text-red-400 font-mono border border-red-500/20 bg-red-500/10 rounded-lg">
                        {error}
                    </div>
                )}
                <div 
                    ref={containerRef}
                    className={`flex justify-center transition-opacity duration-500 ${isLoading ? 'opacity-0 h-0' : 'opacity-100'}`}
                />
            </div>
            {caption && !error && !isLoading && (
                <p className="text-center text-sm text-gray-500 mt-4 font-mono">{caption}</p>
            )}
        </div>
    );
}
