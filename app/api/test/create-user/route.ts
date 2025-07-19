import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { hashPassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    console.log("🧪 Creando usuario de prueba...");

    const client = await clientPromise;
    const db = client.db("taxi_app");
    const users = db.collection("users");

    // Verificar si ya existe
    const existingUser = await users.findOne({ email: "test@test.com" });
    if (existingUser) {
      console.log("✅ Usuario de prueba ya existe");
      return NextResponse.json({
        success: true,
        message: "Usuario de prueba ya existe",
        user: {
          email: "test@test.com",
          password: "123456",
        },
      });
    }

    // Crear usuario de prueba
    const hashedPassword = await hashPassword("123456");

    const testUser = {
      email: "test@test.com",
      password: hashedPassword,
      name: "Usuario de Prueba",
      phone: "+1234567890",
      role: "passenger",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      emergencyContact: {
        name: "Contacto de Emergencia",
        phone: "+0987654321",
      },
    };

    const result = await users.insertOne(testUser);

    console.log("✅ Usuario de prueba creado:", result.insertedId);

    return NextResponse.json({
      success: true,
      message: "Usuario de prueba creado exitosamente",
      user: {
        email: "test@test.com",
        password: "123456",
        id: result.insertedId,
      },
    });
  } catch (error) {
    console.error("❌ Error creando usuario de prueba:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error: " + (error as Error).message,
      },
      { status: 500 }
    );
  }
}
