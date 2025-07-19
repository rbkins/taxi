import { NextRequest, NextResponse } from "next/server";
import { verifyToken, TokenPayload } from "@/lib/jwt";

export interface AuthenticatedRequest extends NextRequest {
  user?: TokenPayload;
}

export function withAuth(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
) {
  return async (request: AuthenticatedRequest) => {
    try {
      const authHeader = request.headers.get("authorization");

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return NextResponse.json(
          {
            success: false,
            message: "Token de autorización requerido",
          },
          { status: 401 }
        );
      }

      const token = authHeader.substring(7); // Remover "Bearer "
      const payload = verifyToken(token);

      if (!payload) {
        return NextResponse.json(
          {
            success: false,
            message: "Token inválido o expirado",
          },
          { status: 401 }
        );
      }

      // Agregar información del usuario a la request
      request.user = payload;

      return handler(request);
    } catch (error) {
      console.error("Error en middleware de autenticación:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Error de autenticación",
        },
        { status: 500 }
      );
    }
  };
}

export function requireRole(roles: string[]) {
  return (handler: (req: AuthenticatedRequest) => Promise<NextResponse>) => {
    return withAuth(async (request: AuthenticatedRequest) => {
      if (!request.user || !roles.includes(request.user.role || "")) {
        return NextResponse.json(
          {
            success: false,
            message: "Permisos insuficientes",
          },
          { status: 403 }
        );
      }

      return handler(request);
    });
  };
}
