"use client";

import { useState, useEffect } from "react";
import { Location, locationService } from "@/services/LocationService";
import { useTrip } from "@/contexts/TripContext";
import MockMap from "@/components/map/MockMap";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  MapPin,
  Navigation,
  Loader2,
  Clock,
  DollarSign,
  Star,
  Car,
  User,
  Phone,
  MessageCircle,
  Zap,
  Target,
  ArrowRight,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface TripRequestFormProps {
  onTripRequested?: (tripId: string) => void;
  onTripOfferSent?: (tripData: {
    tripId: string;
    driverId: string;
    origin: Location;
    destination: Location;
    proposedFare: number;
    distance?: number;
    estimatedTime?: number;
  }) => void;
}

export default function TripRequestForm({
  onTripRequested,
  onTripOfferSent,
}: TripRequestFormProps) {
  const { connectedDrivers, sendTripOffer, isLoading } = useTrip();

  // Estados del formulario
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [destination, setDestination] = useState<Location | null>(null);
  const [destinationQuery, setDestinationQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Location[]>([]);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [proposedFare, setProposedFare] = useState(0);
  const [fareEstimate, setFareEstimate] = useState<{
    min: number;
    max: number;
    suggested: number;
  } | null>(null);

  // Estados de los modales
  const [showFareModal, setShowFareModal] = useState(false);
  const [showDriversModal, setShowDriversModal] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);

  // Estados de error
  const [error, setError] = useState("");

  // Detectar ubicación automáticamente al cargar
  useEffect(() => {
    detectCurrentLocation();
  }, []);

  // Buscar destinos cuando cambia la consulta
  useEffect(() => {
    if (destinationQuery.length > 2) {
      const results = locationService.searchPlaces(destinationQuery);
      setSearchResults(results);
    } else {
      setSearchResults(locationService.getPopularLocations());
    }
  }, [destinationQuery]);

  // Calcular estimación de tarifa cuando cambian origen y destino
  useEffect(() => {
    if (currentLocation && destination) {
      const distance = locationService.calculateDistance(
        currentLocation,
        destination
      );
      const estimate = locationService.calculateFareEstimate(distance);
      setFareEstimate(estimate);
      setProposedFare(estimate.suggested);
    }
  }, [currentLocation, destination]);

  const detectCurrentLocation = async () => {
    setIsDetectingLocation(true);
    setError("");

    try {
      const location = await locationService.getCurrentLocation();
      setCurrentLocation(location);
    } catch (error) {
      console.error("Error detecting location:", error);
      setError(
        "No se pudo detectar tu ubicación. Por favor, selecciona manualmente."
      );
      // Usar ubicación por defecto
      setCurrentLocation({
        id: "default-location",
        name: "Centro de Tegucigalpa",
        address: "Centro, Tegucigalpa",
        lat: 14.0722,
        lng: -87.2067,
      });
    } finally {
      setIsDetectingLocation(false);
    }
  };

  const handleDestinationSelect = (location: Location) => {
    setDestination(location);
    setDestinationQuery(location.name);
    setSearchResults([]);
  };

  const handleRequestTrip = () => {
    if (!currentLocation || !destination) {
      setError("Por favor selecciona origen y destino");
      return;
    }

    if (!fareEstimate) {
      setError("Error calculando la tarifa");
      return;
    }

    setShowFareModal(true);
  };

  const handleConfirmFare = async () => {
    if (!currentLocation || !destination || proposedFare <= 0) {
      setError("Datos incompletos para crear el viaje");
      return;
    }

    try {
      console.log("🚗 Creating trip request...");
      console.log("📍 Origin:", currentLocation);
      console.log("🎯 Destination:", destination);
      console.log("💰 Fare:", proposedFare);

      setShowFareModal(false);
      setShowDriversModal(true);
      onTripRequested?.("temp-id");
    } catch (error) {
      console.error("❌ Error creating trip:", error);
      setError("Error al crear la solicitud de viaje");
    }
  };

  const handleSelectDriver = async (driverId: string) => {
    if (!currentLocation || !destination) return;

    try {
      setSelectedDriverId(driverId);
      console.log("📤 Enviando solicitud a conductor:", driverId);

      const tripId = await sendTripOffer(
        driverId,
        currentLocation,
        destination,
        proposedFare
      );

      console.log("✅ Solicitud enviada con ID:", tripId);
      setShowDriversModal(false);
      setSelectedDriverId(null);

      // Llamar callback con los datos del viaje
      onTripOfferSent?.({
        tripId,
        driverId,
        origin: currentLocation,
        destination,
        proposedFare,
        distance: locationService.calculateDistance(
          currentLocation,
          destination
        ),
        estimatedTime: Math.ceil(
          locationService.calculateDistance(currentLocation, destination) * 2
        ), // Estimación simple: 2 min por km
      });

      // Mostrar mensaje de éxito
      setError("");
      // Aquí podrías agregar una notificación de éxito
    } catch (error) {
      console.error("Error sending trip offer:", error);
      setError("Error al enviar la solicitud al conductor");
      setSelectedDriverId(null);
    }
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Debug Panel */}
      <div className="bg-slate-100 p-4 rounded-lg text-xs space-y-2">
        <h4 className="font-semibold">DEBUG INFO</h4>
        <div>Connected Drivers Count: {connectedDrivers.length}</div>
        <div>
          Available Drivers: {connectedDrivers.filter((d) => d.isOnline).length}
        </div>
        <div>
          Connected Drivers:{" "}
          {JSON.stringify(
            connectedDrivers.map((d) => ({
              id: d.id,
              name: d.name,
              isOnline: d.isOnline,
            })),
            null,
            2
          )}
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Formulario principal */}
      <Card className="bg-gradient-to-r from-white to-gray-50 shadow-2xl border-0 overflow-hidden">
        <CardHeader>
          <CardTitle className="text-dark flex items-center space-x-2">
            <Navigation className="w-6 h-6 text-taxi-yellow" />
            <span>Planifica tu viaje</span>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4 lg:space-y-6">
          {/* Origen - Detección automática */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-dark flex items-center space-x-2">
              <div className="w-3 h-3 bg-success rounded-full"></div>
              <span>Desde</span>
            </label>
            <div className="relative">
              <Input
                value={currentLocation?.name || "Detectando ubicación..."}
                readOnly
                className="bg-gray-100 border-gray-200 text-dark pr-10"
              />
              {isDetectingLocation ? (
                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-taxi-yellow" />
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={detectCurrentLocation}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 text-taxi-yellow hover:bg-taxi-yellow/10"
                >
                  <Target className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Destino */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-dark flex items-center space-x-2">
              <div className="w-3 h-3 bg-error rounded-full"></div>
              <span>Hasta</span>
            </label>
            <div className="relative">
              <Input
                placeholder="¿A dónde quieres ir?"
                value={destinationQuery}
                onChange={(e) => setDestinationQuery(e.target.value)}
                className="bg-white border-gray-200 focus:border-taxi-yellow"
              />

              {/* Resultados de búsqueda */}
              {searchResults.length > 0 && destinationQuery.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto mt-1">
                  {searchResults.map((location) => (
                    <button
                      key={location.id}
                      onClick={() => handleDestinationSelect(location)}
                      className="w-full p-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 flex items-start space-x-3 transition-colors"
                    >
                      <MapPin className="w-4 h-4 mt-1 text-taxi-yellow flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-dark truncate">
                          {location.name}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {location.address}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Estimación de tarifa */}
          {fareEstimate && destination && (
            <div className="bg-taxi-yellow/10 rounded-lg p-4 border border-taxi-yellow/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-taxi-yellow" />
                  <span className="font-medium text-dark">Tarifa estimada</span>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-dark">
                    ${fareEstimate.suggested.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-600">
                    ${fareEstimate.min.toFixed(2)} - $
                    {fareEstimate.max.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Mini Mapa */}
          {currentLocation && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-dark">
                Vista previa del viaje
              </label>
              <MockMap
                origin={currentLocation}
                destination={destination || undefined}
                showRoute={Boolean(destination)}
                className="h-48 w-full"
              />
            </div>
          )}

          {/* Botón de solicitar */}
          <Button
            onClick={handleRequestTrip}
            disabled={!currentLocation || !destination || isLoading}
            className="w-full bg-gradient-to-r from-taxi-yellow to-yellow-400 hover:from-yellow-400 hover:to-taxi-yellow text-dark font-bold py-4 text-lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 mr-2" />
                Solicitar Taxi Ahora
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Modal de confirmación de tarifa */}
      <Dialog open={showFareModal} onOpenChange={setShowFareModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-taxi-yellow" />
              <span>Confirma tu tarifa</span>
            </DialogTitle>
            <DialogDescription>
              Propón la tarifa que estás dispuesto a pagar por este viaje
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {fareEstimate && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-center space-y-2">
                  <p className="text-sm text-gray-600">Tarifa sugerida</p>
                  <p className="text-2xl font-bold text-dark">
                    ${fareEstimate.suggested.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">
                    Rango: ${fareEstimate.min.toFixed(2)} - $
                    {fareEstimate.max.toFixed(2)}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-dark">
                Tu oferta (USD)
              </label>
              <Input
                type="number"
                min="1"
                step="0.50"
                value={proposedFare}
                onChange={(e) =>
                  setProposedFare(parseFloat(e.target.value) || 0)
                }
                className="text-center text-lg font-semibold"
              />
            </div>
          </div>

          <DialogFooter className="flex space-x-2">
            <Button variant="outline" onClick={() => setShowFareModal(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmFare}
              disabled={proposedFare <= 0}
              className="bg-taxi-yellow text-dark hover:bg-yellow-400"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Buscar Conductores
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de selección de conductores */}
      <Dialog open={showDriversModal} onOpenChange={setShowDriversModal}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Car className="w-5 h-5 text-taxi-yellow" />
              <span>Conductores Disponibles</span>
            </DialogTitle>
            <DialogDescription>
              Selecciona el conductor que prefieras para tu viaje
            </DialogDescription>
          </DialogHeader>

          {/* Mapa con conductores */}
          {currentLocation && destination && (
            <div className="mb-4">
              <MockMap
                origin={currentLocation}
                destination={destination}
                drivers={connectedDrivers
                  .filter((d) => d.isOnline)
                  .map((d) => ({
                    id: d.id,
                    name: d.name,
                    currentLocation: d.currentLocation,
                  }))}
                selectedDriver={selectedDriverId || undefined}
                showRoute={true}
                className="h-40 w-full"
              />
            </div>
          )}

          <div className="space-y-3">
            {connectedDrivers
              .filter((d) => d.isOnline)
              .map((driver) => (
                <Card
                  key={driver.id}
                  className="border-2 hover:border-taxi-yellow/50 transition-colors cursor-pointer"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-taxi-yellow to-yellow-400 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-dark" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-dark">
                            {driver.name}
                          </h3>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Star className="w-3 h-3 text-taxi-yellow fill-current" />
                            <span>{driver.rating}</span>
                            <span>•</span>
                            <span>En línea</span>
                          </div>
                          <p className="text-xs text-gray-500">
                            {driver.vehicleInfo.color} {driver.vehicleInfo.make}{" "}
                            {driver.vehicleInfo.model}
                          </p>
                          <p className="text-xs font-mono text-gray-600">
                            {driver.vehicleInfo.plate}
                          </p>
                        </div>
                      </div>

                      <div className="text-right space-y-1">
                        <Badge className="bg-success text-white">
                          <Clock className="w-3 h-3 mr-1" />
                          ~5 min
                        </Badge>
                        <Button
                          size="sm"
                          onClick={() => handleSelectDriver(driver.id)}
                          disabled={isLoading || selectedDriverId === driver.id}
                          className="w-full bg-taxi-yellow text-dark hover:bg-yellow-400"
                        >
                          {selectedDriverId === driver.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              Enviar Solicitud
                              <ArrowRight className="w-4 h-4 ml-1" />
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>

          {connectedDrivers.filter((d) => d.isOnline).length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Car className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="font-medium">
                No hay conductores disponibles en este momento
              </p>
              <p className="text-sm mt-2">
                Los conductores deben estar conectados y en línea para aparecer
                aquí
              </p>
              <p className="text-sm text-yellow-600 mt-1">
                No se muestran datos simulados - solo conductores reales
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
