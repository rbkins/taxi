"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  MapPin,
  DollarSign,
  Car,
  X,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface Location {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
}

interface WaitingForResponseModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripData: {
    origin: Location;
    destination: Location;
    proposedFare: number;
    distance?: number;
    estimatedTime?: number;
    driverName?: string;
  };
  responseStatus?: "waiting" | "accepted" | "rejected" | null;
  timeElapsed: number; // en segundos
}

export default function WaitingForResponseModal({
  isOpen,
  onClose,
  tripData,
  responseStatus,
  timeElapsed,
}: WaitingForResponseModalProps) {
  const [dots, setDots] = useState("");

  // Animación de puntos para "esperando..."
  useEffect(() => {
    if (responseStatus === "waiting") {
      const interval = setInterval(() => {
        setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
      }, 500);
      return () => clearInterval(interval);
    }
  }, [responseStatus]);

  // Formatear tiempo transcurrido
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Obtener contenido del modal basado en el estado
  const getModalContent = () => {
    switch (responseStatus) {
      case "accepted":
        return {
          title: "¡Viaje Aceptado!",
          icon: (
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          ),
          message: `${
            tripData.driverName || "El conductor"
          } ha aceptado tu solicitud`,
          bgColor: "from-green-500/20 to-emerald-500/20",
          borderColor: "border-green-500/30",
        };
      case "rejected":
        return {
          title: "Solicitud Rechazada",
          icon: <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />,
          message:
            "El conductor no puede tomar tu viaje. Busquemos otro conductor.",
          bgColor: "from-red-500/20 to-rose-500/20",
          borderColor: "border-red-500/30",
        };
      default:
        return {
          title: "Esperando Respuesta",
          icon: (
            <Clock className="w-12 h-12 text-taxi-yellow mx-auto mb-4 animate-pulse" />
          ),
          message: `Buscando conductor${dots}`,
          bgColor: "from-taxi-yellow/20 to-yellow-500/20",
          borderColor: "border-taxi-yellow/30",
        };
    }
  };

  if (!isOpen) return null;

  const content = getModalContent();

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card
        className={`w-full max-w-md bg-gradient-to-br ${content.bgColor} backdrop-blur-sm ${content.borderColor} border-2`}
      >
        <CardHeader className="text-center">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-xl font-bold text-white mb-2">
                {content.title}
              </CardTitle>
              <Badge
                variant="outline"
                className="text-taxi-yellow border-taxi-yellow"
              >
                Tiempo: {formatTime(timeElapsed)}
              </Badge>
            </div>
            {responseStatus !== "waiting" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Icono y mensaje principal */}
          <div className="text-center">
            {content.icon}
            <p className="text-white/90 mb-4">{content.message}</p>
          </div>

          {/* Detalles del viaje */}
          <div className="space-y-3 bg-black/20 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-sm text-white/70">Origen</p>
                <p className="text-white font-medium">{tripData.origin.name}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-red-400" />
              <div>
                <p className="text-sm text-white/70">Destino</p>
                <p className="text-white font-medium">
                  {tripData.destination.name}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-taxi-yellow" />
                <span className="text-white font-bold">
                  ${tripData.proposedFare}
                </span>
              </div>

              {tripData.distance && (
                <div className="flex items-center space-x-2">
                  <Car className="w-5 h-5 text-blue-400" />
                  <span className="text-white/80">
                    {tripData.distance.toFixed(1)} km
                  </span>
                </div>
              )}

              {tripData.estimatedTime && (
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-purple-400" />
                  <span className="text-white/80">
                    {tripData.estimatedTime} min
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-3">
            {responseStatus === "waiting" && (
              <>
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 border-white/30 text-white hover:bg-white/10"
                >
                  Cancelar Solicitud
                </Button>
                <Button
                  disabled
                  className="flex-1 bg-taxi-yellow/20 text-taxi-yellow"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Esperando...
                </Button>
              </>
            )}

            {responseStatus === "accepted" && (
              <Button
                onClick={onClose}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Ver Viaje en Progreso
              </Button>
            )}

            {responseStatus === "rejected" && (
              <Button
                onClick={onClose}
                className="w-full bg-red-600 hover:bg-red-700 text-white"
              >
                Buscar Otro Conductor
              </Button>
            )}
          </div>

          {/* Indicador de progreso para modo espera */}
          {responseStatus === "waiting" && (
            <div className="space-y-2">
              <p className="text-xs text-white/60 text-center">
                Notificando a conductores cercanos...
              </p>
              <div className="w-full bg-black/30 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-taxi-yellow to-yellow-400 h-2 rounded-full transition-all duration-1000"
                  style={{
                    width: `${Math.min((timeElapsed / 120) * 100, 100)}%`,
                  }}
                />
              </div>
              {timeElapsed >= 120 && (
                <div className="flex items-center justify-center space-x-2 text-orange-400">
                  <AlertCircle className="w-4 h-4" />
                  <p className="text-xs">Buscando más conductores...</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
