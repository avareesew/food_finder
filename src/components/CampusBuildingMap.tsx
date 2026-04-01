'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { BYU_BUILDINGS, buildingAbbreviation } from '@/data/byuBuildings';
import { useHtmlDarkClass } from '@/hooks/useHtmlDarkClass';

export type BuildingPinStats = {
  total: number;
  today: number;
  week: number;
  undated: number;
};

type Props = {
  pinStats: Record<string, BuildingPinStats>;
  selectedId: string | null;
  onSelectBuilding: (id: string) => void;
};

function makeBuildingPinIcon(abbr: string, total: number, selected: boolean, darkMap: boolean) {
  const bg = selected ? '#FF5A1F' : total > 0 ? '#ea580c' : '#64748b';
  const ring = darkMap ? '#1e293b' : '#fff';
  const h = selected ? 48 : 42;
  const len = abbr.length;
  const fontSize = len <= 3 ? 12 : len <= 5 ? 10.5 : 9;
  const w = Math.max(h, Math.min(76, Math.round(16 + len * (fontSize * 0.65))));
  const html = `<div style="box-sizing:border-box;width:${w}px;height:${h}px;background:${bg};border:3px solid ${ring};border-radius:999px;display:flex;align-items:center;justify-content:center;font-family:system-ui,-apple-system,sans-serif;font-size:${fontSize}px;font-weight:800;color:#fff;box-shadow:0 4px 14px rgba(0,0,0,0.35);letter-spacing:0.03em;line-height:1;">${abbr}</div>`;
  return L.divIcon({
    className: 'byu-building-pin',
    html,
    iconSize: [w, h],
    iconAnchor: [w / 2, h / 2],
  });
}

const TILE_LIGHT = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
const TILE_DARK = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

export default function CampusBuildingMap({ pinStats, selectedId, onSelectBuilding }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const didFitRef = useRef(false);
  const isDark = useHtmlDarkClass();

  useEffect(() => {
    const el = containerRef.current;
    if (!el || mapRef.current) return;

    const map = L.map(el, {
      center: [40.2495, -111.6485],
      zoom: 15,
      zoomControl: false,
      attributionControl: true,
      scrollWheelZoom: false,
      dragging: false,
      touchZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
    });

    const layer = L.layerGroup().addTo(map);
    layerRef.current = layer;
    mapRef.current = map;

    const t = window.setTimeout(() => map.invalidateSize(), 150);

    return () => {
      window.clearTimeout(t);
      layer.clearLayers();
      map.eachLayer((l) => {
        map.removeLayer(l);
      });
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
      didFitRef.current = false;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    map.eachLayer((l) => {
      if (l instanceof L.TileLayer) {
        map.removeLayer(l);
      }
    });

    const url = isDark ? TILE_DARK : TILE_LIGHT;
    L.tileLayer(url, {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      maxZoom: 19,
    }).addTo(map);

    map.invalidateSize();
  }, [isDark]);

  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    const latLngs: L.LatLngTuple[] = [];
    for (const b of BYU_BUILDINGS) {
      latLngs.push([b.lat, b.lng]);
      const s = pinStats[b.id] ?? { total: 0, today: 0, week: 0, undated: 0 };
      const abbr = buildingAbbreviation(b);
      const icon = makeBuildingPinIcon(abbr, s.total, selectedId === b.id, isDark);
      const countHint =
        s.total > 0
          ? `${s.total} flyer${s.total === 1 ? '' : 's'}`
          : 'No flyers matched yet';
      const marker = L.marker([b.lat, b.lng], { icon })
        .bindTooltip(`${b.name} (${abbr}) · ${countHint}`, { direction: 'top', offset: [0, -22] })
        .on('click', () => {
          onSelectBuilding(b.id);
        });
      layer.addLayer(marker);
    }

    if (!didFitRef.current && latLngs.length > 0) {
      map.fitBounds(L.latLngBounds(latLngs), { padding: [14, 14], maxZoom: 17 });
      didFitRef.current = true;
    }

    map.invalidateSize();
  }, [pinStats, selectedId, onSelectBuilding, isDark]);

  return (
    <div className="mx-auto w-full max-w-[min(100%,440px)]">
      <div
        ref={containerRef}
        className="relative z-0 aspect-square w-full overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-gray-900"
      />
    </div>
  );
}
