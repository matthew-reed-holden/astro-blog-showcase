import { useState, type MouseEvent } from 'react';

const rawData = [
  { day: 'Mon', plannedHours: 24, runHours: 21.5, totalParts: 2450, idealCycleTime: 0.5, goodParts: 2380 },
  { day: 'Tue', plannedHours: 24, runHours: 17.0, totalParts: 1800, idealCycleTime: 0.5, goodParts: 1650 },
  { day: 'Wed', plannedHours: 24, runHours: 20.5, totalParts: 2300, idealCycleTime: 0.5, goodParts: 2200 },
  { day: 'Thu', plannedHours: 24, runHours: 22.5, totalParts: 2650, idealCycleTime: 0.5, goodParts: 2600 },
  { day: 'Fri', plannedHours: 24, runHours: 23.0, totalParts: 2720, idealCycleTime: 0.5, goodParts: 2680 },
  { day: 'Sat', plannedHours: 16, runHours: 14.5, totalParts: 1680, idealCycleTime: 0.5, goodParts: 1640 },
  { day: 'Sun', plannedHours: 16, runHours: 15.2, totalParts: 1780, idealCycleTime: 0.5, goodParts: 1750 },
];

const chartData = rawData.map(d => {
  const availability = d.runHours / d.plannedHours;
  const performance = Math.min(1.0, (d.totalParts * d.idealCycleTime) / (d.runHours * 60));
  const quality = d.goodParts / d.totalParts;
  const oee = availability * performance * quality;

  return {
    day: d.day,
    Availability: availability * 100,
    Performance: performance * 100,
    Quality: quality * 100,
    OEE: oee * 100,
    raw: d
  };
});

const metrics = [
  { key: 'Availability', color: '#22c55e', label: 'Availability' },
  { key: 'Performance', color: '#3b82f6', label: 'Performance' },
  { key: 'Quality', color: '#f59e0b', label: 'Quality' },
  { key: 'OEE', color: 'var(--color-primary, #8250d2)', label: 'OEE (Overall)' }
] as const;

