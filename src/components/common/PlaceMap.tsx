import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { mapStyle, pinElement } from './mapTypes';

/** Bản đồ Goong chỉ xem, ghim tại một điểm (trang chi tiết địa điểm) */
export default function PlaceMap({
  latitude,
  longitude,
  className = 'h-56 w-full',
}: {
  latitude: number;
  longitude: number;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: mapStyle(),
      center: [longitude, latitude],
      zoom: 15,
      scrollZoom: false,
      attributionControl: { compact: true },
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    const pin = pinElement();
    pin.style.cursor = 'default';
    markerRef.current = new maplibregl.Marker({ element: pin, anchor: 'bottom' })
      .setLngLat([longitude, latitude])
      .addTo(map);
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
    // Bản đồ tạo một lần; tọa độ đổi được xử lý ở effect dưới
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    markerRef.current?.setLngLat([longitude, latitude]);
    mapRef.current?.jumpTo({ center: [longitude, latitude] });
  }, [latitude, longitude]);

  return <div ref={containerRef} className={className} />;
}
