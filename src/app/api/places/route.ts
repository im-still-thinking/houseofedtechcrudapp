import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import axios from 'axios';
import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');
    const type = searchParams.get('type') || 'poi'; // Default to points of interest

    if (!lat || !lon) {
      return NextResponse.json(
        { message: 'Latitude and longitude are required' },
        { status: 400 }
      );
    }

    const mapboxToken = process.env.MAPBOX_ACCESS_TOKEN;
    if (!mapboxToken) {
      return NextResponse.json(
        { message: 'Mapbox API token is not configured' },
        { status: 500 }
      );
    }

    // Use Mapbox Geocoding API to find nearby places
    // Documentation: https://docs.mapbox.com/api/search/geocoding/
    const response = await axios.get(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lon},${lat}.json`,
      {
        params: {
          access_token: mapboxToken,
          types: type,
          limit: 10,
          proximity: `${lon},${lat}`,
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error fetching nearby places:', error);
    return NextResponse.json(
      { message: 'Error fetching nearby places' },
      { status: 500 }
    );
  }
} 