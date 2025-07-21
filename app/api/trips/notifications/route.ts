import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { withAuth, AuthenticatedRequest } from "@/lib/middleware";
import { ObjectId } from "mongodb";

// GET - Obtener notificaciones según el rol del usuario
async function getUserNotifications(request: AuthenticatedRequest) {
  try {
    const client = await clientPromise;
    const db = client.db("taxi_app");
    const notifications = db.collection("trip_notifications");
    const users = db.collection("users");

    // Obtener información del usuario para determinar su rol
    const user = await users.findOne({
      _id: new ObjectId(request.user!.userId),
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    let userNotifications;

    if (user.role === "conductor") {
      // Notificaciones para conductores (solicitudes de viaje)
      userNotifications = await notifications
        .find({
          driverId: new ObjectId(request.user!.userId),
          type: "trip-request",
          read: false,
        })
        .sort({ createdAt: -1 })
        .toArray();
    } else {
      // Notificaciones para pasajeros (respuestas de conductores)
      userNotifications = await notifications
        .find({
          passengerId: new ObjectId(request.user!.userId),
          type: { $in: ["trip-accepted", "trip-rejected"] },
          read: false,
        })
        .sort({ createdAt: -1 })
        .toArray();
    }

    console.log(
      `✅ Found ${userNotifications.length} notifications for ${user.role}:`,
      request.user!.userId
    );

    return NextResponse.json({
      success: true,
      notifications: userNotifications.map((notif) => ({
        ...notif,
        id: notif._id.toString(),
        tripId: notif.tripId.toString(),
        driverId: notif.driverId?.toString(),
        passengerId: notif.passengerId?.toString(),
        recipientId:
          user.role === "conductor"
            ? notif.driverId?.toString()
            : notif.passengerId?.toString(),
      })),
    });
  } catch (error) {
    console.error("❌ Error getting notifications:", error);
    return NextResponse.json(
      { success: false, message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// POST - Marcar notificación como leída
async function markNotificationAsRead(request: AuthenticatedRequest) {
  try {
    const body = await request.json();
    const { notificationId } = body;

    if (!notificationId) {
      return NextResponse.json(
        { success: false, message: "ID de notificación requerido" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("taxi_app");
    const notifications = db.collection("trip_notifications");

    await notifications.updateOne(
      {
        _id: new ObjectId(notificationId),
        passengerId: new ObjectId(request.user!.userId),
      },
      { $set: { read: true } }
    );

    return NextResponse.json({
      success: true,
      message: "Notificación marcada como leída",
    });
  } catch (error) {
    console.error("❌ Error marking notification as read:", error);
    return NextResponse.json(
      { success: false, message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getUserNotifications);
export const POST = withAuth(markNotificationAsRead);
