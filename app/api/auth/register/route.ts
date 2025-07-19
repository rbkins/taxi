import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { hashPassword } from "@/lib/auth";
import { signToken, generateRefreshToken } from "@/lib/jwt";
import { RegisterRequest, AuthResponse } from "@/types/auth";

export async function POST(request: NextRequest) {
  try {
    console.log("📝 Iniciando proceso de registro...");

    const body: RegisterRequest = await request.json();
    const {
      email,
      password,
      name,
      phone,
      role,
      driverLicense,
      vehicleInfo,
      emergencyContact,
    } = body;

    console.log("📧 Datos recibidos:", { email, name, role });

    // Validaciones básicas
    if (!email || !password || !name || !phone || !role) {
      console.log("❌ Faltan campos obligatorios");
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          message: "Todos los campos obligatorios deben ser completados",
        },
        { status: 400 }
      );
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          message: "El formato del email no es válido",
        },
        { status: 400 }
      );
    }

    // Validar contraseña (mínimo 6 caracteres)
    if (password.length < 6) {
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          message: "La contraseña debe tener al menos 6 caracteres",
        },
        { status: 400 }
      );
    }

    // Validar rol
    if (!["passenger", "driver"].includes(role)) {
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          message: 'El rol debe ser "passenger" o "driver"',
        },
        { status: 400 }
      );
    }

    // Validaciones específicas para conductores
    if (role === "driver" && (!driverLicense || !vehicleInfo)) {
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          message:
            "Los conductores deben proporcionar licencia y información del vehículo",
        },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("taxi_app");
    const users = db.collection("users");

    // Verificar si el usuario ya existe
    const existingUser = await users.findOne({ email });
    if (existingUser) {
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          message: "Este email ya está registrado",
        },
        { status: 409 }
      );
    }

    // Encriptar la contraseña
    const hashedPassword = await hashPassword(password);

    // Crear el objeto usuario
    const userData = {
      email,
      password: hashedPassword,
      name,
      phone,
      role,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...(role === "driver" && {
        driverLicense,
        vehicleInfo,
      }),
      ...(role === "passenger" &&
        emergencyContact && {
          emergencyContact,
        }),
    };

    // Insertar el usuario en la base de datos
    const result = await users.insertOne(userData);

    // Generar tokens
    const tokenPayload = {
      userId: result.insertedId.toString(),
      email,
      role,
    };

    const token = signToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    return NextResponse.json<AuthResponse>(
      {
        success: true,
        message: "Usuario registrado exitosamente",
        token,
        refreshToken,
        user: {
          id: result.insertedId.toString(),
          email,
          name,
          role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error en registro:", error);
    return NextResponse.json<AuthResponse>(
      {
        success: false,
        message: "Error interno del servidor",
      },
      { status: 500 }
    );
  }
}
