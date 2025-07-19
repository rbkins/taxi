"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Car, AlertCircle } from "lucide-react";

interface LoginFormProps {
  onToggleForm: () => void;
  onSuccess?: () => void;
}

export default function LoginForm({ onToggleForm, onSuccess }: LoginFormProps) {
  const { login, loading } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("Todos los campos son obligatorios");
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Por favor ingresa un email válido");
      return;
    }

    // Validar longitud de contraseña
    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    try {
      const result = await login(formData.email, formData.password);

      if (result.success) {
        // Limpiar formulario
        setFormData({ email: "", password: "" });
        onSuccess?.();
      } else {
        // Mostrar mensaje específico según el error
        if (result.message.includes("Credenciales inválidas")) {
          setError(
            "Email o contraseña incorrectos. Verifica tus datos e intenta nuevamente."
          );
        } else if (result.message.includes("desactivada")) {
          setError("Tu cuenta ha sido desactivada. Contacta al administrador.");
        } else if (result.message.includes("no encontrado")) {
          setError("No existe una cuenta con este email. ¿Deseas registrarte?");
        } else {
          setError(result.message);
        }
      }
    } catch (error) {
      console.error("Error en login:", error);
      setError("Error de conexión. Verifica tu internet e intenta nuevamente.");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-yellow-500 rounded-full p-3">
            <Car className="h-8 w-8 text-white" />
          </div>
        </div>
        <CardTitle className="text-2xl text-center">Iniciar Sesión</CardTitle>
        <CardDescription className="text-center">
          Ingresa tus credenciales para acceder a Taxi Seguro
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="tu@email.com"
              value={formData.email}
              onChange={handleInputChange}
              required
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleInputChange}
                required
                autoComplete="current-password"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <Button
            type="submit"
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-black"
            disabled={loading}
          >
            {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </Button>

          <div className="text-center text-sm">
            <span className="text-gray-600">¿No tienes una cuenta? </span>
            <Button
              type="button"
              variant="link"
              className="p-0 text-yellow-600 hover:text-yellow-700"
              onClick={onToggleForm}
            >
              Regístrate aquí
            </Button>
          </div>

          <div className="text-center">
            <Button
              type="button"
              variant="link"
              className="p-0 text-sm text-gray-500 hover:text-gray-700"
            >
              ¿Olvidaste tu contraseña?
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
