import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { countyNames, constituencyNames, wardNames } from '../lib/mockLocations';
import type { StudentLocation } from '../lib/mockLocations';

// UI PROTOTYPE: uses fictional sample places from mockLocations.ts.

interface LocationSetupProps {
  onComplete: (location: StudentLocation) => void;
}

export const LocationSetup = ({ onComplete }: LocationSetupProps) => {
  const [county, setCounty] = useState('');
  const [constituency, setConstituency] = useState('');
  const [ward, setWard] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const ready = county !== '' && constituency !== '' && ward !== '' && confirmed;

  const selectClass =
    'w-full p-4 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 disabled:bg-slate-100 disabled:text-slate-400';

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-6"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MapPin className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold">Where do you live?</h1>
          <p className="text-slate-500 text-sm mt-1">
            This decides which county, constituency and ward bursaries you can apply to.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">County</label>
            <select
              className={selectClass}
              value={county}
              onChange={(e) => {
                setCounty(e.target.value);
                setConstituency('');
                setWard('');
              }}
            >
              <option value="">Choose your county</option>
              {countyNames.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Constituency</label>
            <select
              className={selectClass}
              value={constituency}
              disabled={county === ''}
              onChange={(e) => {
                setConstituency(e.target.value);
                setWard('');
              }}
            >
              <option value="">Choose your constituency</option>
              {constituencyNames(county).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Ward</label>
            <select
              className={selectClass}
              value={ward}
              disabled={constituency === ''}
              onChange={(e) => setWard(e.target.value)}
            >
              <option value="">Choose your ward</option>
              {wardNames(county, constituency).map((w) => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="p-4 bg-amber-50 rounded-xl text-amber-900 text-sm">
          You cannot change this later on your own. To change your area, you must
          visit your ward or constituency office, and an administrator must approve it.
        </div>

        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="w-5 h-5 mt-0.5 rounded border-slate-300 text-blue-600"
          />
          <span>I confirm that this is the county, constituency and ward where I live.</span>
        </label>

        <button
          onClick={() => ready && onComplete({ county, constituency, ward })}
          disabled={!ready}
          className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 transition-all"
        >
          Save and continue
        </button>
      </motion.div>
    </div>
  );
};