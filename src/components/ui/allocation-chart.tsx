'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';

interface AllocationChartProps {
  data: Array<{ name: string; value: number; color: string; label: string }>;
  showLegend?: boolean;
  size?: 'small' | 'medium' | 'large';
  showTooltip?: boolean;
}

export function AllocationChart({
  data,
  showLegend = true,
  size = 'medium',
  showTooltip = true,
}: AllocationChartProps) {
  const radius = size === 'small' ? 40 : size === 'large' ? 80 : 60;
  const innerRadius = size === 'small' ? 25 : size === 'large' ? 40 : 35;

  const COLORS = data.map((item) => item.color);

  const formatValue = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M €`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k €`;
    }
    return `${value.toFixed(0)} €`;
  };

  const renderCustomizedLabel = (entry: any) => {
    const percent = (entry.value / data.reduce((sum, item) => sum + item.value, 0)) * 100;
    return percent >= 5 ? `${percent.toFixed(0)}%` : '';
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">Allocation des actifs</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center">
          <ResponsiveContainer width="100%" height={size === 'large' ? 300 : size === 'medium' ? 250 : 200}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={innerRadius}
                outerRadius={radius}
                fill="#8884d8"
                paddingAngle={2}
                dataKey="value"
                labelLine={false}
                label={renderCustomizedLabel}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="white" strokeWidth={1} />
                ))}
              </Pie>
              {showTooltip && <Tooltip formatter={(value) => formatValue(Number(value))} />}
              {showLegend && (
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  iconType="circle"
                  formatter={(value) => {
                    const item = data.find((d) => d.name === value);
                    return item ? `${value} (${item.value.toFixed(0)} €)` : value;
                  }}
                />
              )}
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
