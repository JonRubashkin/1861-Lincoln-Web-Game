// regions.js — full region definitions and starting control values.
//
// control: -100 (fully Confederate) .. +100 (fully Union). Display tiers are derived
// from control bands at render time (see ui/MapView.jsx), never stored.
//
//   control >  33  -> Union-controlled
//   -33 .. 33      -> contested
//   control < -33  -> Confederate-controlled
//
// `active: false` regions are dormant (e.g. West Virginia before 1863). Territories
// (`isTerritory: true`) render with a distinct, lighter style.

const DEFS = [
  // New England + core North (+85..+100)
  { id: 'maine', displayName: 'Maine', control: 95 },
  { id: 'new_hampshire', displayName: 'New Hampshire', control: 92 },
  { id: 'vermont', displayName: 'Vermont', control: 90 },
  { id: 'massachusetts', displayName: 'Massachusetts', control: 98 },
  { id: 'rhode_island', displayName: 'Rhode Island', control: 88 },
  { id: 'connecticut', displayName: 'Connecticut', control: 90 },
  { id: 'new_york', displayName: 'New York', control: 95 },
  { id: 'new_jersey', displayName: 'New Jersey', control: 85 },
  { id: 'pennsylvania', displayName: 'Pennsylvania', control: 90 },
  { id: 'ohio', displayName: 'Ohio', control: 88 },
  { id: 'indiana', displayName: 'Indiana', control: 85 },
  { id: 'illinois', displayName: 'Illinois', control: 95 },
  { id: 'michigan', displayName: 'Michigan', control: 88 },
  { id: 'wisconsin', displayName: 'Wisconsin', control: 88 },
  { id: 'iowa', displayName: 'Iowa', control: 85 },
  { id: 'minnesota', displayName: 'Minnesota', control: 85 },

  // Pacific
  { id: 'california', displayName: 'California', control: 70 },
  { id: 'oregon', displayName: 'Oregon', control: 70 },

  // Plains
  { id: 'kansas', displayName: 'Kansas', control: 60 },

  // Border / contested
  { id: 'delaware', displayName: 'Delaware', control: 50 },
  { id: 'maryland', displayName: 'Maryland', control: 15 },
  { id: 'kentucky', displayName: 'Kentucky', control: 5 },
  { id: 'missouri', displayName: 'Missouri', control: -5 },

  // Confederate core
  { id: 'south_carolina', displayName: 'South Carolina', control: -95 },
  { id: 'alabama', displayName: 'Alabama', control: -85 },
  { id: 'mississippi', displayName: 'Mississippi', control: -85 },
  { id: 'georgia', displayName: 'Georgia', control: -80 },
  { id: 'texas', displayName: 'Texas', control: -80 },
  { id: 'louisiana', displayName: 'Louisiana', control: -75 },
  { id: 'virginia', displayName: 'Virginia', control: -70 },
  { id: 'florida', displayName: 'Florida', control: -70 },
  { id: 'north_carolina', displayName: 'North Carolina', control: -65 },
  { id: 'arkansas', displayName: 'Arkansas', control: -60 },
  { id: 'tennessee', displayName: 'Tennessee', control: -55 },

  // West Virginia — dormant until it splits from Virginia in 1863.
  { id: 'west_virginia', displayName: 'West Virginia', control: 0, active: false },

  // Territories (+ Indian Territory leaning Confederate)
  { id: 'dakota', displayName: 'Dakota Terr.', control: 40, isTerritory: true },
  { id: 'nebraska', displayName: 'Nebraska Terr.', control: 45, isTerritory: true },
  { id: 'colorado', displayName: 'Colorado Terr.', control: 40, isTerritory: true },
  { id: 'nevada', displayName: 'Nevada Terr.', control: 45, isTerritory: true },
  { id: 'utah', displayName: 'Utah Terr.', control: 35, isTerritory: true },
  { id: 'washington', displayName: 'Washington Terr.', control: 50, isTerritory: true },
  { id: 'new_mexico', displayName: 'New Mexico Terr.', control: 10, isTerritory: true },
  { id: 'indian_territory', displayName: 'Indian Terr.', control: -20, isTerritory: true },
];

// Build a fresh { [id]: region } map with all defaults filled in.
export function createRegions() {
  const out = {};
  for (const d of DEFS) {
    out[d.id] = {
      id: d.id,
      displayName: d.displayName,
      control: d.control,
      active: d.active !== false,
      isTerritory: d.isTerritory === true,
    };
  }
  return out;
}

export const REGION_IDS = new Set(DEFS.map((d) => d.id));
