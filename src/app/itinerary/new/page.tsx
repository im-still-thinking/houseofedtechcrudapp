'use client';

import LocationForm, { LocationData } from '@/components/LocationForm';
import Navbar from '@/components/Navbar';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function NewItineraryPage() {
  const { status } = useSession();
  const router = useRouter();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [showLocationForm, setShowLocationForm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Redirect if not authenticated
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const handleAddLocation = (location: LocationData) => {
    setLocations([...locations, { ...location, id: Date.now().toString() }]);
    setShowLocationForm(false);
  };

  const handleRemoveLocation = (id: string) => {
    setLocations(locations.filter(location => location.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!title || !startDate || !endDate) {
      setError('Please fill in all required fields');
      return;
    }
    
    if (new Date(startDate) > new Date(endDate)) {
      setError('Start date cannot be after end date');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Format locations for API
      const formattedLocations = locations.map(location => ({
        name: location.name,
        address: location.address,
        coordinates: location.coordinates,
        visitDate: location.visitDate || null,
        notes: location.notes || '',
      }));
      
      // Create new itinerary
      const response = await axios.post('/api/itineraries', {
        title,
        description,
        startDate,
        endDate,
        locations: formattedLocations,
      });
      
      if (response.status === 201) {
        // Redirect to dashboard on success
        router.push('/dashboard');
      }
    } catch (err: Error | unknown) {
      console.error('Error creating itinerary:', err);
      if (typeof err === 'object' && err && 'response' in err) {
        const apiError = err as { response?: { data?: { message?: string } } };
        if (apiError.response?.data?.message) {
          setError(apiError.response.data.message);
        } else {
          setError('An error occurred while creating the itinerary');
        }
      } else {
        setError('An error occurred while creating the itinerary');
      }
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Create New Itinerary
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Plan your next adventure by creating a detailed travel itinerary.
            </p>
          </div>
          
          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-400 px-4 py-3 rounded relative">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <form onSubmit={handleSubmit}>
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
                  placeholder="e.g., Summer Vacation in Europe"
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
                  placeholder="Add a description of your trip..."
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
              
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Locations
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowLocationForm(true)}
                    className="px-3 py-1 text-sm text-indigo-600 bg-indigo-100 rounded-md hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-900 dark:text-indigo-300 dark:hover:bg-indigo-800"
                  >
                    Add Location
                  </button>
                </div>
                
                {locations.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-md">
                    <p className="text-gray-500 dark:text-gray-400">
                      No locations added yet. Click &quot;Add Location&quot; to start building your itinerary.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {locations.map((location) => (
                      <div
                        key={location.id}
                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-700"
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
                                Visit date: {new Date(location.visitDate).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveLocation(location.id!)}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          >
                            Remove
                          </button>
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
              
              <div className="flex justify-end space-x-3 mt-8">
                <button
                  type="button"
                  onClick={() => router.push('/dashboard')}
                  className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating...' : 'Create Itinerary'}
                </button>
              </div>
            </form>
          </div>
          
          {showLocationForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="w-full max-w-2xl">
                <LocationForm
                  onSave={handleAddLocation}
                  onCancel={() => setShowLocationForm(false)}
                />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 