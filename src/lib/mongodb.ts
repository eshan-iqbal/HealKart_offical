// src/lib/mongodb.ts
import { MongoClient, Db } from 'mongodb';

// Validate environment variable
if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local');
}

const uri = process.env.MONGODB_URI;
const options = {
  retryWrites: true,
  w: 'majority',
  maxPoolSize: 10,
  minPoolSize: 5,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 5000,
  family: 4, // Force IPv4
} as const;

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// --- Environment Variable Validation ---
if (!uri || uri === 'YOUR_MONGODB_CONNECTION_STRING_HERE') {
  console.error('!!! MongoDB Configuration Error !!!');
  console.error('MONGODB_URI environment variable is missing, empty, or still set to the placeholder value.');
  console.error('Please ensure MONGODB_URI is correctly set in your .env file.');
  console.error('Example: MONGODB_URI="mongodb+srv://<username>:<password>@<cluster-url>/<database-name>?retryWrites=true&w=majority"');
  throw new Error('MONGODB_URI is not configured. Check server logs for details.');
}
// --- End Validation ---

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    console.log('[MongoDB] Creating new connection promise (Development HMR)');
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect()
      .then(c => {
        console.log('[MongoDB] Development connection successful (HMR cache).');
        return c;
      })
      .catch(err => {
        console.error('[MongoDB] Development connection failed:', err);
        throw err;
      });
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  console.log('[MongoDB] Creating new connection promise (Production)');
  client = new MongoClient(uri, options);
  clientPromise = client.connect()
    .then(c => {
      console.log('[MongoDB] Production connection successful.');
      return c;
    })
    .catch(err => {
      console.error('[MongoDB] Production connection failed:', err);
      throw err;
    });
}

/**
 * Connects to the MongoDB database and returns the client and database instances.
 * Handles potential connection errors.
 * @returns A promise that resolves to an object containing the MongoClient and Db instances.
 * @throws Error if the database connection fails.
 */
export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  try {
    console.log('[connectToDatabase] Awaiting client promise resolution...');
    const resolvedClient = await clientPromise; // Await the promise to ensure connection is established
    const resolvedDb = resolvedClient.db('healkart');
    console.log(`[connectToDatabase] Connection resolved. Using database: ${resolvedDb.databaseName}`);
    return { client: resolvedClient, db: resolvedDb };
  } catch (error: any) {
     // This catch block might be redundant if the initial connect() promise throws,
     // but it provides an extra layer of safety.
     console.error('[connectToDatabase] Error retrieving database connection:', error);
     throw new Error(`Failed to connect to database: ${error.message || String(error)}`);
  }
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;
