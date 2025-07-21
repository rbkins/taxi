import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { withAuth, AuthenticatedRequest } from "@/lib/middleware";
import { ObjectId } from "mongodb";

// GET - Obtener historial de viajes del usuario
async function getTripHistory(request: AuthenticatedRequest) {
  try {
    const client = await clientPromise;
    const db = client.db("taxi_app");
    const trips = db.collection("trips");
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

    let userTrips;

    if (user.role === "conductor") {
      // Obtener viajes donde este usuario fue el conductor
      userTrips = await trips
        .find({
          driverId: new ObjectId(request.user!.userId),
          status: { $in: ["completed", "cancelled"] },
        })
        .sort({ completedAt: -1, createdAt: -1 })
        .toArray();
    } else {
      // Obtener viajes donde este usuario fue el pasajero
      userTrips = await trips
        .find({
          passengerId: new ObjectId(request.user!.userId),
          status: { $in: ["completed", "cancelled"] },
        })
        .sort({ completedAt: -1, createdAt: -1 })
        .toArray();
    }

    // Enriquecer los viajes con información adicional
    const enrichedTrips = await Promise.all(
      userTrips.map(async (trip) => {
        let otherUserInfo = null;

        if (user.role === "conductor") {
          // Si el usuario es conductor, obtener info del pasajero
          otherUserInfo = await users.findOne({
            _id: trip.passengerId,
          });
        } else {
          // Si el usuario es pasajero, obtener info del conductor
          if (trip.driverId) {
            otherUserInfo = await users.findOne({
              _id: trip.driverId,
            });
          }
        }

        return {
          id: trip._id.toString(),
          tripId: trip._id.toString(),
          origin: trip.origin,
          destination: trip.destination,
          status: trip.status,
          fare: trip.proposedFare || trip.fare || 0,
          distance: trip.distance || 0,
          estimatedTime: trip.estimatedTime || 0,
          createdAt: trip.createdAt,
          completedAt: trip.completedAt || trip.updatedAt,
          // Información del otro usuario (conductor o pasajero)
          otherUser: otherUserInfo
            ? {
                name: otherUserInfo.name,
                email: otherUserInfo.email,
                vehicleInfo: otherUserInfo.vehicleInfo,
              }
            : null,
          // Campos específicos según el rol
          ...(user.role === "conductor"
            ? {
                passengerName: otherUserInfo?.name || "Pasajero",
                passengerEmail: otherUserInfo?.email || "N/A",
              }
            : {
                driverName: otherUserInfo?.name || "Conductor",
                driverEmail: otherUserInfo?.email || "N/A",
                vehiclePlate: otherUserInfo?.vehicleInfo?.plate || "N/A",
                vehicleInfo: otherUserInfo?.vehicleInfo || null,
              }),
        };
      })
    );

    console.log(
      `✅ Found ${enrichedTrips.length} trips for ${user.role}:`,
      request.user!.userId
    );

    return NextResponse.json({
      success: true,
      trips: enrichedTrips,
      userRole: user.role,
    });
  } catch (error) {
    console.error("❌ Error getting trip history:", error);
    return NextResponse.json(
      { success: false, message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// POST - Completar un viaje
async function completeTrip(request: AuthenticatedRequest) {
  try {
    const body = await request.json();
    const { tripId } = body;

    if (!tripId) {
      return NextResponse.json(
        { success: false, message: "ID de viaje requerido" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("taxi_app");
    const trips = db.collection("trips");

    // Actualizar el viaje como completado
    const result = await trips.updateOne(
      {
        _id: new ObjectId(tripId),
        status: { $nin: ["completed", "cancelled"] }, // No completar viajes ya completados o cancelados
      },
      {
        $set: {
          status: "completed",
          completedAt: new Date(),
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Viaje no encontrado o no se puede completar",
        },
        { status: 404 }
      );
    }

    console.log(`✅ Trip ${tripId} marked as completed`);

    return NextResponse.json({
      success: true,
      message: "Viaje completado exitosamente",
    });
  } catch (error) {
    console.error("❌ Error completing trip:", error);
    return NextResponse.json(
      { success: false, message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getTripHistory);
export const POST = withAuth(completeTrip);
