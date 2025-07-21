"use client";

import { useEffect, useState } from "react";
import { Location } from "@/services/LocationService";
import { MapPin, Navigation, Car, User } from "lucide-react";

interface MockMapProps {
  origin?: Location;
  destination?: Location;
  drivers?: Array<{
    id: string;
    name: string;
    currentLocation: Location;
  }>;
  selectedDriver?: string;
  className?: string;
  showRoute?: boolean;
}

export default function MockMap({
  origin,
  destination,
  drivers = [],
  selectedDriver,
  className = "",
  showRoute = false,
}: MockMapProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simular tiempo de carga del mapa
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Convertir coordenadas a posición en el mapa (simplificado)
  const getMapPosition = (location: Location) => {
    // Validar que location tenga las propiedades necesarias
    if (
      !location ||
      typeof location.lng !== "number" ||
      typeof location.lat !== "number"
    ) {
      // Retornar posición por defecto si no hay ubicación válida
      return {
        left: "50%",
        top: "50%",
      };
    }

    // Área aproximada de Tegucigalpa para el mapa
    const bounds = {
      north: 14.15,
      south: 14.05,
      east: -87.15,
      west: -87.25,
    };

    const x =
      ((location.lng - bounds.west) / (bounds.east - bounds.west)) * 100;
    const y =
      ((bounds.north - location.lat) / (bounds.north - bounds.south)) * 100;

    return {
      left: `${Math.max(5, Math.min(95, x))}%`,
      top: `${Math.max(5, Math.min(95, y))}%`,
    };
  };

  if (isLoading) {
    return (
      <div
        className={`bg-gray-100 rounded-lg overflow-hidden relative ${className}`}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <Navigation className="w-8 h-8 mx-auto mb-2 text-taxi-yellow animate-pulse" />
            <p className="text-sm text-gray-500">Cargando mapa...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-gradient-to-br from-green-50 to-blue-50 rounded-lg overflow-hidden relative border-2 border-gray-200 ${className}`}
    >
      {/* Fondo del mapa simulado con calles */}
      <div className="absolute inset-0">
        {/* Calles horizontales */}
        {[20, 40, 60, 80].map((top) => (
          <div
            key={`h-${top}`}
            className="absolute w-full h-1 bg-gray-300"
            style={{ top: `${top}%` }}
          />
        ))}
        {/* Calles verticales */}
        {[25, 50, 75].map((left) => (
          <div
            key={`v-${left}`}
            className="absolute h-full w-1 bg-gray-300"
            style={{ left: `${left}%` }}
          />
        ))}

        {/* Áreas verdes simuladas */}
        <div
          className="absolute w-16 h-16 bg-green-200 rounded-full opacity-60"
          style={{ top: "15%", left: "20%" }}
        />
        <div
          className="absolute w-12 h-12 bg-green-200 rounded-full opacity-60"
          style={{ top: "70%", left: "60%" }}
        />

        {/* Edificios simulados */}
        <div
          className="absolute w-3 h-3 bg-gray-400 rounded-sm"
          style={{ top: "30%", left: "40%" }}
        />
        <div
          className="absolute w-3 h-3 bg-gray-400 rounded-sm"
          style={{ top: "50%", left: "30%" }}
        />
        <div
          className="absolute w-3 h-3 bg-gray-400 rounded-sm"
          style={{ top: "25%", left: "70%" }}
        />
      </div>

      {/* Ruta simulada */}
      {showRoute && origin && destination && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <pattern
              id="dashed"
              patternUnits="userSpaceOnUse"
              width="8"
              height="2"
            >
              <rect width="4" height="2" fill="#FFC107" />
              <rect x="4" width="4" height="2" fill="transparent" />
            </pattern>
          </defs>
          <line
            x1={getMapPosition(origin).left}
            y1={getMapPosition(origin).top}
            x2={getMapPosition(destination).left}
            y2={getMapPosition(destination).top}
            stroke="url(#dashed)"
            strokeWidth="3"
            className="animate-pulse"
          />
        </svg>
      )}

      {/* Marcador de origen */}
      {origin && (
        <div
          className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
          style={getMapPosition(origin)}
        >
          <div className="bg-green-500 rounded-full p-2 shadow-lg border-2 border-white">
            <MapPin className="w-4 h-4 text-white" />
          </div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1">
            <div className="bg-white px-2 py-1 rounded shadow-md text-xs font-medium whitespace-nowrap">
              Origen
            </div>
          </div>
        </div>
      )}

      {/* Marcador de destino */}
      {destination && (
        <div
          className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
          style={getMapPosition(destination)}
        >
          <div className="bg-red-500 rounded-full p-2 shadow-lg border-2 border-white">
            <MapPin className="w-4 h-4 text-white" />
          </div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1">
            <div className="bg-white px-2 py-1 rounded shadow-md text-xs font-medium whitespace-nowrap">
              Destino
            </div>
          </div>
        </div>
      )}

      {/* Conductores disponibles */}
      {drivers
        ?.map((driver) => {
          // Validar que el conductor y su ubicación existan
          if (!driver || !driver.currentLocation) {
            return null;
          }

          return (
            <div
              key={driver.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20"
              style={getMapPosition(driver.currentLocation)}
            >
              <div
                className={`${
                  selectedDriver === driver.id
                    ? "bg-taxi-yellow border-dark"
                    : "bg-blue-500 border-white"
                } rounded-full p-2 shadow-lg border-2 transition-all duration-300`}
              >
                <Car className="w-3 h-3 text-white" />
              </div>
              {selectedDriver === driver.id && (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1">
                  <div className="bg-taxi-yellow px-2 py-1 rounded shadow-md text-xs font-medium whitespace-nowrap text-dark">
                    {driver.name}
                  </div>
                </div>
              )}
            </div>
          );
        })
        .filter(Boolean)}

      {/* Controles del mapa */}
      <div className="absolute top-2 right-2 flex flex-col space-y-1">
        <button className="bg-white p-1 rounded shadow hover:bg-gray-50 transition-colors">
          <span className="text-lg font-bold text-gray-600">+</span>
        </button>
        <button className="bg-white p-1 rounded shadow hover:bg-gray-50 transition-colors">
          <span className="text-lg font-bold text-gray-600">−</span>
        </button>
      </div>

      {/* Información del mapa */}
      <div className="absolute bottom-2 left-2">
        <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs text-gray-600">
          Mapa de Tegucigalpa (Simulado)
        </div>
      </div>

      {/* Leyenda */}
      <div className="absolute bottom-2 right-2">
        <div className="bg-white/90 backdrop-blur-sm p-2 rounded text-xs space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Origen</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Destino</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Conductores</span>
          </div>
        </div>
      </div>
    </div>
  );
}
