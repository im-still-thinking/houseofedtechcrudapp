'use client';

import axios from 'axios';
import { useEffect, useState } from 'react';
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
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [nearbyPlaces, setNearbyPlaces] = useState<any[]>([]);
  const [isLoadingNearby, setIsLoadingNearby] = useState(false);

  // Search for locations using Mapbox Geocoding API
  const searchLocations = async () => {
    if (!searchQuery.trim()) return;
    
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
  };

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
  const handleSelectLocation = (result: any) => {
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
  const handleMapClick = (lngLat: { lng: number; lat: number }) => {
    setLocation({
      ...location,
      coordinates: {
        lat: lngLat.lat,
        lng: lngLat.lng,
      },
    });
  };

  // Handle adding a nearby place to the location
  const handleAddNearbyPlace = (place: any) => {
    setLocation({
      ...location,
      name: place.text,
      address: place.place_name,
      coordinates: {
        lat: place.center[1],
        lng: place.center[0],
      },
    });
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(location);
  };

  return (
    <div className="bg-white rounded-lg shadow-md dark:bg-gray-800 p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
        {initialData ? 'Edit Location' : 'Add New Location'}
      </h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Search for a location
          </label>
          <div className="relative">
            <input
              type="text"
              id="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for a place..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <button
              type="button"
              onClick={searchLocations}
              className="absolute right-2 top-2 px-3 py-1 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700"
            >
              Search
            </button>
          </div>
          
          {/* Search results */}
          {searchResults.length > 0 && (
            <div className="mt-2 bg-white border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600">
              <ul>
                {searchResults.map((result) => (
                  <li
                    key={result.id}
                    className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer border-b border-gray-200 dark:border-gray-600 last:border-b-0"
                    onClick={() => handleSelectLocation(result)}
                  >
                    <p className="font-medium text-gray-800 dark:text-white">{result.text}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{result.place_name}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
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
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Map Location (Click to set location)
          </label>
          <div className="h-64 rounded-md overflow-hidden">
            <MapComponent
              latitude={location.coordinates.lat}
              longitude={location.coordinates.lng}
              zoom={13}
              markers={
                location.name
                  ? [
                      {
                        id: '1',
                        latitude: location.coordinates.lat,
                        longitude: location.coordinates.lng,
                        title: location.name,
                      },
                    ]
                  : []
              }
              onMapClick={handleMapClick}
            />
          </div>
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Coordinates: {location.coordinates.lat.toFixed(6)}, {location.coordinates.lng.toFixed(6)}
          </div>
        </div>
        
        {/* Nearby places */}
        {nearbyPlaces.length > 0 && (
          <div className="mb-6">
            <h3 className="text-md font-medium text-gray-800 dark:text-white mb-2">
              Nearby Places
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {nearbyPlaces.slice(0, 6).map((place) => (
                <div
                  key={place.id}
                  className="p-3 border border-gray-200 rounded-md hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700 cursor-pointer"
                  onClick={() => handleAddNearbyPlace(place)}
                >
                  <p className="font-medium text-gray-800 dark:text-white">{place.text}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {place.place_name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex justify-end space-x-3">
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
  );
} 