// mapLayout.js — a stylized, simplified-geographic US map.
//
// Each region is defined as a set of grid cells [col, row] (col increases east, row
// increases south). A region's SVG outline is computed by tracing the boundary of its
// merged cells, so multi-cell states (Texas, California, Florida) read as larger
// blocky-but-recognizable shapes in roughly correct positions. The geometry never
// changes during play; West Virginia and statehood/territory changes are handled by
// flipping `active`/flags, not by re-cutting paths.

export const CELL = 40;
export const OX = 20;
export const OY = 20;
export const VIEWBOX = '0 0 780 320';

// Grid cells per region id (must match content/regions.js ids).
export const LAYOUT = {
  washington: [[1, 0]],
  oregon: [[1, 1]],
  california: [[1, 2], [1, 3], [2, 3]],
  nevada: [[2, 2]],
  utah: [[3, 2]],
  colorado: [[4, 2]],
  new_mexico: [[3, 3], [4, 3]],
  dakota: [[5, 0], [6, 0]],
  nebraska: [[5, 1], [6, 1]],
  kansas: [[5, 2], [6, 2]],
  indian_territory: [[5, 3], [6, 3]],
  texas: [[4, 4], [5, 4], [6, 4], [5, 5], [6, 5]],
  minnesota: [[7, 0]],
  iowa: [[7, 1]],
  missouri: [[7, 2], [7, 3]],
  arkansas: [[7, 4]],
  louisiana: [[7, 5], [8, 5]],
  wisconsin: [[8, 0]],
  illinois: [[8, 1], [8, 2]],
  mississippi: [[8, 3], [8, 4]],
  michigan: [[9, 0], [10, 0]],
  indiana: [[9, 1]],
  ohio: [[10, 1]],
  kentucky: [[9, 2], [10, 2]],
  tennessee: [[9, 3], [10, 3]],
  alabama: [[9, 4]],
  georgia: [[10, 4], [11, 4]],
  south_carolina: [[12, 4]],
  florida: [[11, 5], [12, 5], [12, 6]],
  north_carolina: [[11, 3], [12, 3], [13, 3]],
  virginia: [[12, 2]],
  west_virginia: [[11, 2]],
  pennsylvania: [[11, 1], [12, 1], [13, 1]],
  maryland: [[13, 2]],
  delaware: [[14, 2]],
  new_jersey: [[14, 1]],
  new_york: [[12, 0], [13, 0], [14, 0]],
  vermont: [[15, 0]],
  new_hampshire: [[16, 0]],
  maine: [[17, 0]],
  massachusetts: [[15, 1], [16, 1]],
  connecticut: [[15, 2]],
  rhode_island: [[16, 2]],
};

export const ABBREV = {
  washington: 'WA', oregon: 'OR', california: 'CA', nevada: 'NV', utah: 'UT',
  colorado: 'CO', new_mexico: 'NM', dakota: 'DAK', nebraska: 'NE', kansas: 'KS',
  indian_territory: 'IND', texas: 'TX', minnesota: 'MN', iowa: 'IA', missouri: 'MO',
  arkansas: 'AR', louisiana: 'LA', wisconsin: 'WI', illinois: 'IL', mississippi: 'MS',
  michigan: 'MI', indiana: 'IN', ohio: 'OH', kentucky: 'KY', tennessee: 'TN',
  alabama: 'AL', georgia: 'GA', south_carolina: 'SC', florida: 'FL',
  north_carolina: 'NC', virginia: 'VA', west_virginia: 'WV', pennsylvania: 'PA',
  maryland: 'MD', delaware: 'DE', new_jersey: 'NJ', new_york: 'NY', vermont: 'VT',
  new_hampshire: 'NH', maine: 'ME', massachusetts: 'MA', connecticut: 'CT',
  rhode_island: 'RI',
};

const key = (x, y) => x + ',' + y;

// Trace the boundary of a set of grid cells into an SVG path string.
export function cellsToPath(cells, s = CELL, ox = OX, oy = OY) {
  const set = new Set(cells.map(([c, r]) => key(c, r)));
  const has = (c, r) => set.has(key(c, r));
  const edges = [];
  for (const [c, r] of cells) {
    if (!has(c, r - 1)) edges.push([[c, r], [c + 1, r]]); // top
    if (!has(c + 1, r)) edges.push([[c + 1, r], [c + 1, r + 1]]); // right
    if (!has(c, r + 1)) edges.push([[c + 1, r + 1], [c, r + 1]]); // bottom
    if (!has(c - 1, r)) edges.push([[c, r + 1], [c, r]]); // left
  }
  const startMap = new Map();
  edges.forEach((e, i) => {
    const k = key(e[0][0], e[0][1]);
    if (!startMap.has(k)) startMap.set(k, []);
    startMap.get(k).push(i);
  });
  const used = new Array(edges.length).fill(false);
  const pt = (p) => `${ox + p[0] * s} ${oy + p[1] * s}`;
  let path = '';
  for (let i = 0; i < edges.length; i++) {
    if (used[i]) continue;
    const startPt = edges[i][0];
    path += `M ${pt(startPt)}`;
    let cur = i;
    while (cur !== -1 && !used[cur]) {
      used[cur] = true;
      const end = edges[cur][1];
      path += ` L ${pt(end)}`;
      if (key(end[0], end[1]) === key(startPt[0], startPt[1])) break;
      const candidates = startMap.get(key(end[0], end[1])) || [];
      cur = candidates.find((ci) => !used[ci]) ?? -1;
    }
    path += ' Z';
  }
  return path;
}

// Centroid of a region's cells, in SVG coordinates (for label placement).
export function cellsCentroid(cells, s = CELL, ox = OX, oy = OY) {
  let sx = 0;
  let sy = 0;
  for (const [c, r] of cells) {
    sx += c + 0.5;
    sy += r + 0.5;
  }
  return { x: ox + (sx / cells.length) * s, y: oy + (sy / cells.length) * s };
}
