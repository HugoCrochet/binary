'use client';

import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface SparklineProps {
  data: number[];
  color?: string;
  height?: number;
  showDot?: boolean;
}

export function Sparkline({ data, color = 'currentColor', height = 40, showDot = false }: SparklineProps) {
  if (data.length < 2) return null;

  // Normalize data to 0-100 range
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const normalizedData = data.map((value, index) => ({
    index,
    value: ((value - min) / range) * 100,
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={normalizedData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          dot={showDot ? { r: 3 } : false}
          activeDot={{ r: 4 }}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
