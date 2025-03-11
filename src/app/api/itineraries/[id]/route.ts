import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import dbConnect from '@/lib/mongoose';
import Itinerary from '@/models/Itinerary';
import mongoose from 'mongoose';
import { getServerSession } from 'next-auth/next';
import { NextRequest } from 'next/server';
export async function GET(
  req: NextRequest, 
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return Response.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const id = req.nextUrl.pathname.split("/")[5];

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return Response.json(
        { message: 'Invalid itinerary ID' },
        { status: 400 }
      );
    }

    await dbConnect();

    const itinerary = await Itinerary.findById(id);

    if (!itinerary) {
      return Response.json(
        { message: 'Itinerary not found' },
        { status: 404 }
      );
    }

    // Check if the itinerary belongs to the authenticated user
    if (itinerary.userId.toString() !== session.user.id) {
      return Response.json(
        { message: 'Unauthorized' },
        { status: 403 }
      );
    }

    return Response.json(itinerary);
  } catch (error) {
    console.error('Error fetching itinerary:', error);
    return Response.json(
      { message: 'Error fetching itinerary' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return Response.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const id = req.nextUrl.pathname.split("/")[2];
    const body = await req.json();
    const { title, description, startDate, endDate, locations } = body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return Response.json(
        { message: 'Invalid itinerary ID' },
        { status: 400 }
      );
    }

    // Validate input
    if (!title || !startDate || !endDate) {
      return Response.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find the itinerary
    const itinerary = await Itinerary.findById(id);

    if (!itinerary) {
      return Response.json(
        { message: 'Itinerary not found' },
        { status: 404 }
      );
    }

    // Check if the itinerary belongs to the authenticated user
    if (itinerary.userId.toString() !== session.user.id) {
      return Response.json(
        { message: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Update the itinerary
    const updatedItinerary = await Itinerary.findByIdAndUpdate(
      id,
      {
        title,
        description,
        startDate,
        endDate,
        locations: locations || [],
      },
      { new: true }
    );

    return Response.json({
      message: 'Itinerary updated successfully',
      itinerary: updatedItinerary,
    });
  } catch (error) {
    console.error('Error updating itinerary:', error);
    return Response.json(
      { message: 'Error updating itinerary' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return Response.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const id = params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return Response.json(
        { message: 'Invalid itinerary ID' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find the itinerary
    const itinerary = await Itinerary.findById(id);

    if (!itinerary) {
      return Response.json(
        { message: 'Itinerary not found' },
        { status: 404 }
      );
    }

    // Check if the itinerary belongs to the authenticated user
    if (itinerary.userId.toString() !== session.user.id) {
      return Response.json(
        { message: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Delete the itinerary
    await Itinerary.findByIdAndDelete(id);

    return Response.json({
      message: 'Itinerary deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting itinerary:', error);
    return Response.json(
      { message: 'Error deleting itinerary' },
      { status: 500 }
    );
  }
}