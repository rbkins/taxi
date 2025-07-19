import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { verifyToken } from "@/lib/jwt";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Token de autorización requerido" },
        { status: 401 }
      );
    }
    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    if (!payload || !payload.email) {
      return NextResponse.json(
        { success: false, message: "Token inválido o expirado" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const phone = formData.get("phone") as string;
    const carModel = formData.get("carModel") as string;
    const carPlates = formData.get("carPlates") as string;
    const document = formData.get("document") as File;

    if (!phone || !carModel || !carPlates || !document) {
      return NextResponse.json(
        { success: false, message: "Todos los campos son obligatorios" },
        { status: 400 }
      );
    }

    // Guardar archivo de documento
    const bytes = await document.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Crear nombre único para el archivo
    const fileName = `${Date.now()}-${payload.email.replace("@", "_")}-${
      document.name
    }`;
    const filePath = path.join(
      process.cwd(),
      "public/uploads/documents",
      fileName
    );

    await writeFile(filePath, buffer);
    const documentUrl = `/uploads/documents/${fileName}`;

    const client = await clientPromise;
    const db = client.db("taxi_app");
    const users = db.collection("users");
    const user = await users.findOne({ email: payload.email });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Usuario no encontrado" },
        { status: 404 }
      );
    }
    if (user.role === "conductor") {
      return NextResponse.json(
        { success: false, message: "Ya eres conductor" },
        { status: 400 }
      );
    }
    await users.updateOne(
      { email: payload.email },
      {
        $set: {
          role: "conductor",
          phone,
          carModel,
          carPlates,
          documentUrl,
        },
      }
    );
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error converting to driver:", err);
    return NextResponse.json(
      { success: false, message: "Error interno" },
      { status: 500 }
    );
  }
}
