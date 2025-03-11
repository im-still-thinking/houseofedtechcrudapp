'use client';

import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

interface ItineraryCardProps {
  itinerary: {
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
  };
}

export default function ItineraryCard({ itinerary }: ItineraryCardProps) {
  const startDate = new Date(itinerary.startDate);
  const endDate = new Date(itinerary.endDate);
  const createdAt = new Date(itinerary.createdAt);
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };
  
  const locationCount = itinerary.locations.length;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden dark:bg-gray-800 hover:shadow-lg transition-shadow duration-300">
      <div className="p-5">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
          {itinerary.title}
        </h3>
        
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
          <span className="inline-block bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 px-2 py-1 rounded-md">
            {formatDate(startDate)} - {formatDate(endDate)}
          </span>
          <span className="ml-3">
            {locationCount} {locationCount === 1 ? 'location' : 'locations'}
          </span>
        </div>
        
        {itinerary.description && (
          <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
            {itinerary.description}
          </p>
        )}
        
        {locationCount > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Destinations:
            </p>
            <ul className="text-sm text-gray-600 dark:text-gray-400">
              {itinerary.locations.slice(0, 3).map((location, index) => (
                <li key={index} className="truncate">
                  • {location.name}
                </li>
              ))}
              {locationCount > 3 && (
                <li className="text-indigo-600 dark:text-indigo-400">
                  + {locationCount - 3} more
                </li>
              )}
            </ul>
          </div>
        )}
        
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Created {formatDistanceToNow(createdAt, { addSuffix: true })}
          </span>
          
          <Link
            href={`/itinerary/${itinerary._id}`}
            className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
} 