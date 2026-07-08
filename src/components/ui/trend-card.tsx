'use client';

import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Sparkline } from './sparkline';

interface TrendCardProps {
  title: string;
  value: string;
  subtitle?: string;
  changePercent?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon?: ReactNode;
  className?: string;
  sparklineData?: number[];
  sparklineColor?: string;
  sparklineHeight?: number;
}

export function TrendCard({
  title,
  value,
  subtitle,
  changePercent,
  trend,
  icon,
  className,
  sparklineData,
  sparklineColor = 'currentColor',
  sparklineHeight = 40,
}: TrendCardProps) {
  const getTrendIcon = () => {
    if (changePercent === undefined || trend === 'neutral') {
      return <MinusIcon className="h-4 w-4 text-gray-400" />;
    }
    if (trend === 'up') {
      return <ArrowUpIcon className="h-4 w-4 text-emerald-600" />;
    }
    return <ArrowDownIcon className="h-4 w-4 text-rose-600" />;
  };

  const getTrendColor = () => {
    if (changePercent === undefined || trend === 'neutral') return 'text-gray-400';
    if (trend === 'up') return 'text-emerald-600';
    return 'text-rose-600';
  };

  const getTrendBackgroundColor = () => {
    if (changePercent === undefined || trend === 'neutral') return 'bg-gray-100';
    if (trend === 'up') return 'bg-emerald-50';
    return 'bg-rose-50';
  };

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
        {icon && <div className="text-gray-400">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <div>
            <div className="text-2xl font-bold">{value}</div>
            {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
          </div>
          {changePercent !== undefined && (
            <div className={cn('flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium', getTrendBackgroundColor(), getTrendColor())}>
              {getTrendIcon()}
              <span>{changePercent > 0 ? '+' : ''}{changePercent.toFixed(1)}%</span>
            </div>
          )}
        </div>
        {sparklineData && sparklineData.length > 1 && (
          <div className="mt-4 h-[40px] w-full">
            <Sparkline data={sparklineData} color={sparklineColor} height={sparklineHeight} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
