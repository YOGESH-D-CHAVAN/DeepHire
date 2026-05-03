# DeepHire Server 🚀

This is the backend API for DeepHire, built with Node.js, Express, and MongoDB.

## Tech Stack
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (via Mongoose)
- **Environment:** dotenv
- **Development Tools:** Nodemon

## Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB (local or Atlas)

### Installation
1. Navigate to the server directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   - Create a `.env` file (one has been pre-initialized for you).
   - Update `MONGODB_URI` if necessary.

### Running the Server
- **Development:** `npm run dev` (with auto-reload)
- **Production:** `npm start`

## API Endpoints
- `GET /` - Health check and server status.

## Folder Structure
- `index.js` - Entry point
- `models/` - Mongoose schemas
- `routes/` - Express routes
- `controllers/` - Request handlers
- `middleware/` - Custom middleware
- `config/` - Configuration (db connection, etc.)
