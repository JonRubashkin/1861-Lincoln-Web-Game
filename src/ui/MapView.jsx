import { LAYOUT, ABBREV, VIEWBOX, cellsToPath, cellsCentroid } from './mapLayout.js';
import { bandOf, BAND_COLOR, DORMANT_COLOR } from './bands.js';

// Precompute paths/centroids once (geometry never changes during play).
const GEOMETRY = Object.fromEntries(
  Object.entries(LAYOUT).map(([id, cells]) => [
    id,
    { path: cellsToPath(cells), centroid: cellsCentroid(cells) },
  ])
);

export default function MapView({ regions, selectedId, onSelect }) {
  return (
    <div className="map">
      <svg viewBox={VIEWBOX} role="img" aria-label="Map of the United States, 1861">
        {Object.entries(GEOMETRY).map(([id, geo]) => {
          const region = regions[id];
          if (!region) return null;
          const dormant = !region.active;
          const fill = dormant ? DORMANT_COLOR : BAND_COLOR[bandOf(region.control)];
          const isSel = id === selectedId;
          return (
            <path
              key={id}
              d={geo.path}
              className={
                'region' +
                (region.isTerritory ? ' territory' : '') +
                (dormant ? ' dormant' : '') +
                (isSel ? ' selected' : '')
              }
              fill={fill}
              onClick={() => onSelect(id)}
            >
              <title>{`${region.displayName} (${region.control > 0 ? '+' : ''}${region.control})`}</title>
            </path>
          );
        })}
        {Object.entries(GEOMETRY).map(([id, geo]) => {
          const region = regions[id];
          if (!region) return null;
          return (
            <text
              key={id + '-label'}
              x={geo.centroid.x}
              y={geo.centroid.y}
              className="region-label"
              pointerEvents="none"
            >
              {ABBREV[id] || ''}
            </text>
          );
        })}
      </svg>
      <div className="map-legend">
        <span><i style={{ background: BAND_COLOR.union }} /> Union</span>
        <span><i style={{ background: BAND_COLOR.contested }} /> Contested</span>
        <span><i style={{ background: BAND_COLOR.confederate }} /> Confederate</span>
        <span><i style={{ background: DORMANT_COLOR }} /> Dormant</span>
        <span className="legend-note">Territories shown lighter · click a region for details</span>
      </div>
    </div>
  );
}
