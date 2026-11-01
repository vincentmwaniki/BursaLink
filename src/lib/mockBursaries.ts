// SAMPLE DATA ONLY: all names, amounts and dates below are fictional.
// This will be replaced by real data from the database later.

import type { StudentLocation } from './mockLocations';

export type ProviderType =
  | 'constituency'
  | 'county'
  | 'foundation'
  | 'corporate'
  | 'university'
  | 'ngo';

export type AreaLevel = 'ward' | 'constituency' | 'county' | 'national';

export interface Bursary {
  id: string;
  title: string;
  provider: string;
  providerType: ProviderType;
  areaLevel: AreaLevel;
  areaName: string; // text shown to the student
  county?: string;
  constituency?: string;
  ward?: string;
  amountMin: number;
  amountMax: number;
  educationLevels: string[];
  deadline: string; // format: YYYY-MM-DD
  description: string;
}

// A bursary that belongs to a place (ward, constituency or county).
export const isLocationBased = (b: Bursary) => b.areaLevel !== 'national';

// The rule: a student can only apply to location-based bursaries from
// their own registered county, constituency and ward.
// Opportunities with no location are open to all students.
export const canStudentApply = (b: Bursary, loc: StudentLocation | null): boolean => {
  if (b.areaLevel === 'national') return true;
  if (!loc) return false;
  if (b.areaLevel === 'county') return b.county === loc.county;
  if (b.areaLevel === 'constituency') {
    return b.county === loc.county && b.constituency === loc.constituency;
  }
  return (
    b.county === loc.county &&
    b.constituency === loc.constituency &&
    b.ward === loc.ward
  );
};

export const mockBursaries: Bursary[] = [
  {
    id: 'b1',
    title: 'Sample Constituency Bursary 2026',
    provider: 'Sample Constituency Bursary Office',
    providerType: 'constituency',
    areaLevel: 'constituency',
    areaName: 'Sample Constituency, Sample County',
    county: 'Sample County',
    constituency: 'Sample Constituency',
    amountMin: 10000,
    amountMax: 25000,
    educationLevels: ['Secondary', 'College', 'University'],
    deadline: '2026-11-20',
    description: 'Support with school fees for needy students from the constituency.',
  },
  {
    id: 'b2',
    title: 'Sample County Education Fund',
    provider: 'Sample County Government',
    providerType: 'county',
    areaLevel: 'county',
    areaName: 'Sample County',
    county: 'Sample County',
    amountMin: 15000,
    amountMax: 40000,
    educationLevels: ['Secondary', 'College', 'University'],
    deadline: '2026-12-05',
    description: 'County-wide education support for students from vulnerable households.',
  },
  {
    id: 'b3',
    title: 'Sample Ward Bursary',
    provider: 'Sample Ward Development Committee',
    providerType: 'constituency',
    areaLevel: 'ward',
    areaName: 'Sample Ward, Sample Constituency',
    county: 'Sample County',
    constituency: 'Sample Constituency',
    ward: 'Sample Ward',
    amountMin: 5000,
    amountMax: 12000,
    educationLevels: ['Secondary'],
    deadline: '2026-11-15',
    description: 'Small ward-level support for day and boarding secondary students.',
  },
  {
    id: 'b4',
    title: 'Another Constituency Bursary 2026',
    provider: 'Another Constituency Bursary Office',
    providerType: 'constituency',
    areaLevel: 'constituency',
    areaName: 'Another Constituency, Sample County',
    county: 'Sample County',
    constituency: 'Another Constituency',
    amountMin: 10000,
    amountMax: 22000,
    educationLevels: ['Secondary', 'College'],
    deadline: '2026-11-28',
    description: 'Fee support for students from this constituency.',
  },
  {
    id: 'b5',
    title: 'Other County Education Fund',
    provider: 'Other County Government',
    providerType: 'county',
    areaLevel: 'county',
    areaName: 'Other County',
    county: 'Other County',
    amountMin: 12000,
    amountMax: 35000,
    educationLevels: ['Secondary', 'College', 'University'],
    deadline: '2026-12-10',
    description: 'Education support for students from Other County.',
  },
  {
    id: 'b6',
    title: 'Example Foundation Merit Scholarship',
    provider: 'Example Education Foundation',
    providerType: 'foundation',
    areaLevel: 'national',
    areaName: 'All Kenya',
    amountMin: 50000,
    amountMax: 120000,
    educationLevels: ['University'],
    deadline: '2026-12-20',
    description: 'For high-performing university students who need financial support.',
  },
  {
    id: 'b7',
    title: 'Sample Corporate STEM Scholarship',
    provider: 'Sample Company Ltd',
    providerType: 'corporate',
    areaLevel: 'national',
    areaName: 'All Kenya',
    amountMin: 80000,
    amountMax: 150000,
    educationLevels: ['University', 'College'],
    deadline: '2027-01-10',
    description: 'Sponsorship for students in science, technology, engineering and maths.',
  },
  {
    id: 'b8',
    title: 'Sample University Hardship Award',
    provider: 'Sample University',
    providerType: 'university',
    areaLevel: 'national',
    areaName: 'Sample University students',
    amountMin: 20000,
    amountMax: 60000,
    educationLevels: ['University'],
    deadline: '2026-11-30',
    description: 'For enrolled students facing sudden financial hardship.',
  },
  {
    id: 'b9',
    title: 'Example NGO Girls Education Support',
    provider: 'Example NGO',
    providerType: 'ngo',
    areaLevel: 'national',
    areaName: 'All Kenya',
    amountMin: 10000,
    amountMax: 30000,
    educationLevels: ['Secondary'],
    deadline: '2026-12-12',
    description: 'Helps girls stay in school through fees and learning materials.',
  },
  {
    id: 'b10',
    title: 'Example Foundation TVET Skills Grant',
    provider: 'Example Skills Trust',
    providerType: 'foundation',
    areaLevel: 'national',
    areaName: 'All Kenya',
    amountMin: 15000,
    amountMax: 45000,
    educationLevels: ['College'],
    deadline: '2027-01-25',
    description: 'Fee support for technical and vocational training students.',
  },
];