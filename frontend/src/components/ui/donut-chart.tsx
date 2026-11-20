import React, { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export interface DonutChartData {
  label: string;
  value: number;
  color?: string;
}

interface DonutChartProps {
  data: DonutChartData[];
  label: string;
  className?: string;
}

// A set of pleasant colors for the chart
const defaultColors = [
  "#3b82f6", // blue-500
  "#10b981", // emerald-500
  "#f59e0b", // amber-500
  "#ef4444", // red-500
  "#8b5cf6", // violet-500
  "#ec4899", // pink-500
  "#06b6d4", // cyan-500
  "#f97316", // orange-500
  "#84cc16", // lime-500
  "#6366f1", // indigo-500
];

export function DonutChart({ data, label, className }: DonutChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const totalValue = data.reduce((acc, item) => acc + item.value, 0);
  
  useEffect(() => {
    if (!svgRef.current) return;
    
    // Animation can be enhanced further if needed
  }, [data]);
  
  // Calculate the segments for the donut chart
  const segments: JSX.Element[] = [];
  let cumulativePercent = 0;
  
  data.forEach((item, index) => {
    if (item.value === 0) return; // Skip items with zero value
    
    const percent = totalValue ? (item.value / totalValue) : 0;
    const color = item.color || defaultColors[index % defaultColors.length];
    
    // SVG arc calculation for donut chart
    const startX = Math.cos(2 * Math.PI * cumulativePercent);
    const startY = Math.sin(2 * Math.PI * cumulativePercent);
    
    cumulativePercent += percent;
    
    const endX = Math.cos(2 * Math.PI * cumulativePercent);
    const endY = Math.sin(2 * Math.PI * cumulativePercent);
    
    // Determine if the arc should be drawn as a large arc
    const largeArcFlag = percent > 0.5 ? 1 : 0;
    
    // Create the SVG path for this segment
    const pathData = [
      `M ${startX} ${startY}`, // Move to start point
      `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`, // Draw arc
      `L 0 0` // Line to center
    ].join(' ');
    
    segments.push(
      <motion.path
        key={index}
        d={pathData}
        fill={color}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
      />
    );
  });
  
  // Generate the legend items
  const legendItems = data.map((item, index) => {
    const color = item.color || defaultColors[index % defaultColors.length];
    const percent = totalValue ? Math.round((item.value / totalValue) * 100) : 0;
    
    return (
      <div key={index} className="flex items-center text-sm mb-1">
        <div 
          className="w-3 h-3 mr-2 rounded-sm" 
          style={{ backgroundColor: color }} 
        />
        <span className="mr-2 ">{item.label}:</span>
        <span className="font-medium">{item.value} ({percent}%)</span>
      </div>
    );
  });
  
  return (
    <div className={cn("flex flex-col items-center", className)}>      <div className="relative">
        <svg
          ref={svgRef}
          viewBox="-1.1 -1.1 2.2 2.2"
          style={{ transform: "rotate(-90deg)", width: "220px", height: "220px" }}
        >
          {segments.length > 0 ? (
            segments
          ) : (
            // If no data or all zeros, show empty circle
            <circle cx="0" cy="0" r="1" fill="#e5e7eb" />
          )}
          {/* Inner circle to create the donut hole - larger hole for more text space */}
          <circle cx="0" cy="0" r="0.65" fill="white" />
        </svg>
        
        {/* Center label with improved text wrapping */}
        <div className="absolute inset-0 flex items-center justify-center" style={{ transform: "rotate(0deg)" }}>
          <div className="text-center w-[70%]">
            <p className="text-xs font-medium leading-tight line-clamp-2 mb-1">{label}</p>
            {totalValue > 0 && (
              <p className="text-xl font-bold">{totalValue}</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Legend */}
      <div className="mt-4 grid grid-cols-1 gap-1 w-full">
        {legendItems}
      </div>
    </div>
  );
}
