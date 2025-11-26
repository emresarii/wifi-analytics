# 📡 Wifi Mesh Analytics Platform

An **homemade-grade** WiFi network monitoring and analytics platform
designed to visualize signal quality, calculate performance scores.

##  Features

###  Multi-Property Management

Track hundreds of houses (Studio, Duplex, Villa, etc.) with their unique
room layouts.

###  Real-time Telemetry

-   RSSI (Signal Strength)
-   Link Speed (Mbps)
-   Latency (Ping)
-   Packet Loss

###  Basic Recommendations (In progress)

Automatically detects coverage issues and suggests actions.\
Example: **"Critical packet loss detected on Upper Floor → Mesh Node
Required"**

###  Performance Scoring (In progress)

Calculates performance scores per room for: - Gaming - Streaming - Video
Calling

###  Event Sourcing

All telemetry, analysis results, and recommendations are stored as
**immutable events** in MongoDB.

##  Tech Stack

### Backend

-   Python 3.11\
-   Django REST Framework (DRF)\
-   MongoDB (Event Store)\
-   Clean Architecture + Event Sourcing

### Frontend

-   React 18 (Vite)\
-   Mantine v7\
-   Tailwind CSS v4\
-   Recharts\
-   React Router Dom

### Infrastructure

-   Docker & Docker Compose

------------------------------------------------------------------------

##  Architecture & Event Flow

Event store based on;

    HouseRegistered
    WifiSignalCaptured
    RoomPerformanceCalculated
    PerformanceRecommendationGenerated



------------------------------------------------------------------------

##  Getting Started

### Prerequisites

-   Docker
-   Docker Compose

### Clone the Repository

``` bash
git clone https://github.com/YOUR_USERNAME/wifi-analytics.git
cd wifi-analytics
```

###  Configure Environment

Create a `.env` file in the project root:

    DEBUG=True
    SECRET_KEY=change-this-in-production
    MONGO_URI=mongodb://db:27017/
    MONGO_DB_NAME=wifi_analytics
    CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

###  Start the Application

``` bash
docker-compose up --build
```

## Data Simulation (Mock Data)

Populate the database with realistic sample data:

``` bash
docker-compose exec web python src/data_generator.py
```

The script generates: - \~30 houses\
- Thousands of WiFi signals\
- Performance calculations\
- AI recommendations

------------------------------------------------------------------------

## API Endpoints

  Method   Endpoint                            Description
  -------- ----------------------------------- -------------------------
  GET      /api/houses/                        List all houses
  GET      /api/houses/{id}/metrics/           Room performance scores
  GET      /api/houses/{id}/recommendations/   AI recommendations
  GET      /api/signals/?limit=100             Paginated signal stream
  POST     /api/ingest/signal/                 Ingest telemetry

------------------------------------------------------------------------
