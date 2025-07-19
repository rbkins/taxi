import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { comparePassword } from "@/lib/auth";
import { signToken, generateRefreshToken } from "@/lib/jwt";
import { LoginRequest, AuthResponse } from "@/types/auth";

export async function POST(request: NextRequest) {
  try {
    console.log("🔑 Iniciando proceso de login...");

    const body: LoginRequest = await request.json();
    const { email, password } = body;

    console.log("📧 Email recibido:", email);

    // Validaciones básicas
    if (!email || !password) {
      console.log("❌ Faltan credenciales");
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          message: "Email y contraseña son obligatorios",
        },
        { status: 400 }
      );
    }

    console.log("🔗 Conectando a MongoDB...");
    const client = await clientPromise;
    const db = client.db("taxi_app");
    const users = db.collection("users");

    console.log("🔍 Buscando usuario en la base de datos...");
    // Buscar al usuario por email
    const user = await users.findOne({ email });
    if (!user) {
      console.log("❌ Usuario no encontrado para email:", email);
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          message: "Credenciales inválidas",
        },
        { status: 401 }
      );
    }

    console.log("✅ Usuario encontrado:", user.name, user.role);

    // Verificar si el usuario está activo
    if (!user.isActive) {
      console.log("❌ Usuario desactivado");
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          message: "Cuenta desactivada. Contacta al administrador",
        },
        { status: 403 }
      );
    }

    console.log("🔐 Verificando contraseña...");

    // Verificar la contraseña
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      console.log("❌ Contraseña incorrecta");
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          message: "Credenciales inválidas",
        },
        { status: 401 }
      );
    }

    console.log("✅ Contraseña correcta, actualizando último acceso...");
    // Actualizar fecha de último acceso
    await users.updateOne(
      { _id: user._id },
      { $set: { lastLogin: new Date(), updatedAt: new Date() } }
    );

    console.log("🎟️ Generando tokens...");
    // Generar tokens
    const tokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const token = signToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    console.log("✅ Login exitoso para:", user.email);
    return NextResponse.json<AuthResponse>(
      {
        success: true,
        message: "Inicio de sesión exitoso",
        token,
        refreshToken,
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
    console.error("💥 Error en inicio de sesión:", error);
    return NextResponse.json<AuthResponse>(
      {
        success: false,
        message: "Error interno del servidor: " + (error as Error).message,
      },
      { status: 500 }
    );
  }
}
