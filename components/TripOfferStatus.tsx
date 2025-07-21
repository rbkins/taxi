"use client";

import { useState, useEffect } from "react";
import { useTrip } from "@/contexts/TripContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  X,
  Clock,
  MapPin,
  DollarSign,
  Car,
  AlertCircle,
} from "lucide-react";

interface TripOffer {
  id: string;
  clientName: string;
  origin: {
    address: string;
    lat: number;
    lng: number;
  };
  destination: {
    address: string;
    lat: number;
    lng: number;
  };
  proposedFare: number;
  distance: number;
  estimatedTime: number;
  createdAt: Date;
  status: "pending" | "accepted" | "rejected";
}

interface TripOfferStatusProps {
  offer: TripOffer;
  onAccept: (offerId: string) => void;
  onReject: (offerId: string) => void;
  disabled?: boolean;
}

export default function TripOfferStatus({
  offer,
  onAccept,
  onReject,
  disabled = false,
}: TripOfferStatusProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAccept = async () => {
    setIsProcessing(true);
    try {
      await onAccept(offer.id);
    } catch (error) {
      console.error("Error accepting offer:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    setIsProcessing(true);
    try {
      await onReject(offer.id);
    } catch (error) {
      console.error("Error rejecting offer:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = () => {
    switch (offer.status) {
      case "accepted":
        return (
          <Badge className="bg-green-500 text-white">
            <CheckCircle className="w-3 h-3 mr-1" />
            Aceptado
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-500 text-white">
            <X className="w-3 h-3 mr-1" />
            Rechazado
          </Badge>
        );
      default:
        return (
          <Badge className="bg-yellow-500 text-white">
            <Clock className="w-3 h-3 mr-1" />
            Pendiente
          </Badge>
        );
    }
  };

  return (
    <Card
      className={`
      border-2 transition-all duration-300
      ${
        offer.status === "pending"
          ? "border-taxi-yellow/50 bg-taxi-yellow/5"
          : "border-gray-200"
      }
      ${offer.status === "accepted" ? "border-green-500/50 bg-green-50" : ""}
      ${offer.status === "rejected" ? "border-red-500/50 bg-red-50" : ""}
    `}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-dark flex items-center space-x-2">
            <Car className="w-5 h-5 text-taxi-yellow" />
            <span className="text-lg">Solicitud de Viaje</span>
          </CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Información del cliente */}
        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
          <div className="w-10 h-10 bg-gradient-to-r from-taxi-yellow to-yellow-400 rounded-full flex items-center justify-center">
            <span className="text-dark font-bold text-sm">
              {offer.clientName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-semibold text-dark">{offer.clientName}</p>
            <p className="text-sm text-gray-600">Cliente</p>
          </div>
        </div>

        {/* Ruta del viaje */}
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="flex flex-col items-center space-y-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div className="w-0.5 h-8 bg-gray-300"></div>
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            </div>
            <div className="space-y-4 flex-1">
              <div>
                <p className="text-sm text-gray-500">Origen</p>
                <p className="font-medium text-dark">{offer.origin.address}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Destino</p>
                <p className="font-medium text-dark">
                  {offer.destination.address}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Detalles del viaje */}
        <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-center">
            <DollarSign className="w-5 h-5 text-taxi-yellow mx-auto mb-1" />
            <p className="text-lg font-bold text-dark">
              ${offer.proposedFare.toFixed(2)}
            </p>
            <p className="text-xs text-gray-600">Tarifa</p>
          </div>
          <div className="text-center">
            <Clock className="w-5 h-5 text-taxi-yellow mx-auto mb-1" />
            <p className="text-lg font-bold text-dark">
              {offer.estimatedTime} min
            </p>
            <p className="text-xs text-gray-600">Tiempo estimado</p>
          </div>
        </div>

        {/* Tiempo transcurrido */}
        <div className="text-center text-sm text-gray-500">
          Solicitud enviada hace{" "}
          {Math.floor((Date.now() - offer.createdAt.getTime()) / 60000)} minutos
        </div>

        {/* Botones de acción */}
        {offer.status === "pending" && (
          <div className="flex space-x-3 pt-2">
            <Button
              onClick={handleAccept}
              disabled={disabled || isProcessing}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-emerald-500 hover:to-green-500 text-white font-semibold"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Aceptar Viaje
            </Button>
            <Button
              onClick={handleReject}
              disabled={disabled || isProcessing}
              variant="outline"
              className="flex-1 border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
            >
              <X className="w-4 h-4 mr-2" />
              Rechazar
            </Button>
          </div>
        )}

        {/* Estado final */}
        {offer.status !== "pending" && (
          <div className="text-center p-3 rounded-lg bg-gray-100">
            <AlertCircle className="w-5 h-5 text-gray-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600">
              {offer.status === "accepted"
                ? "Has aceptado esta solicitud de viaje"
                : "Has rechazado esta solicitud de viaje"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
