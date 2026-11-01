import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Clock, MapPin, CheckCircle2, Lock } from 'lucide-react';
import type { Bursary, ProviderType } from '../lib/mockBursaries';
import { mockBursaries, canStudentApply } from '../lib/mockBursaries';
import type { StudentLocation } from '../lib/mockLocations';

// UI PROTOTYPE: uses fictional sample data from mockBursaries.ts.

interface DiscoverViewProps {
  appliedIds: string[];
  studentLocation: StudentLocation;
  onApply: (bursary: Bursary) => void;
}

const FILTERS: { label: string; value: 'all' | ProviderType }[] = [
  { label: 'All', value: 'all' },
  { label: 'Constituency', value: 'constituency' },
  { label: 'County', value: 'county' },
  { label: 'Foundation', value: 'foundation' },
  { label: 'Corporate', value: 'corporate' },
  { label: 'University', value: 'university' },
  { label: 'NGO', value: 'ngo' },
];

const daysLeft = (deadline: string) => {
  const end = new Date(deadline + 'T23:59:59');
  return Math.ceil((end.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
};

const formatKes = (n: number) => 'KES ' + n.toLocaleString();

export const DiscoverView = ({ appliedIds, studentLocation, onApply }: DiscoverViewProps) => {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | ProviderType>('all');
  const [onlyMine, setOnlyMine] = useState(true);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return mockBursaries.filter((b) => {
      const matchesFilter = filter === 'all' || b.providerType === filter;
      const matchesArea = !onlyMine || canStudentApply(b, studentLocation);
      const matchesQuery =
        q === '' ||
        b.title.toLowerCase().includes(q) ||
        b.provider.toLowerCase().includes(q) ||
        b.areaName.toLowerCase().includes(q);
      return matchesFilter && matchesArea && matchesQuery;
    });
  }, [query, filter, onlyMine, studentLocation]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold">Discover funding</h2>
        <p className="text-slate-500 text-sm mt-1">
          Bursaries and scholarships from different providers.
        </p>
      </div>

      <div className="p-4 bg-blue-50 rounded-xl text-blue-800 text-sm">
        Your area: <b>{studentLocation.ward}, {studentLocation.constituency}, {studentLocation.county}</b>.
        You can apply to bursaries from your area and to opportunities that are open to everyone.
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, provider or area"
          className="w-full p-4 pl-12 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500"
        />
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap border-2 transition-colors ${
              filter === f.value
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-600 border-slate-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
        <input
          type="checkbox"
          checked={onlyMine}
          onChange={(e) => setOnlyMine(e.target.checked)}
          className="w-5 h-5 rounded border-slate-300 text-blue-600"
        />
        Show only opportunities I can apply to
      </label>

      <p className="text-sm text-slate-500">
        {results.length} {results.length === 1 ? 'opportunity' : 'opportunities'} found
      </p>

      {/* Results */}
      <div className="space-y-4">
        {results.map((b) => {
          const left = daysLeft(b.deadline);
          const closed = left < 0;
          const urgent = left >= 0 && left <= 7;
          const alreadyApplied = appliedIds.includes(b.id);
          const eligible = canStudentApply(b, studentLocation);

          return (
            <div
              key={b.id}
              className="bg-white p-5 rounded-2xl border-2 border-slate-100 space-y-3"
            >
              <div>
                <p className="text-xs text-slate-500">{b.provider}</p>
                <h3 className="text-lg font-bold leading-snug">{b.title}</h3>
              </div>

              <p className="text-sm text-slate-600">{b.description}</p>

              <p className="text-xl font-black text-blue-700">
                {formatKes(b.amountMin)} to {formatKes(b.amountMax)}
              </p>

              <div className="flex flex-wrap gap-2 text-xs font-bold">
                <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {b.areaName}
                </span>
                {b.educationLevels.map((lvl) => (
                  <span key={lvl} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full">
                    {lvl}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-1">
                <span
                  className={`flex items-center gap-1 text-sm font-bold ${
                    closed ? 'text-slate-400' : urgent ? 'text-amber-700' : 'text-slate-600'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  {closed
                    ? 'Closed'
                    : left === 0
                    ? 'Closes today'
                    : left === 1
                    ? '1 day left'
                    : left + ' days left'}
                </span>

                {alreadyApplied ? (
                  <span className="px-4 py-2 bg-green-100 text-green-700 rounded-xl font-bold text-sm flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Applied
                  </span>
                ) : !eligible ? (
                  <span className="px-4 py-2 bg-slate-100 text-slate-500 rounded-xl font-bold text-sm flex items-center gap-1">
                    <Lock className="w-4 h-4" /> Not in your area
                  </span>
                ) : (
                  <button
                    onClick={() => onApply(b)}
                    disabled={closed}
                    className="px-5 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400"
                  >
                    Apply
                  </button>
                )}
              </div>

              {!eligible && !alreadyApplied && (
                <p className="text-xs text-slate-500">
                  This bursary is for {b.areaName}. You are registered in{' '}
                  {studentLocation.ward}, {studentLocation.constituency}, {studentLocation.county}.
                </p>
              )}
            </div>
          );
        })}

        {results.length === 0 && (
          <div className="text-center py-16 text-slate-500">
            No bursaries match your search. Try another word or filter.
          </div>
        )}
      </div>
    </motion.div>
  );
};