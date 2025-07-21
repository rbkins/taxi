import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { withAuth, AuthenticatedRequest } from "@/lib/middleware";
import { ObjectId } from "mongodb";

// POST - Responder a una solicitud de viaje (aceptar/rechazar)
async function respondToTrip(request: AuthenticatedRequest) {
  try {
    const body = await request.json();
    const { tripId, action } = body; // action: "accept" | "reject"

    if (!tripId || !action || !["accept", "reject"].includes(action)) {
      return NextResponse.json(
        { success: false, message: "Datos inválidos" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("taxi_app");
    const trips = db.collection("trips");
    const notifications = db.collection("trip_notifications");
    const users = db.collection("users");

    // Verificar que el trip existe y el conductor tiene permiso
    const trip = await trips.findOne({
      _id: new ObjectId(tripId),
      driverId: new ObjectId(request.user!.userId),
      status: "pending",
    });

    if (!trip) {
      return NextResponse.json(
        { success: false, message: "Viaje no encontrado o ya procesado" },
        { status: 404 }
      );
    }

    // Obtener información del conductor
    const driverInfo = await users.findOne({
      _id: new ObjectId(request.user!.userId),
    });

    // Actualizar estado del trip
    const newStatus = action === "accept" ? "accepted" : "rejected";
    await trips.updateOne(
      { _id: new ObjectId(tripId) },
      {
        $set: {
          status: newStatus,
          updatedAt: new Date(),
          ...(action === "accept" && { acceptedAt: new Date() }),
          ...(action === "reject" && { rejectedAt: new Date() }),
        },
      }
    );

    // Marcar la notificación original como leída
    await notifications.updateOne(
      {
        tripId: new ObjectId(tripId),
        driverId: new ObjectId(request.user!.userId),
      },
      { $set: { read: true, status: newStatus } }
    );

    // Crear notificación para el pasajero
    const responseNotification = {
      tripId: new ObjectId(tripId),
      passengerId: trip.passengerId,
      driverId: new ObjectId(request.user!.userId),
      type: action === "accept" ? "trip-accepted" : "trip-rejected",
      title: action === "accept" ? "¡Viaje Aceptado!" : "Viaje No Disponible",
      message:
        action === "accept"
          ? `${
              driverInfo?.name || "Tu conductor"
            } ha aceptado tu viaje. Te recogerá pronto.`
          : `Lo sentimos, ${
              driverInfo?.name || "el conductor"
            } no puede tomar tu viaje en este momento.`,
      driverName: driverInfo?.name || "Conductor",
      vehicleInfo: driverInfo?.vehicleInfo || null,
      status: newStatus,
      read: false,
      createdAt: new Date(),
    };

    await notifications.insertOne(responseNotification);

    console.log(`✅ Trip ${action}ed successfully:`, tripId);
    console.log(
      "✅ Response notification created for passenger:",
      trip.passengerId
    );

    return NextResponse.json({
      success: true,
      message: `Viaje ${
        action === "accept" ? "aceptado" : "rechazado"
      } exitosamente`,
      tripId: tripId,
      action: action,
    });
  } catch (error) {
    console.error("❌ Error responding to trip:", error);
    return NextResponse.json(
      { success: false, message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export const POST = withAuth(respondToTrip);
