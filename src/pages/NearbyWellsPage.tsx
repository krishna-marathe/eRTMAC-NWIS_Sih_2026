import { MapPin, ArrowUpDown } from 'lucide-react';
import { useState } from 'react';
import { useWellContext } from '../hooks/useWellContext';
import { SectionHeader } from '../components/ui';
import { WellCard } from '../components/wells/WellCard';

type SortField = 'distance' | 'relevance' | 'depth';

export function NearbyWellsPage() {
  const { nearbyWells } = useWellContext();
  const [sortBy, setSortBy] = useState<SortField>('relevance');

  const sorted = [...nearbyWells].sort((a, b) => {
    switch (sortBy) {
      case 'distance': return a.distanceFromActiveWell - b.distanceFromActiveWell;
      case 'relevance': return b.relevanceScore - a.relevanceScore;
      case 'depth': return b.totalDepth - a.totalDepth;
      default: return 0;
    }
  });

  return (
    <div className="space-y-5 max-w-[1600px] mx-auto">
      <div className="bg-surface-card border border-border-default rounded-xl p-5">
        <div className="flex items-center justify-between">
          <SectionHeader
            title="Nearby & Offset Wells"
            subtitle={`${nearbyWells.length} wells within operational radius`}
            icon={MapPin}
          />
          <div className="flex items-center gap-2">
            <ArrowUpDown size={12} className="text-slate-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortField)}
              className="text-xs bg-navy-800 border border-border-default rounded px-2 py-1 text-white"
            >
              <option value="relevance">Relevance Score</option>
              <option value="distance">Distance</option>
              <option value="depth">Total Depth</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {sorted.map((well) => (
          <WellCard key={well.id} well={well} />
        ))}
      </div>
    </div>
  );
}
