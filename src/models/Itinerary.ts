import mongoose, { Schema, models } from 'mongoose';

// Define the Location schema
const locationSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  coordinates: {
    type: {
      lat: Number,
      lng: Number,
    },
    required: true,
  },
  visitDate: {
    type: Date,
    required: false,
  },
  notes: {
    type: String,
    required: false,
  },
  weatherData: {
    type: Object,
    required: false,
  },
  nearbyAttractions: {
    type: Array,
    default: [],
  },
});

// Define the Itinerary schema
const itinerarySchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  locations: {
    type: [locationSchema],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

// Check if the model already exists to prevent overwriting it
const Itinerary = models.Itinerary || mongoose.model('Itinerary', itinerarySchema);

export default Itinerary; 