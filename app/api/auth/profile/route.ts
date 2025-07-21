import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { withAuth, AuthenticatedRequest } from "@/lib/middleware";
import { ObjectId } from "mongodb";

async function getProfile(request: AuthenticatedRequest) {
  try {
    if (!request.user) {
      return NextResponse.json(
        {
          success: false,
          message: "Usuario no autenticado",
        },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db("taxi_app");
    const users = db.collection("users");

    // Buscar al usuario por ID (excluyendo la contraseña)
    const user = await users.findOne(
      { _id: new ObjectId(request.user.userId) },
      {
        projection: {
          password: 0, // Excluir la contraseña del resultado
        },
      }
    );

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Usuario no encontrado",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Perfil obtenido exitosamente",
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          phone: user.phone,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin,
          ...(user.role === "driver" && {
            driverLicense: user.driverLicense,
            vehicleInfo: user.vehicleInfo,
          }),
          ...(user.role === "passenger" &&
            user.emergencyContact && {
              emergencyContact: user.emergencyContact,
            }),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error obteniendo perfil:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error interno del servidor",
      },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getProfile);

// PUT - Actualizar perfil del usuario
async function updateProfile(request: AuthenticatedRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, driverLicense } = body;

    if (!name || !email) {
      return NextResponse.json(
        { success: false, message: "Nombre y email son requeridos" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("taxi_app");
    const users = db.collection("users");

    // Verificar si el nuevo email ya existe (excepto el usuario actual)
    const existingUser = await users.findOne({
      email: email.toLowerCase(),
      _id: { $ne: new ObjectId(request.user!.userId) },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "Este email ya está en uso" },
        { status: 409 }
      );
    }

    // Preparar datos de actualización
    const updateData: any = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      updatedAt: new Date(),
    };

    // Agregar campos opcionales si se proporcionan
    if (phone !== undefined) {
      updateData.phone = phone.trim();
    }

    if (driverLicense !== undefined) {
      updateData.driverLicense = driverLicense.trim();
    }

    // Actualizar el usuario
    const result = await users.updateOne(
      { _id: new ObjectId(request.user!.userId) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Obtener el usuario actualizado
    const updatedUser = await users.findOne({
      _id: new ObjectId(request.user!.userId),
    });

    return NextResponse.json({
      success: true,
      message: "Perfil actualizado exitosamente",
      user: {
        id: updatedUser?._id.toString(),
        name: updatedUser?.name,
        email: updatedUser?.email,
        phone: updatedUser?.phone,
        role: updatedUser?.role,
        driverLicense: updatedUser?.driverLicense,
      },
    });
  } catch (error) {
    console.error("❌ Error updating profile:", error);
    return NextResponse.json(
      { success: false, message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar perfil del usuario
async function deleteProfile(request: AuthenticatedRequest) {
  try {
    const client = await clientPromise;
    const db = client.db("taxi_app");
    const users = db.collection("users");
    const trips = db.collection("trips");
    const notifications = db.collection("trip_notifications");

    const userId = new ObjectId(request.user!.userId);

    // Eliminar viajes relacionados
    await trips.deleteMany({
      $or: [{ passengerId: userId }, { driverId: userId }],
    });

    // Eliminar notificaciones relacionadas
    await notifications.deleteMany({
      $or: [
        { recipientId: request.user!.userId },
        { senderId: request.user!.userId },
      ],
    });

    // Eliminar el usuario
    const result = await users.deleteOne({
      _id: userId,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Perfil eliminado exitosamente",
    });
  } catch (error) {
    console.error("❌ Error deleting profile:", error);
    return NextResponse.json(
      { success: false, message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export const PUT = withAuth(updateProfile);
export const DELETE = withAuth(deleteProfile);
