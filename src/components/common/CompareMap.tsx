import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { distanceMeters, mapStyle, type MapSpot } from './mapTypes';

function pin(color: string, title: string) {
  const element = document.createElement('span');
  element.className = 'material-symbols-outlined';
  element.textContent = 'location_on';
  element.title = title;
  element.style.cssText = `font-size:40px;color:${color};font-variation-settings:'FILL' 1;filter:drop-shadow(0 2px 2px rgba(0,0,0,.35))`;
  return element;
}

/** Dưới 1 m coi như không dời vị trí */
const SAME_SPOT_METERS = 1;

/**
 * Bản đồ Goong so sánh vị trí: ghim xám = hiện tại, ghim xanh = đề xuất.
 * Hai vị trí trùng nhau thì chỉ hiện một ghim xanh.
 */
export default function CompareMap({
  current,
  proposed,
  currentLabel,
  proposedLabel,
  className = 'h-64 w-full',
}: {
  current: MapSpot;
  proposed: MapSpot;
  currentLabel: string;
  proposedLabel: string;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const moved = distanceMeters(current, proposed) >= SAME_SPOT_METERS;

  useEffect(() => {
    if (!containerRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: mapStyle(),
      center: [proposed.longitude, proposed.latitude],
      zoom: 15,
      scrollZoom: false,
      attributionControl: { compact: true },
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    if (moved) {
      new maplibregl.Marker({ element: pin('#8A979C', currentLabel), anchor: 'bottom' })
        .setLngLat([current.longitude, current.latitude])
        .addTo(map);
      const bounds = new maplibregl.LngLatBounds()
        .extend([current.longitude, current.latitude])
        .extend([proposed.longitude, proposed.latitude]);
      map.fitBounds(bounds, { padding: 60, maxZoom: 16, duration: 0 });
    }
    new maplibregl.Marker({ element: pin('#0F766E', proposedLabel), anchor: 'bottom' })
      .setLngLat([proposed.longitude, proposed.latitude])
      .addTo(map);
    return () => map.remove();
  }, [
    current.latitude,
    current.longitude,
    proposed.latitude,
    proposed.longitude,
    moved,
    currentLabel,
    proposedLabel,
  ]);

  return <div ref={containerRef} className={className} />;
}
