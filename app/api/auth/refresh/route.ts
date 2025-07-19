import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { verifyToken, signToken, generateRefreshToken } from "@/lib/jwt";
import { AuthResponse } from "@/types/auth";
import { ObjectId } from "mongodb";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          message: "Refresh token es obligatorio",
        },
        { status: 400 }
      );
    }

    // Verificar el refresh token
    const payload = verifyToken(refreshToken);
    if (!payload) {
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          message: "Refresh token inválido o expirado",
        },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db("taxi_app");
    const users = db.collection("users");

    // Verificar que el usuario aún existe y está activo
    const user = await users.findOne({
      _id: new ObjectId(payload.userId),
      isActive: true,
    });

    if (!user) {
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          message: "Usuario no encontrado o desactivado",
        },
        { status: 404 }
      );
    }

    // Generar nuevos tokens
    const newTokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const newToken = signToken(newTokenPayload);
    const newRefreshToken = generateRefreshToken(newTokenPayload);

    return NextResponse.json<AuthResponse>(
      {
        success: true,
        message: "Tokens renovados exitosamente",
        token: newToken,
        refreshToken: newRefreshToken,
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error renovando token:", error);
    return NextResponse.json<AuthResponse>(
      {
        success: false,
        message: "Error interno del servidor",
      },
      { status: 500 }
    );
  }
}
