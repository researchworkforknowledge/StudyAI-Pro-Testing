import React from "react";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, Tooltip } from "recharts";

interface RadarProps {
  weakAreas: {
    physics: number;
    chemistry: number;
    mathematics: number;
    biology: number;
  };
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/90 border border-indigo-500/30 p-3 rounded-lg shadow-xl backdrop-blur-md">
        <p className="text-white font-semibold mb-1">{payload[0].payload.subject}</p>
        <p className="text-indigo-300 text-sm">
          Weakness Level: <span className="text-white font-bold">{payload[0].value}%</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function LiveAcademicRadar({ weakAreas }: RadarProps) {
  // Transform data for Recharts
  const data = [
    { subject: "Physics", A: weakAreas.physics, fullMark: 100 },
    { subject: "Chemistry", A: weakAreas.chemistry, fullMark: 100 },
    { subject: "Mathematics", A: weakAreas.mathematics, fullMark: 100 },
    { subject: "Biology", A: weakAreas.biology, fullMark: 100 },
  ];

  return (
    <div className="w-full h-64 md:h-80 relative flex items-center justify-center">
      {/* Background glow matrix */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-2xl blur-md pointer-events-none" />
      
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="rgba(255,255,255,0.1)" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 600 }} 
          />
          <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
          <Radar 
            name="Weakness Index" 
            dataKey="A" 
            stroke="#818cf8" 
            strokeWidth={3}
            fill="#818cf8" 
            fillOpacity={0.3} 
            isAnimationActive={true}
            animationDuration={1500}
            animationEasing="ease-out"
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
