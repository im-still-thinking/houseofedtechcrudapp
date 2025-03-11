'use client';

import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useEffect, useRef, useState } from 'react';

interface MapComponentProps {
  latitude: number;
  longitude: number;
  zoom?: number;
  markers?: Array<{
    id: string;
    latitude: number;
    longitude: number;
    title: string;
  }>;
  onMapClick?: (lngLat: { lng: number; lat: number }) => void;
}

export default function MapComponent({
  latitude,
  longitude,
  zoom = 12,
  markers = [],
  onMapClick,
}: MapComponentProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  
  useEffect(() => {
    if (!mapContainer.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [longitude, latitude],
      zoom: zoom,
    });

    map.current.on('load', () => {
      setMapLoaded(true);
      
    });

    if (onMapClick) {
      map.current.on('click', (e) => {
        onMapClick(e.lngLat);
      });
    }

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [latitude, longitude, zoom, onMapClick]);

  useEffect(() => {
    if (!mapLoaded || !map.current) return;

    const existingMarkers = document.querySelectorAll('.mapboxgl-marker');
    existingMarkers.forEach((marker) => marker.remove());

    markers.forEach((marker) => {
      const markerElement = document.createElement('div');
      markerElement.className = 'marker';
      markerElement.style.width = '24px';
      markerElement.style.height = '24px';
      markerElement.style.backgroundImage = 'url(/marker-icon.png)';
      markerElement.style.backgroundSize = 'cover';

      const popup = new mapboxgl.Popup({ offset: 25 }).setText(marker.title);

      new mapboxgl.Marker(markerElement)
        .setLngLat([marker.longitude, marker.latitude])
        .setPopup(popup)
        .addTo(map.current as mapboxgl.Map);
    });
  }, [mapLoaded, markers]);

  return (
    <div
      ref={mapContainer}
      className="w-full h-full min-h-[400px] rounded-lg overflow-hidden"
    />
  );
} 