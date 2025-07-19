const { MongoClient } = require("mongodb");
const bcrypt = require("bcryptjs");

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

async function createDriverUser() {
  try {
    await client.connect();
    console.log("Conectado a MongoDB");

    const db = client.db("taxi_app");
    const users = db.collection("users");

    // Verificar si el usuario conductor ya existe
    const existingDriver = await users.findOne({ email: "conductor@test.com" });
    if (existingDriver) {
      console.log("El usuario conductor ya existe");
      return;
    }

    // Crear usuario conductor
    const hashedPassword = await bcrypt.hash("123456", 12);

    const driverUser = {
      email: "conductor@test.com",
      password: hashedPassword,
      name: "Carlos Rodríguez",
      phone: "+1234567890",
      role: "conductor",
      carModel: "Toyota Corolla 2020",
      carPlates: "ABC123",
      documentUrl: "/uploads/documents/sample-driver-doc.jpg",
      isActive: true,
      createdAt: new Date(),
    };

    const result = await users.insertOne(driverUser);
    console.log("Usuario conductor creado:", result.insertedId);
    console.log("Email: conductor@test.com");
    console.log("Contraseña: 123456");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
  }
}

createDriverUser();
