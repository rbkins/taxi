export interface User {
  _id?: string;
  email: string;
  password: string;
  name: string;
  phone?: string;
  role: "passenger" | "driver" | "admin";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Campos específicos para conductores
  driverLicense?: string;
  vehicleInfo?: {
    make: string;
    model: string;
    year: number;
    plate: string;
    color: string;
  };
  // Campos específicos para pasajeros
  emergencyContact?: {
    name: string;
    phone: string;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  phone: string;
  role: "passenger" | "driver";
  // Campos opcionales según el rol
  driverLicense?: string;
  vehicleInfo?: {
    make: string;
    model: string;
    year: number;
    plate: string;
    color: string;
  };
  emergencyContact?: {
    name: string;
    phone: string;
  };
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  refreshToken?: string;
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}
