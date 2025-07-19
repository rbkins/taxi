import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI as string;
const options = {};

let client;
let clientPromise: Promise<MongoClient>;

if (!process.env.MONGODB_URI) {
  throw new Error("Por favor define la variable MONGODB_URI en .env.local");
}

console.log("🔗 MongoDB URI:", uri);

if (process.env.NODE_ENV === "development") {
  if (!(global as any)._mongoClientPromise) {
    console.log("🆕 Creando nueva conexión MongoDB...");
    client = new MongoClient(uri, options);
    (global as any)._mongoClientPromise = client.connect();
  }
  clientPromise = (global as any)._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Verificar conexión
clientPromise
  .then(() => console.log("✅ Conectado a MongoDB exitosamente"))
  .catch((error) => console.error("❌ Error conectando a MongoDB:", error));

export default clientPromise;