export default function OEETrendsChart() {
  const [hoveredPoint, setHoveredPoint] = useState<{ dayIndex: number; x: number; y: number } | null>(null);

  const width = 800;
  const height = 400;
  const padding = { top: 40, bottom: 60, left: 60, right: 40 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const getX = (index: number) => padding.left + (index / (chartData.length - 1)) * chartWidth;
  const getY = (value: number) => padding.top + chartHeight - (value / 100) * chartHeight;

  const generatePath = (metricKey: keyof typeof chartData[0]) => {
    return chartData.reduce((path, dataPoint, i) => {
      const x = getX(i);
      const y = getY(dataPoint[metricKey] as number);
      
      if (i === 0) return `M ${x},${y}`;
      
      const prevX = getX(i - 1);
      const prevY = getY(chartData[i - 1][metricKey] as number);
      const cp1X = prevX + (x - prevX) / 2;
      
      return `${path} C ${cp1X},${prevY} ${cp1X},${y} ${x},${y}`;
    }, '');
  };

  const generateArea = (metricKey: keyof typeof chartData[0]) => {
    const path = generatePath(metricKey);
    const firstX = getX(0);
    const lastX = getX(chartData.length - 1);
    const bottomY = padding.top + chartHeight;
    return `${path} L ${lastX},${bottomY} L ${firstX},${bottomY} Z`;
  };

  const gridLines = [0, 25, 50, 75, 100];

  const handleMouseMove = (e: MouseEvent<SVGSVGElement>) => {
    const svgRect = e.currentTarget.getBoundingClientRect();
    const xRelative = e.clientX - svgRect.left;
    const widthSvg = svgRect.width;
    const svgX = (xRelative / widthSvg) * width;

    let closestI = 0;
    let minDistance = Infinity;

    chartData.forEach((_, i) => {
      const pointX = getX(i);
      const distance = Math.abs(svgX - pointX);
      if (distance < minDistance) {
        minDistance = distance;
        closestI = i;
      }
    });

    const colWidth = chartWidth / (chartData.length - 1);
    if (minDistance <= colWidth / 2) {
      setHoveredPoint({ dayIndex: closestI, x: getX(closestI), y: padding.top });
    } else {
      setHoveredPoint(null);
    }
  };

  return (
    <div className="w-full relative border border-white/10 rounded-2xl bg-black/20 p-4 backdrop-blur-sm overflow-hidden group">
      <div className="flex items-center justify-between mb-4 px-4">
        <h3 className="text-white font-bold text-lg font-mono tracking-tight flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-pulse" />
          7-Day OEE Trend
        </h3>
        <div className="text-xs text-gray-400 font-mono">Simulated Plant Data</div>
      </div>
      
      <div className="relative w-full aspect-[2/1] min-h-[300px]">
        <svg 
          viewBox={`0 0 ${width} ${height}`} 
          className="w-full h-full overflow-visible cursor-crosshair"
          preserveAspectRatio="xMidYMid meet"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredPoint(null)}
          role="img"
          aria-label="7-Day OEE Trend Chart"
        >
          <title>7-Day OEE Trend Chart</title>
          <defs>
            {metrics.map(metric => (
              <linearGradient key={`grad-${metric.key}`} id={`grad-${metric.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={metric.color} stopOpacity="0.15" />
                <stop offset="100%" stopColor={metric.color} stopOpacity="0.0" />
              </linearGradient>
            ))}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {gridLines.map(percent => {
            const y = getY(percent);
            return (
              <g key={`grid-${percent}`}>
                <line 
                  x1={padding.left} 
                  y1={y} 
                  x2={width - padding.right} 
                  y2={y} 
                  stroke="currentColor" 
                  className="text-white/5" 
                  strokeWidth="1" 
                  strokeDasharray={percent === 0 ? "" : "4 4"}
                />
                <text 
                  x={padding.left - 10} 
                  y={y} 
                  fill="currentColor" 
                  className="text-gray-400 text-[10px] font-mono" 
                  textAnchor="end" 
                  alignmentBaseline="middle"
                >
                  {percent}%
                </text>
              </g>
            );
          })}

          {chartData.map((d, i) => (
            <text 
              key={`x-${d.day}`} 
              x={getX(i)} 
              y={height - padding.bottom + 20} 
              fill="currentColor" 
              className="text-gray-400 text-xs font-mono" 
              textAnchor="middle"
            >
              {d.day}
            </text>
          ))}

          {metrics.map(metric => (
            <path
              key={`area-${metric.key}`}
              d={generateArea(metric.key)}
              fill={`url(#grad-${metric.key})`}
              className="transition-opacity duration-300 opacity-60 group-hover:opacity-100"
            />
          ))}

          {metrics.map((metric) => (
            <path
              key={`line-${metric.key}`}
              d={generatePath(metric.key)}
              fill="none"
              stroke={metric.color}
              strokeWidth={metric.key === 'OEE' ? "3" : "2"}
              className="transition-all duration-300"
              filter={metric.key === 'OEE' ? "url(#glow)" : undefined}
            />
          ))}

          {chartData.map((d, i) => {
            const x = getX(i);
            const isHovered = hoveredPoint?.dayIndex === i;
            
            return (
              <g key={`points-${d.day}`}>
                {isHovered && (
                  <line 
                    x1={x} y1={padding.top} 
                    x2={x} y2={height - padding.bottom} 
                    stroke="currentColor" 
                    className="text-white/20" 
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                )}

                {metrics.map(metric => {
                  const y = getY(d[metric.key as keyof typeof d] as number);
                  return (
                    <circle
                      key={`dot-${metric.key}-${d.day}`}
                      cx={x}
                      cy={y}
                      r={isHovered ? 5 : 3}
                      fill={metric.color}
                      stroke="#000"
                      strokeWidth="2"
                      className="transition-all duration-200 pointer-events-none"
                    />
                  );
                })}
              </g>
            );
          })}
        </svg>

        {hoveredPoint !== null && (
          <div 
            className="absolute z-10 bg-black/80 backdrop-blur-md border border-white/10 p-3 rounded-lg shadow-xl shadow-black/50 pointer-events-none transform -translate-x-1/2 -translate-y-full"
            style={{ 
              left: `${(hoveredPoint.x / width) * 100}%`, 
              top: `calc(${(padding.top / height) * 100}% + 40px)` 
            }}
          >
            <div className="font-mono text-white text-xs font-bold mb-2 border-b border-white/10 pb-1">
              {chartData[hoveredPoint.dayIndex].day} Details
            </div>
            <div className="flex flex-col gap-1">
              {metrics.map(metric => {
                const val = chartData[hoveredPoint.dayIndex][metric.key as keyof typeof chartData[0]] as number;
                return (
                  <div key={metric.key} className="flex items-center justify-between gap-4 font-mono text-[10px]">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: metric.color }} />
                      <span className="text-gray-300">{metric.label}</span>
                    </div>
                    <span className="text-white font-semibold">{val.toFixed(1)}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-6 mt-2 pt-4 border-t border-white/5">
        {metrics.map(metric => (
          <div key={`legend-${metric.key}`} className="flex items-center gap-2">
            <span 
              className="w-3 h-3 rounded-sm" 
              style={{ 
                backgroundColor: metric.color,
                boxShadow: metric.key === 'OEE' ? `0 0 8px ${metric.color}` : 'none'
              }} 
            />
            <span className="text-xs font-mono text-gray-400">{metric.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}