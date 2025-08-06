import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "tu-clave-secreta-muy-segura-aqui";

export interface TokenPayload {
  userId: string;
  email: string;
  role?: string;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "7d", // Token válido por 7 días
  });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    console.log("🔍 Verifying token...");
    console.log(
      "🔍 Token format check:",
      token.split(".").length === 3 ? "Valid JWT format" : "Invalid JWT format"
    );
    console.log("🔍 JWT_SECRET exists:", !!JWT_SECRET);

    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    console.log("✅ Token verified successfully for user:", decoded.userId);
    return decoded;
  } catch (error) {
    console.error("❌ Error verificando token:", error);
    if (error instanceof jwt.TokenExpiredError) {
      console.error("❌ Token expired:", error.expiredAt);
    } else if (error instanceof jwt.JsonWebTokenError) {
      console.error("❌ Invalid token:", error.message);
    }
    return null;
  }
}

export function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "30d", // Refresh token válido por 30 días
  });
}
