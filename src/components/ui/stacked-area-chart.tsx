'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface StackedAreaChartProps {
  data: any;
  dataKeys: Array<{ name: string; color: string; label: string }>;
  height?: number;
  showTooltip?: boolean;
  showLegend?: boolean;
}

export function StackedAreaChart({
  data,
  dataKeys,
  height = 300,
  showTooltip = true,
  showLegend = true,
}: StackedAreaChartProps) {
  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M €`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k €`;
    }
    return `${value.toFixed(0)} €`;
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
  };

  return (
    <Card className="overflow-visible">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">Évolution du patrimoine</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              {dataKeys.map((key, index) => (
                <linearGradient key={key.name} id={`gradient-${key.name}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={key.color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={key.color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatDate}
              minTickGap={30}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatCurrency}
              width={60}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
              itemStyle={{ fontSize: 13 }}
              labelStyle={{ fontSize: 13, fontWeight: 'bold', color: '#374151' }}
              formatter={(value) => formatCurrency(Number(value))}
              labelFormatter={(date) => formatDate(String(date))}
            />
            {showLegend && (
              <Legend
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                iconType="line"
                formatter={(value) => {
                  const key = dataKeys.find((k) => k.name === value);
                  return key ? key.label : value;
                }}
              />
            )}
            {dataKeys.map((key) => (
              <Area
                key={key.name}
                type="monotone"
                dataKey={key.name}
                stackId="1"
                stroke={key.color}
                fill={`url(#gradient-${key.name})`}
                strokeWidth={2}
                animationDuration={500}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
