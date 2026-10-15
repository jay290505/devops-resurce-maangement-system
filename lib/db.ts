import mongoose from 'mongoose';

const RAW_URI = process.env.MONGODB_URI || process.env.MONGO_URI || '';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose | null> | null;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

/**
 * Checks if MongoDB is configured with a valid remote/reachable URI.
 */
export function isDbConfigured(): boolean {
  if (!RAW_URI) return false;
  const isProd = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;
  // In production or on Vercel, localhost/127.0.0.1 is not reachable
  if (isProd && (RAW_URI.includes('127.0.0.1') || RAW_URI.includes('localhost'))) {
    return false;
  }
  return true;
}

/**
 * Connects to MongoDB safely.
 * Returns mongoose instance if connected, or null if MongoDB is not configured or unreachable.
 */
async function dbConnect(): Promise<typeof mongoose | null> {
  // If already connected, return cached connection
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  // If not configured, don't attempt to connect to prevent blocking/timeouts
  if (!isDbConfigured()) {
    return null;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      dbName: 'devops-resource-management',
      serverSelectionTimeoutMS: 2500, // Quick timeout to prevent Vercel serverless freezing
      connectTimeoutMS: 2500,
    };

    cached.promise = mongoose
      .connect(RAW_URI, opts)
      .then((mongooseInstance) => {
        return mongooseInstance;
      })
      .catch((err) => {
        console.warn('MongoDB connection unavailable. Operating in fallback mock mode:', err.message);
        cached.promise = null;
        return null;
      });
  }

  try {
    cached.conn = await cached.promise;
    if (cached.conn) {
      import('@/lib/seed')
        .then((m) => m.ensureDatabaseSeeded())
        .catch(() => {});
    }
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    cached.conn = null;
    return null;
  }
}

export default dbConnect;
