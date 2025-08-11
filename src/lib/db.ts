// src/lib/db.ts
import {
  MongoClient,
  type Db,
  type Collection,
  type Document,
  ObjectId,
} from "mongodb";

const uri = process.env.MONGODB_URI!;
const dbName = process.env.MONGODB_DB || "contractpulse"; // safe default

if (!uri) {
  throw new Error("Missing MONGODB_URI");
}
if (!process.env.MONGODB_DB) {
  console.warn('[db] MONGODB_DB not set; using fallback "contractpulse".');
}

// hot‑reload cache so dev server doesn’t open new connections
type Cache = { client?: MongoClient; db?: Db };
const g = globalThis as unknown as { __mongo?: Cache };
g.__mongo ??= {};
const cache = g.__mongo;

export async function getClient(): Promise<MongoClient> {
  if (cache.client) return cache.client;
  const client = new MongoClient(uri);
  await client.connect();
  cache.client = client;
  return client;
}

export async function getDb(): Promise<Db> {
  if (cache.db) return cache.db;
  const client = await getClient();
  const database = client.db(dbName);
  cache.db = database;
  return database;
}

/**
 * Convenience helper:
 *  - db() -> Db
 *  - db<YourDoc>("collection") -> Collection<YourDoc>
 */
export async function db(): Promise<Db>;
export async function db<T extends Document = Document>(
  name: string
): Promise<Collection<T>>;
export async function db<T extends Document = Document>(
  name?: string
): Promise<Db | Collection<T>> {
  const database = await getDb();
  return name ? database.collection<T>(name) : database;
}

export { ObjectId };