# Travel Planner Application

An interactive travel itinerary planning application built with Next.js, MongoDB, and NextAuth. This application allows users to create, view, and modify travel itineraries with maps integration and real-time weather data.

## Features

- **User Authentication**: Secure JWT-based authentication with NextAuth
- **Itinerary Management**: Create, read, update, and delete travel itineraries
- **Interactive Maps**: Visualize travel destinations with Mapbox integration
- **Weather Information**: Get real-time weather data for your destinations
- **Nearby Attractions**: Discover points of interest near your planned locations
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Next.js API Routes, Server Actions
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: NextAuth.js with JWT
- **Maps**: Mapbox GL JS
- **Weather**: OpenWeatherMap API

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- MongoDB database (local or Atlas)
- Mapbox API key
- OpenWeatherMap API key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/travel-planner.git
   cd travel-planner
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory with the following variables:
   ```
   # MongoDB Connection
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/travelplanner

   # NextAuth Configuration
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-nextauth-secret-key

   # Mapbox API Key
   NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your-mapbox-access-token
   MAPBOX_ACCESS_TOKEN=your-mapbox-access-token

   # OpenWeatherMap API Key
   OPENWEATHER_API_KEY=your-openweather-api-key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
/src
  /app                 # Next.js App Router
    /api               # API Routes
      /auth            # Authentication API
      /itineraries     # Itinerary CRUD operations
      /weather         # Weather API
      /places          # Places/POI API
    /dashboard         # User dashboard
    /itinerary         # Itinerary pages
    /login             # Login page
    /register          # Registration page
  /components          # Reusable components
  /lib                 # Utility functions and database connection
  /models              # Mongoose models
  /providers           # Context providers
  /types               # TypeScript type definitions
```

## API Routes

- **Authentication**:
  - `POST /api/auth/[...nextauth]` - NextAuth authentication
  - `POST /api/register` - User registration

- **Itineraries**:
  - `GET /api/itineraries` - Get all itineraries for the authenticated user
  - `POST /api/itineraries` - Create a new itinerary
  - `GET /api/itineraries/:id` - Get a specific itinerary
  - `PUT /api/itineraries/:id` - Update an itinerary
  - `DELETE /api/itineraries/:id` - Delete an itinerary

- **External Services**:
  - `GET /api/weather` - Get weather data for a location
  - `GET /api/places` - Get nearby places for a location

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [MongoDB](https://www.mongodb.com/)
- [NextAuth.js](https://next-auth.js.org/)
- [Mapbox](https://www.mapbox.com/)
- [OpenWeatherMap](https://openweathermap.org/)
