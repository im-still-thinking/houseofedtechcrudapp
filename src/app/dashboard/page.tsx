'use client';

import ItineraryCard from '@/components/ItineraryCard';
import Navbar from '@/components/Navbar';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Itinerary {
  _id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  locations: Array<{
    name: string;
    address: string;
  }>;
  createdAt: string;
}

export default function DashboardPage() {
  const { status } = useSession();
  const router = useRouter();
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Redirect if not authenticated
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchItineraries = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/itineraries');
        setItineraries(response.data);
        setError('');
      } catch (err) {
        console.error('Error fetching itineraries:', err);
        setError('Failed to load your itineraries');
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchItineraries();
    }
  }, [status]);

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
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              My Travel Itineraries
            </h1>
            <Link
              href="/itinerary/new"
              className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Create New Itinerary
            </Link>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <p className="text-gray-500 dark:text-gray-400">Loading your itineraries...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-400 px-4 py-3 rounded relative">
              <span className="block sm:inline">{error}</span>
            </div>
          ) : itineraries.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                No itineraries yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Create your first travel itinerary to get started planning your next adventure.
              </p>
              <Link
                href="/itinerary/new"
                className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Create New Itinerary
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {itineraries.map((itinerary) => (
                <ItineraryCard key={itinerary._id} itinerary={itinerary} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 