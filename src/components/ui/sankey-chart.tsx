'use client';

import { ResponsiveSankey } from '@nivo/sankey';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Palette de couleurs pastel pour le Sankey (correspond aux catégories Sheets)
const COLORS = [
  '#fbbf24', // abonnements - yellow
  '#7dd3fc', // banque - sky
  '#86efac', // besoins - emerald
  '#fca5a5', // loyer - rose
  '#c4b5fd', // sorties - violet
  '#6366f1', // indigo
  '#f59e0b', // amber
  '#10b981', // emerald
  '#ec4899', // pink
  '#0ea5e9', // sky
];

interface SankeyNode {
  id: string;
  name: string;
}

interface SankeyLink {
  source: string;
  target: string;
  value: number;
}

interface SankeyChartProps {
  nodes: SankeyNode[];
  links: SankeyLink[];
  height?: number;
}

export function SankeyChart({ nodes, links, height = 300 }: SankeyChartProps) {
  const data = {
    nodes: nodes.map((node, index) => ({
      ...node,
      color: COLORS[index % COLORS.length],
    })),
    links: links.map((link, index) => ({
      ...link,
      color: COLORS[index % COLORS.length],
    })),
  };

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-gray-600">Flux de cashflow</CardTitle>
      </CardHeader>
      <CardContent className="h-[400px]">
        <ResponsiveSankey
          data={data}
          margin={{ top: 20, right: 80, bottom: 20, left: 80 }}
          linkOpacity={0.3}
          animate={true}
          isInteractive={true}
          theme={{
            background: '#f9fafb',
            text: {
              color: '#374151',
              fontSize: 11,
            },
            tooltip: {
              container: {
                background: '#111827',
                color: '#f3f4f6',
              },
            },
          }}
        />
      </CardContent>
    </Card>
  );
}
