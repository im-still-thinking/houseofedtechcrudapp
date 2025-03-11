'use client';

import LocationForm, { LocationData } from '@/components/LocationForm';
import MapComponent from '@/components/MapComponent';
import Navbar from '@/components/Navbar';
import WeatherWidget from '@/components/WeatherWidget';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Location {
  _id: string;
  name: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  visitDate?: string;
  notes?: string;
  weatherData?: any;
  nearbyAttractions?: any[];
}

interface Itinerary {
  _id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  locations: Location[];
  createdAt: string;
}

export default function ItineraryDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [locations, setLocations] = useState<Location[]>([]);
  const [showLocationForm, setShowLocationForm] = useState(false);
  const [editingLocation, setEditingLocation] = useState<LocationData | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  useEffect(() => {
    // Redirect if not authenticated
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchItinerary = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/itineraries/${id}`);
        setItinerary(response.data);
        
        // Set form values
        setTitle(response.data.title);
        setDescription(response.data.description || '');
        setStartDate(new Date(response.data.startDate).toISOString().split('T')[0]);
        setEndDate(new Date(response.data.endDate).toISOString().split('T')[0]);
        setLocations(response.data.locations);
        
        // Set first location as selected by default if available
        if (response.data.locations.length > 0) {
          setSelectedLocation(response.data.locations[0]);
        }
        
        setError('');
      } catch (err) {
        console.error('Error fetching itinerary:', err);
        setError('Failed to load itinerary details');
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated' && id) {
      fetchItinerary();
    }
  }, [id, status]);

  const handleSaveItinerary = async () => {
    try {
      setSaving(true);
      
      // Validate form
      if (!title || !startDate || !endDate) {
        setError('Please fill in all required fields');
        setSaving(false);
        return;
      }
      
      if (new Date(startDate) > new Date(endDate)) {
        setError('Start date cannot be after end date');
        setSaving(false);
        return;
      }
      
      // Update itinerary
      const response = await axios.put(`/api/itineraries/${id}`, {
        title,
        description,
        startDate,
        endDate,
        locations,
      });
      
      if (response.status === 200) {
        setItinerary(response.data.itinerary);
        setEditMode(false);
        setError('');
      }
    } catch (err: any) {
      console.error('Error updating itinerary:', err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('An error occurred while updating the itinerary');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteItinerary = async () => {
    if (!window.confirm('Are you sure you want to delete this itinerary? This action cannot be undone.')) {
      return;
    }
    
    try {
      setSaving(true);
      
      const response = await axios.delete(`/api/itineraries/${id}`);
      
      if (response.status === 200) {
        router.push('/dashboard');
      }
    } catch (err) {
      console.error('Error deleting itinerary:', err);
      setError('Failed to delete itinerary');
    } finally {
      setSaving(false);
    }
  };

  const handleAddLocation = (location: LocationData) => {
    if (editingLocation) {
      // Update existing location
      setLocations(
        locations.map((loc) =>
          loc._id === editingLocation.id
            ? {
                ...loc,
                name: location.name,
                address: location.address,
                coordinates: location.coordinates,
                visitDate: location.visitDate,
                notes: location.notes,
              }
            : loc
        )
      );
      setEditingLocation(null);
    } else {
      // Add new location
      const newLocation: Location = {
        _id: Date.now().toString(), // Temporary ID
        name: location.name,
        address: location.address,
        coordinates: location.coordinates,
        visitDate: location.visitDate,
        notes: location.notes,
      };
      
      setLocations([...locations, newLocation]);
    }
    
    setShowLocationForm(false);
  };

  const handleEditLocation = (location: Location) => {
    setEditingLocation({
      id: location._id,
      name: location.name,
      address: location.address,
      coordinates: location.coordinates,
      visitDate: location.visitDate,
      notes: location.notes,
    });
    setShowLocationForm(true);
  };

  const handleRemoveLocation = (id: string) => {
    setLocations(locations.filter((location) => location._id !== id));
    if (selectedLocation && selectedLocation._id === id) {
      setSelectedLocation(locations.length > 1 ? locations[0] : null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <p className="text-gray-500 dark:text-gray-400">Loading...</p>
        </main>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null; // Will redirect in useEffect
  }

  if (error && !itinerary) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center p-4">
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-400 px-4 py-3 rounded relative max-w-md w-full">
            <p className="font-bold">Error</p>
            <p>{error}</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="mt-4 px-4 py-2 text-sm text-indigo-600 bg-white border border-indigo-600 rounded-md hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Back to Dashboard
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-400 px-4 py-3 rounded relative">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left column - Itinerary details */}
            <div className="lg:w-2/3">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  {editMode ? (
                    /* Edit mode */
                    <div>
                      <div className="mb-6">
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Itinerary Title *
                        </label>
                        <input
                          type="text"
                          id="title"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                      
                      <div className="mb-6">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Description
                        </label>
                        <textarea
                          id="description"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          rows={3}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Start Date *
                          </label>
                          <input
                            type="date"
                            id="startDate"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            End Date *
                          </label>
                          <input
                            type="date"
                            id="endDate"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-end space-x-3">
                        <button
                          type="button"
                          onClick={() => setEditMode(false)}
                          disabled={saving}
                          className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 disabled:opacity-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveItinerary}
                          disabled={saving}
                          className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                          {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* View mode */
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {itinerary?.title}
                          </h1>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {formatDate(itinerary?.startDate || '')} - {formatDate(itinerary?.endDate || '')}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setEditMode(true)}
                            className="px-3 py-1 text-sm text-indigo-600 bg-indigo-100 rounded-md hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-900 dark:text-indigo-300 dark:hover:bg-indigo-800"
                          >
                            Edit
                          </button>
                          <button
                            onClick={handleDeleteItinerary}
                            disabled={saving}
                            className="px-3 py-1 text-sm text-red-600 bg-red-100 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      
                      {itinerary?.description && (
                        <div className="mb-6">
                          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            Description
                          </h2>
                          <p className="text-gray-600 dark:text-gray-300">
                            {itinerary.description}
                          </p>
                        </div>
                      )}
                      
                      <div className="mb-6">
                        <div className="flex justify-between items-center mb-2">
                          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                            Map View
                          </h2>
                        </div>
                        
                        <div className="h-96 rounded-lg overflow-hidden">
                          <MapComponent
                            latitude={selectedLocation?.coordinates.lat || 40.7128}
                            longitude={selectedLocation?.coordinates.lng || -74.006}
                            zoom={12}
                            markers={locations.map((location) => ({
                              id: location._id,
                              latitude: location.coordinates.lat,
                              longitude: location.coordinates.lng,
                              title: location.name,
                            }))}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Locations section */}
              <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                      Locations
                    </h2>
                    {editMode && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingLocation(null);
                          setShowLocationForm(true);
                        }}
                        className="px-3 py-1 text-sm text-indigo-600 bg-indigo-100 rounded-md hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-900 dark:text-indigo-300 dark:hover:bg-indigo-800"
                      >
                        Add Location
                      </button>
                    )}
                  </div>
                  
                  {locations.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-md">
                      <p className="text-gray-500 dark:text-gray-400">
                        No locations added to this itinerary yet.
                        {editMode && ' Click "Add Location" to start building your itinerary.'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {locations.map((location) => (
                        <div
                          key={location._id}
                          className={`p-4 border rounded-md ${
                            selectedLocation?._id === location._id
                              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                              : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700'
                          } cursor-pointer`}
                          onClick={() => setSelectedLocation(location)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-white">
                                {location.name}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {location.address}
                              </p>
                              {location.visitDate && (
                                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                                  Visit date: {formatDate(location.visitDate)}
                                </p>
                              )}
                            </div>
                            {editMode && (
                              <div className="flex space-x-2">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditLocation(location);
                                  }}
                                  className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveLocation(location._id);
                                  }}
                                  className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                >
                                  Remove
                                </button>
                              </div>
                            )}
                          </div>
                          {location.notes && (
                            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                              <p className="font-medium">Notes:</p>
                              <p>{location.notes}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Right column - Weather and details */}
            <div className="lg:w-1/3">
              {selectedLocation && (
                <div className="space-y-6">
                  <WeatherWidget
                    latitude={selectedLocation.coordinates.lat}
                    longitude={selectedLocation.coordinates.lng}
                  />
                  
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                    <div className="p-4 bg-indigo-600 text-white">
                      <h3 className="text-lg font-semibold">Location Details</h3>
                    </div>
                    <div className="p-4">
                      <h4 className="font-medium text-gray-900 dark:text-white text-lg mb-2">
                        {selectedLocation.name}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {selectedLocation.address}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Latitude</p>
                          <p className="text-gray-800 dark:text-white">
                            {selectedLocation.coordinates.lat.toFixed(6)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Longitude</p>
                          <p className="text-gray-800 dark:text-white">
                            {selectedLocation.coordinates.lng.toFixed(6)}
                          </p>
                        </div>
                      </div>
                      
                      {selectedLocation.visitDate && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-500 dark:text-gray-400">Planned Visit</p>
                          <p className="text-gray-800 dark:text-white">
                            {formatDate(selectedLocation.visitDate)}
                          </p>
                        </div>
                      )}
                      
                      {selectedLocation.notes && (
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Notes</p>
                          <p className="text-gray-800 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                            {selectedLocation.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      {showLocationForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-2xl">
            <LocationForm
              onSave={handleAddLocation}
              onCancel={() => {
                setShowLocationForm(false);
                setEditingLocation(null);
              }}
              initialData={editingLocation || undefined}
            />
          </div>
        </div>
      )}
    </div>
  );
} 