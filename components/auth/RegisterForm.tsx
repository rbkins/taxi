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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, EyeOff, Car, AlertCircle, UserPlus } from "lucide-react";

interface RegisterFormProps {
  onToggleForm: () => void;
  onSuccess?: () => void;
}

export default function RegisterForm({
  onToggleForm,
  onSuccess,
}: RegisterFormProps) {
  const { register, loading } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    phone: "",
    role: "passenger" as "passenger" | "driver",
    // Campos para pasajeros
    emergencyContactName: "",
    emergencyContactPhone: "",
    // Campos para conductores
    driverLicense: "",
    vehicleMake: "",
    vehicleModel: "",
    vehicleYear: "",
    vehiclePlate: "",
    vehicleColor: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validaciones básicas
    if (
      !formData.email ||
      !formData.password ||
      !formData.name ||
      !formData.phone
    ) {
      setError("Todos los campos obligatorios deben ser completados");
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Por favor ingresa un email válido");
      return;
    }

    // Validar contraseña
    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    // Validar confirmación de contraseña
    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    // Validar teléfono
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    if (!phoneRegex.test(formData.phone)) {
      setError("Por favor ingresa un número de teléfono válido");
      return;
    }

    // Validaciones específicas para conductores
    if (formData.role === "driver") {
      if (
        !formData.driverLicense ||
        !formData.vehicleMake ||
        !formData.vehicleModel ||
        !formData.vehicleYear ||
        !formData.vehiclePlate ||
        !formData.vehicleColor
      ) {
        setError(
          "Los conductores deben completar toda la información del vehículo"
        );
        return;
      }

      const currentYear = new Date().getFullYear();
      const year = parseInt(formData.vehicleYear);
      if (isNaN(year) || year < 1990 || year > currentYear + 1) {
        setError(
          "El año del vehículo debe estar entre 1990 y " + (currentYear + 1)
        );
        return;
      }
    }

    try {
      // Preparar datos para enviar
      const registerData = {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        phone: formData.phone,
        role: formData.role,
        ...(formData.role === "passenger" &&
          formData.emergencyContactName && {
            emergencyContact: {
              name: formData.emergencyContactName,
              phone: formData.emergencyContactPhone,
            },
          }),
        ...(formData.role === "driver" && {
          driverLicense: formData.driverLicense,
          vehicleInfo: {
            make: formData.vehicleMake,
            model: formData.vehicleModel,
            year: parseInt(formData.vehicleYear),
            plate: formData.vehiclePlate,
            color: formData.vehicleColor,
          },
        }),
      };

      const result = await register(registerData);

      if (result.success) {
        setSuccess("¡Registro exitoso! Bienvenido a Taxi Seguro");
        // Limpiar formulario
        setFormData({
          email: "",
          password: "",
          confirmPassword: "",
          name: "",
          phone: "",
          role: "passenger",
          emergencyContactName: "",
          emergencyContactPhone: "",
          driverLicense: "",
          vehicleMake: "",
          vehicleModel: "",
          vehicleYear: "",
          vehiclePlate: "",
          vehicleColor: "",
        });

        // Esperar un momento antes de llamar onSuccess para que el usuario vea el mensaje
        setTimeout(() => {
          onSuccess?.();
        }, 1500);
      } else {
        if (result.message.includes("ya está registrado")) {
          setError(
            "Ya existe una cuenta con este email. ¿Deseas iniciar sesión?"
          );
        } else {
          setError(result.message);
        }
      }
    } catch (error) {
      console.error("Error en registro:", error);
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

  const handleRoleChange = (value: "passenger" | "driver") => {
    setFormData((prev) => ({
      ...prev,
      role: value,
    }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-yellow-500 rounded-full p-3">
            <UserPlus className="h-8 w-8 text-white" />
          </div>
        </div>
        <CardTitle className="text-2xl text-center">Crear Cuenta</CardTitle>
        <CardDescription className="text-center">
          Únete a Taxi Seguro para viajes seguros y confiables
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

          {success && (
            <Alert className="border-green-200 bg-green-50 text-green-800">
              <AlertCircle className="h-4 w-4 text-green-600" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre completo *</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Juan Pérez"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="juan@email.com"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono *</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+1234567890"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Tipo de usuario *</Label>
              <Select value={formData.role} onValueChange={handleRoleChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tu rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="passenger">Pasajero</SelectItem>
                  <SelectItem value="driver">Conductor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Contraseñas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña *</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar contraseña *</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Campos específicos para pasajeros */}
          {formData.role === "passenger" && (
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-lg font-semibold">
                Contacto de emergencia (opcional)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emergencyContactName">
                    Nombre del contacto
                  </Label>
                  <Input
                    id="emergencyContactName"
                    name="emergencyContactName"
                    type="text"
                    placeholder="María Pérez"
                    value={formData.emergencyContactName}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyContactPhone">
                    Teléfono del contacto
                  </Label>
                  <Input
                    id="emergencyContactPhone"
                    name="emergencyContactPhone"
                    type="tel"
                    placeholder="+0987654321"
                    value={formData.emergencyContactPhone}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Campos específicos para conductores */}
          {formData.role === "driver" && (
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-lg font-semibold">
                Información del conductor
              </h3>

              <div className="space-y-2">
                <Label htmlFor="driverLicense">Número de licencia *</Label>
                <Input
                  id="driverLicense"
                  name="driverLicense"
                  type="text"
                  placeholder="ABC123456"
                  value={formData.driverLicense}
                  onChange={handleInputChange}
                  required={formData.role === "driver"}
                />
              </div>

              <h4 className="text-md font-medium">Información del vehículo</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vehicleMake">Marca *</Label>
                  <Input
                    id="vehicleMake"
                    name="vehicleMake"
                    type="text"
                    placeholder="Toyota"
                    value={formData.vehicleMake}
                    onChange={handleInputChange}
                    required={formData.role === "driver"}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vehicleModel">Modelo *</Label>
                  <Input
                    id="vehicleModel"
                    name="vehicleModel"
                    type="text"
                    placeholder="Corolla"
                    value={formData.vehicleModel}
                    onChange={handleInputChange}
                    required={formData.role === "driver"}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vehicleYear">Año *</Label>
                  <Input
                    id="vehicleYear"
                    name="vehicleYear"
                    type="number"
                    placeholder="2020"
                    min="1990"
                    max={new Date().getFullYear() + 1}
                    value={formData.vehicleYear}
                    onChange={handleInputChange}
                    required={formData.role === "driver"}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vehiclePlate">Placa *</Label>
                  <Input
                    id="vehiclePlate"
                    name="vehiclePlate"
                    type="text"
                    placeholder="ABC-123"
                    value={formData.vehiclePlate}
                    onChange={handleInputChange}
                    required={formData.role === "driver"}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vehicleColor">Color *</Label>
                  <Input
                    id="vehicleColor"
                    name="vehicleColor"
                    type="text"
                    placeholder="Blanco"
                    value={formData.vehicleColor}
                    onChange={handleInputChange}
                    required={formData.role === "driver"}
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <Button
            type="submit"
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-black"
            disabled={loading}
          >
            {loading ? "Creando cuenta..." : "Crear Cuenta"}
          </Button>

          <div className="text-center text-sm">
            <span className="text-gray-600">¿Ya tienes una cuenta? </span>
            <Button
              type="button"
              variant="link"
              className="p-0 text-yellow-600 hover:text-yellow-700"
              onClick={onToggleForm}
            >
              Inicia sesión aquí
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
