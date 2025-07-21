import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { withAuth, AuthenticatedRequest } from "@/lib/middleware";
import { ObjectId } from "mongodb";

// POST - Crear nueva solicitud de viaje
async function createTrip(request: AuthenticatedRequest) {
  try {
    const body = await request.json();
    const {
      driverId,
      origin,
      destination,
      proposedFare,
      distance,
      estimatedTime,
    } = body;

    if (!driverId || !origin || !destination || !proposedFare) {
      return NextResponse.json(
        { success: false, message: "Todos los campos son obligatorios" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("taxi_app");
    const trips = db.collection("trips");
    const notifications = db.collection("trip_notifications");

    // Crear el viaje
    const tripData = {
      passengerId: new ObjectId(request.user!.userId),
      driverId: new ObjectId(driverId),
      origin: {
        address: origin.address || origin.name,
        lat: origin.lat,
        lng: origin.lng,
      },
      destination: {
        address: destination.address || destination.name,
        lat: destination.lat,
        lng: destination.lng,
      },
      proposedFare: parseFloat(proposedFare),
      distance: distance || 0,
      estimatedTime: estimatedTime || 0,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const tripResult = await trips.insertOne(tripData);
    const tripId = tripResult.insertedId;

    // Obtener información del usuario
    const users = db.collection("users");
    const passengerInfo = await users.findOne({
      _id: new ObjectId(request.user!.userId),
    });

    // Crear notificación para el conductor
    const notificationData = {
      tripId: tripId,
      driverId: new ObjectId(driverId),
      passengerId: new ObjectId(request.user!.userId),
      type: "trip-request",
      title: "Nueva Solicitud de Viaje",
      message: `Solicitud desde ${origin.address || origin.name} hasta ${
        destination.address || destination.name
      }`,
      origin: tripData.origin,
      destination: tripData.destination,
      currentOffer: parseFloat(proposedFare),
      distance: distance || 0,
      estimatedTime: estimatedTime || 0,
      clientName: passengerInfo?.name || "Cliente",
      status: "pending",
      read: false,
      createdAt: new Date(),
    };

    await notifications.insertOne(notificationData);

    console.log("✅ Trip created successfully:", tripId);
    console.log("✅ Notification created for driver:", driverId);

    return NextResponse.json({
      success: true,
      message: "Solicitud de viaje enviada exitosamente",
      tripId: tripId.toString(),
    });
  } catch (error) {
    console.error("❌ Error creating trip:", error);
    return NextResponse.json(
      { success: false, message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// GET - Obtener notificaciones de trips para conductores
async function getTripNotifications(request: AuthenticatedRequest) {
  try {
    const client = await clientPromise;
    const db = client.db("taxi_app");
    const notifications = db.collection("trip_notifications");

    // Buscar notificaciones para este conductor
    const driverNotifications = await notifications
      .find({
        driverId: new ObjectId(request.user!.userId),
        read: false,
      })
      .sort({ createdAt: -1 })
      .toArray();

    console.log(
      `✅ Found ${driverNotifications.length} notifications for driver:`,
      request.user!.userId
    );

    return NextResponse.json({
      success: true,
      notifications: driverNotifications.map((notif) => ({
        ...notif,
        id: notif._id.toString(),
        tripId: notif.tripId.toString(),
        driverId: notif.driverId.toString(),
        passengerId: notif.passengerId.toString(),
      })),
    });
  } catch (error) {
    console.error("❌ Error getting trip notifications:", error);
    return NextResponse.json(
      { success: false, message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export const POST = withAuth(createTrip);
export const GET = withAuth(getTripNotifications);
