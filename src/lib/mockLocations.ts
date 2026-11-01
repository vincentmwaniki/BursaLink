// SAMPLE DATA ONLY: fictional place names for the prototype.
// Real data (all counties, constituencies and wards) will come from the database later.

export interface StudentLocation {
  county: string;
  constituency: string;
  ward: string;
}

// county -> constituency -> list of wards
export const mockLocations: Record<string, Record<string, string[]>> = {
  'Sample County': {
    'Sample Constituency': ['Sample Ward', 'Second Sample Ward'],
    'Another Constituency': ['Another Ward A', 'Another Ward B'],
  },
  'Other County': {
    'Other Constituency': ['Other Ward A', 'Other Ward B'],
  },
};

export const countyNames = Object.keys(mockLocations);

export const constituencyNames = (county: string): string[] =>
  Object.keys(mockLocations[county] ?? {});

export const wardNames = (county: string, constituency: string): string[] =>
  mockLocations[county]?.[constituency] ?? [];