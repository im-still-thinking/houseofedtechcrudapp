'use client';

import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import MapComponent from './MapComponent';

interface LocationFormProps {
  onSave: (location: LocationData) => void;
  initialData?: LocationData;
  onCancel: () => void;
}

export interface LocationData {
  id?: string;
  name: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  visitDate?: string;
  notes?: string;
}

// Define interfaces for search results and nearby places
interface MapboxFeature {
  id: string;
  place_name: string;
  center: [number, number];
  text: string;
  properties: Record<string, unknown>;
  [key: string]: unknown;
}

interface NearbyPlace {
  id: string;
  text: string;
  place_name?: string;
  address?: string;
  category?: string;
  distance?: number;
  center?: [number, number];
  [key: string]: unknown;
}

export default function LocationForm({
  onSave,
  initialData,
  onCancel,
}: LocationFormProps) {
  const [location, setLocation] = useState<LocationData>(
    initialData || {
      name: '',
      address: '',
      coordinates: {
        lat: 40.7128, // Default to New York
        lng: -74.006,
      },
      visitDate: '',
      notes: '',
    }
  );
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MapboxFeature[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlace[]>([]);
  const [isLoadingNearby, setIsLoadingNearby] = useState(false);
  
  const searchResultsRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Handle clicks outside search results to dismiss them
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchResultsRef.current && 
        !searchResultsRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setSearchResults([]);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Search for locations using Mapbox Geocoding API with debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }
    
    searchDebounceRef.current = setTimeout(async () => {
      try {
        setIsSearching(true);
        const response = await axios.get(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
            searchQuery
          )}.json`,
          {
            params: {
              access_token: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN,
              limit: 5,
            },
          }
        );
        
        setSearchResults(response.data.features);
      } catch (error) {
        console.error('Error searching for locations:', error);
      } finally {
        setIsSearching(false);
      }
    }, 500); // 500ms debounce
    
    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, [searchQuery]);

  // Fetch nearby places when coordinates change
  useEffect(() => {
    const fetchNearbyPlaces = async () => {
      try {
        setIsLoadingNearby(true);
        const { lat, lng } = location.coordinates;
        const response = await axios.get(`/api/places?lat=${lat}&lon=${lng}&type=poi`);
        setNearbyPlaces(response.data.features || []);
      } catch (error) {
        console.error('Error fetching nearby places:', error);
      } finally {
        setIsLoadingNearby(false);
      }
    };

    if (location.coordinates.lat && location.coordinates.lng) {
      fetchNearbyPlaces();
    }
  }, [location.coordinates]);

  // Handle location selection from search results
  const handleSelectLocation = (result: MapboxFeature) => {
    const [lng, lat] = result.center;
    setLocation({
      ...location,
      name: result.text,
      address: result.place_name,
      coordinates: {
        lat,
        lng,
      },
    });
    setSearchResults([]);
    setSearchQuery('');
  };

  // Handle map click to set location
  const handleMapClick = async (lngLat: { lng: number; lat: number }) => {
    try {
      // First update coordinates
      const newLocation = {
        ...location,
        coordinates: {
          lat: lngLat.lat,
          lng: lngLat.lng,
        }
      };
      
      // Then try to get location info from coordinates using reverse geocoding
      const response = await axios.get(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lngLat.lng},${lngLat.lat}.json`,
        {
          params: {
            access_token: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN,
            limit: 1,
          },
        }
      );
      
      if (response.data.features && response.data.features.length > 0) {
        const feature = response.data.features[0];
        newLocation.name = feature.text || 'Selected Location';
        newLocation.address = feature.place_name || `${lngLat.lat.toFixed(6)}, ${lngLat.lng.toFixed(6)}`;
      }
      
      setLocation(newLocation);
    } catch (error) {
      console.error('Error with reverse geocoding:', error);
      // If reverse geocoding fails, just update the coordinates
      setLocation({
        ...location,
        coordinates: {
          lat: lngLat.lat,
          lng: lngLat.lng,
        }
      });
    }
  };

  // Handle adding a nearby place to the location
  const handleAddNearbyPlace = (place: NearbyPlace) => {
    setLocation({
      ...location,
      name: place.text,
      address: place.place_name || place.text,
      coordinates: {
        lng: place.center ? place.center[0] : location.coordinates.lng,
        lat: place.center ? place.center[1] : location.coordinates.lat,
      },
    });
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(location);
  };

  return (
    <div className="bg-white rounded-lg shadow-md dark:bg-gray-800 max-h-[90vh] overflow-hidden flex flex-col">
      {/* Header with close button */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          {initialData ? 'Edit Location' : 'Add New Location'}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {/* Content area with scrolling */}
      <div className="flex-1 overflow-y-auto p-4">
        <form ref={formRef} onSubmit={handleSubmit}>
          {/* Search and basic info section */}
          <div className="mb-4">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Search for a location
            </label>
            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                id="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for a place..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              {isSearching && (
                <div className="absolute right-3 top-2.5">
                  <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              )}
            </div>
            
            {/* Search results in a contained box */}
            {searchResults.length > 0 && (
              <div 
                ref={searchResultsRef}
                className="mt-1 bg-white border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 max-h-60 overflow-y-auto z-10 relative w-full"
              >
                <ul>
                  {searchResults.map((result) => (
                    <li
                      key={result.id}
                      className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer border-b border-gray-200 dark:border-gray-600 last:border-b-0"
                      onClick={() => handleSelectLocation(result)}
                    >
                      <p className="font-medium text-gray-800 dark:text-white">{result.text}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{result.place_name}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          {/* Map section */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Map Location (Click to set location)
            </label>
            <div className="h-48 md:h-64 rounded-md overflow-hidden mb-2">
              <MapComponent
                latitude={location.coordinates.lat}
                longitude={location.coordinates.lng}
                zoom={13}
                markers={
                  [
                    {
                      id: '1',
                      latitude: location.coordinates.lat,
                      longitude: location.coordinates.lng,
                      title: location.name || 'Selected location',
                    },
                  ]
                }
                onMapClick={handleMapClick}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Click anywhere on the map to set the location or search for a place above.
            </p>
          </div>
          
          {/* Location details section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Location Name
              </label>
              <input
                type="text"
                id="name"
                value={location.name}
                onChange={(e) => setLocation({ ...location, name: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            
            <div>
              <label htmlFor="visitDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Visit Date (Optional)
              </label>
              <input
                type="date"
                id="visitDate"
                value={location.visitDate || ''}
                onChange={(e) => setLocation({ ...location, visitDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Address
            </label>
            <input
              type="text"
              id="address"
              value={location.address}
              onChange={(e) => setLocation({ ...location, address: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              value={location.notes || ''}
              onChange={(e) => setLocation({ ...location, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          
          {/* Coordinates display */}
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Coordinates: {location.coordinates.lat.toFixed(6)}, {location.coordinates.lng.toFixed(6)}
            </p>
          </div>
          
          {/* Nearby places */}
          {nearbyPlaces.length > 0 && (
            <div className="mt-4 mb-4">
              <h3 className="text-md font-medium text-gray-800 dark:text-white mb-2">Nearby Places</h3>
              {isLoadingNearby ? (
                <div className="flex items-center justify-center py-4">
                  <svg className="animate-spin h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="ml-2 text-gray-600 dark:text-gray-400">Loading nearby places...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                  {nearbyPlaces.map((place) => (
                    <div
                      key={place.id}
                      className="p-2 border border-gray-200 rounded-md hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700 cursor-pointer"
                      onClick={() => handleAddNearbyPlace(place)}
                    >
                      <p className="font-medium text-gray-800 dark:text-white">{place.text}</p>
                      {place.category && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">{place.category}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Footer with action buttons */}
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {initialData ? 'Update Location' : 'Add Location'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 