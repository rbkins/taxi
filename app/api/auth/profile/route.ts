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
