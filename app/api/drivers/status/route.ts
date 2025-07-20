import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { verifyToken } from "@/lib/jwt";
import { ObjectId } from "mongodb";

// GET - Obtener conductores conectados
export async function GET(request: NextRequest) {
  try {
    console.log("🚗 Obteniendo conductores conectados...");

    const client = await clientPromise;
    const db = client.db("taxi_app");
    const users = db.collection("users");

    // Buscar conductores que están online (activos en los últimos 5 minutos)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const connectedDrivers = await users
      .find({
        role: "conductor", // Cambiado de "driver" a "conductor"
        isActive: true,
        isOnline: true,
        lastOnlineUpdate: { $gte: fiveMinutesAgo },
      })
      .project({
        _id: 1,
        name: 1,
        email: 1,
        rating: 1,
        vehicleInfo: 1,
        currentLocation: 1,
        lastOnlineUpdate: 1,
      })
      .toArray();

    console.log(
      `✅ Encontrados ${connectedDrivers.length} conductores conectados`
    );

    const formattedDrivers = connectedDrivers.map((driver) => ({
      id: driver._id.toString(),
      name: driver.name,
      email: driver.email,
      isOnline: true,
      rating: driver.rating || 4.5,
      vehicleInfo: driver.vehicleInfo || {
        make: "Toyota",
        model: "Corolla",
        color: "Blanco",
        plate: "TXI-000",
      },
      currentLocation: driver.currentLocation || {
        id: "default-tegucigalpa",
        name: "Tegucigalpa Centro",
        address: "Centro, Tegucigalpa",
        lat: 14.0722,
        lng: -87.2067,
      },
      lastUpdate: driver.lastOnlineUpdate,
    }));

    return NextResponse.json({
      success: true,
      drivers: formattedDrivers,
    });
  } catch (error) {
    console.error("❌ Error obteniendo conductores:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error interno del servidor",
      },
      { status: 500 }
    );
  }
}

// POST - Conectar/Desconectar conductor
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: "Token requerido" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { success: false, message: "Token inválido" },
        { status: 401 }
      );
    }

    const { action, location } = await request.json();

    console.log(
      `🚗 ${action === "connect" ? "Conectando" : "Desconectando"} conductor:`,
      decoded.userId
    );

    const client = await clientPromise;
    const db = client.db("taxi_app");
    const users = db.collection("users");

    if (action === "connect") {
      // Conectar conductor
      await users.updateOne(
        { _id: new ObjectId(decoded.userId) },
        {
          $set: {
            isOnline: true,
            currentLocation: location,
            lastOnlineUpdate: new Date(),
          },
        }
      );

      console.log("✅ Conductor conectado");
      return NextResponse.json({
        success: true,
        message: "Conductor conectado exitosamente",
      });
    } else if (action === "disconnect") {
      // Desconectar conductor
      await users.updateOne(
        { _id: new ObjectId(decoded.userId) },
        {
          $set: {
            isOnline: false,
            lastOnlineUpdate: new Date(),
          },
        }
      );

      console.log("✅ Conductor desconectado");
      return NextResponse.json({
        success: true,
        message: "Conductor desconectado exitosamente",
      });
    }

    return NextResponse.json(
      { success: false, message: "Acción no válida" },
      { status: 400 }
    );
  } catch (error) {
    console.error("❌ Error en operación de conductor:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error interno del servidor",
      },
      { status: 500 }
    );
  }
}
