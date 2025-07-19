"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Car, AlertCircle } from "lucide-react";

interface ConvertToDriverModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ConvertToDriverModal({
  open,
  onClose,
  onSuccess,
}: ConvertToDriverModalProps) {
  const { refreshUser } = useAuth();
  const [formData, setFormData] = useState({
    phone: "",
    carModel: "",
    carPlates: "",
    document: null as File | null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;
    if (name === "document" && files) {
      setFormData((prev) => ({ ...prev, document: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (
      !formData.phone ||
      !formData.carModel ||
      !formData.carPlates ||
      !formData.document
    ) {
      setError("Todos los campos son obligatorios");
      return;
    }
    setLoading(true);
    try {
      // Crear FormData para enviar archivo
      const formDataToSend = new FormData();
      formDataToSend.append("phone", formData.phone);
      formDataToSend.append("carModel", formData.carModel);
      formDataToSend.append("carPlates", formData.carPlates);
      formDataToSend.append("document", formData.document);

      const res = await fetch("/api/auth/convert-to-driver", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formDataToSend,
      });
      const result = await res.json();
      if (result.success) {
        await refreshUser(); // Actualizar datos del usuario
        onSuccess?.();
        onClose();
      } else {
        setError(result.message || "Error al convertir a conductor");
      }
    } catch (err) {
      setError("Error de conexión. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="bg-yellow-500 rounded-full p-3">
              <Car className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">
            ¡Conviértete en conductor!
          </CardTitle>
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
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                name="phone"
                type="text"
                placeholder="Tu teléfono"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="carModel">Modelo del vehículo</Label>
              <Input
                id="carModel"
                name="carModel"
                type="text"
                placeholder="Ejemplo: Nissan Versa"
                value={formData.carModel}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="carPlates">Placas</Label>
              <Input
                id="carPlates"
                name="carPlates"
                type="text"
                placeholder="Ejemplo: ABC123"
                value={formData.carPlates}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="document">Documento de Identidad</Label>
              <Input
                id="document"
                name="document"
                type="file"
                accept="image/*,.pdf"
                onChange={handleInputChange}
                required
                className="file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100"
              />
              <p className="text-xs text-gray-500">
                Sube tu documento de identidad (JPG, PNG, PDF)
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-black"
              disabled={loading}
            >
              {loading ? "Enviando..." : "Convertirme en conductor"}
            </Button>
            <Button
              type="button"
              variant="link"
              className="w-full text-gray-500"
              onClick={onClose}
            >
              Cancelar
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
