import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import dbConnect from '@/lib/mongoose';
import Itinerary from '@/models/Itinerary';
import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';

// Get all itineraries for the authenticated user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    const itineraries = await Itinerary.find({ userId: session.user.id });

    return NextResponse.json(itineraries);
  } catch (error) {
    console.error('Error fetching itineraries:', error);
    return NextResponse.json(
      { message: 'Error fetching itineraries' },
      { status: 500 }
    );
  }
}

// Create a new itinerary
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, description, startDate, endDate, locations } = body;

    // Validate input
    if (!title || !startDate || !endDate) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Create new itinerary
    const newItinerary = await Itinerary.create({
      userId: session.user.id,
      title,
      description,
      startDate,
      endDate,
      locations: locations || [],
    });

    return NextResponse.json(
      { message: 'Itinerary created successfully', itinerary: newItinerary },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating itinerary:', error);
    return NextResponse.json(
      { message: 'Error creating itinerary' },
      { status: 500 }
    );
  }
} 