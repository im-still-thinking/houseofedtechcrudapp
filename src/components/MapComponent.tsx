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
  const markerRefs = useRef<mapboxgl.Marker[]>([]);
  
  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    // Clear any existing markers
    markerRefs.current.forEach(marker => marker.remove());
    markerRefs.current = [];

    // Set Mapbox access token
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

    // Create new map instance
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [longitude, latitude],
      zoom: zoom,
      interactive: true, // Ensure the map is interactive
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Set up map load event
    map.current.on('load', () => {
      setMapLoaded(true);
      
      // Add click handler if provided
      if (onMapClick) {
        map.current?.on('click', (e) => {
          onMapClick(e.lngLat);
        });
      }
    });

    // Clean up on unmount
    return () => {
      markerRefs.current.forEach(marker => marker.remove());
      if (map.current) {
        map.current.remove();
      }
    };
  }, [latitude, longitude, zoom, onMapClick]);

  // Update markers when they change
  useEffect(() => {
    if (!mapLoaded || !map.current) return;

    // Remove existing markers
    markerRefs.current.forEach(marker => marker.remove());
    markerRefs.current = [];

    // Add new markers
    markers.forEach((marker) => {
      // Create custom marker element
      const markerElement = document.createElement('div');
      markerElement.className = 'custom-marker';
      markerElement.style.width = '30px';
      markerElement.style.height = '30px';
      markerElement.style.backgroundImage = 'url(/marker-icon.png)';
      markerElement.style.backgroundSize = 'contain';
      markerElement.style.backgroundRepeat = 'no-repeat';
      markerElement.style.cursor = 'pointer';

      // Create popup
      const popup = new mapboxgl.Popup({ offset: 25 })
        .setHTML(`<strong>${marker.title}</strong>`);

      // Create and add marker
      const mapMarker = new mapboxgl.Marker(markerElement)
        .setLngLat([marker.longitude, marker.latitude])
        .setPopup(popup)
        .addTo(map.current as mapboxgl.Map);
      
      // Store reference to marker
      markerRefs.current.push(mapMarker);
    });
  }, [mapLoaded, markers]);

  // Update map center when coordinates change
  useEffect(() => {
    if (map.current && mapLoaded) {
      map.current.flyTo({
        center: [longitude, latitude],
        essential: true,
        duration: 1000
      });
    }
  }, [latitude, longitude, mapLoaded]);

  return (
    <div
      ref={mapContainer}
      className="w-full h-full min-h-[300px] rounded-lg overflow-hidden relative"
    >
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      )}
    </div>
  );
} 