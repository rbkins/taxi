"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Location, locationService } from "@/services/LocationService";

export interface Trip {
  id: string;
  passengerId: string;
  driverId?: string;
  origin: Location;
  destination: Location;
  proposedFare: number;
  finalFare?: number;
  status:
    | "pending"
    | "driver-assigned"
    | "accepted"
    | "in-progress"
    | "completed"
    | "cancelled";
  cancelReason?: string;
  startTime: Date;
  endTime?: Date;
  distance: number;
  estimatedTime: number;
  negotiations: Array<{
    from: "passenger" | "driver";
    amount: number;
    timestamp: Date;
    message?: string;
  }>;
  availableDrivers: Array<{
    id: string;
    name: string;
    rating: number;
    distance: number;
    estimatedArrival: number;
    vehicleInfo: {
      make: string;
      model: string;
      color: string;
      plate: string;
    };
    currentLocation: Location;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface TripNotification {
  id: string;
  tripId: string;
  recipientId: string;
  type:
    | "trip-request"
    | "trip-accepted"
    | "trip-rejected"
    | "counter-offer"
    | "trip-cancelled"
    | "trip-completed";
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: Date;
}

export interface ConnectedDriver {
  id: string;
  name: string;
  email: string;
  isOnline: boolean;
  currentLocation: Location;
  rating: number;
  vehicleInfo: {
    make: string;
    model: string;
    color: string;
    plate: string;
  };
  lastUpdate: Date;
}

interface TripContextType {
  // Estado
  currentTrip: Trip | null;
  tripHistory: Trip[];
  notifications: TripNotification[];
  connectedDrivers: ConnectedDriver[];
  isLoading: boolean;

  // Acciones de viaje
  createTripRequest: (
    origin: Location,
    destination: Location,
    proposedFare: number
  ) => Promise<string>;
  selectDriver: (tripId: string, driverId: string) => Promise<void>;
  acceptTrip: (tripId: string) => Promise<void>;
  rejectTrip: (tripId: string, reason?: string) => Promise<void>;
  makeCounterOffer: (
    tripId: string,
    amount: number,
    message?: string
  ) => Promise<void>;
  acceptCounterOffer: (tripId: string) => Promise<void>;
  startTrip: (tripId: string) => Promise<void>;
  completeTrip: (tripId: string) => Promise<void>;
  cancelTrip: (tripId: string, reason: string) => Promise<void>;

  // Acciones de notificaciones
  markNotificationAsRead: (notificationId: string) => void;
  clearAllNotifications: () => void;

  // Acciones de conductores
  connectDriver: (driverId: string, location: Location) => Promise<void>;
  disconnectDriver: (driverId: string) => Promise<void>;
  updateDriverLocation: (driverId: string, location: Location) => Promise<void>;
  getConnectedDrivers: () => ConnectedDriver[];
  refreshConnectedDrivers: () => Promise<void>;

  // Utilidades
  getTripById: (tripId: string) => Trip | null;
  getUnreadNotificationCount: () => number;
  refreshTripData: () => Promise<void>;
}

const TripContext = createContext<TripContextType | undefined>(undefined);

interface TripProviderProps {
  children: ReactNode;
}

export function TripProvider({ children }: TripProviderProps) {
  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);
  const [tripHistory, setTripHistory] = useState<Trip[]>([]);
  const [notifications, setNotifications] = useState<TripNotification[]>([]);
  const [connectedDrivers, setConnectedDrivers] = useState<ConnectedDriver[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);

  // Cargar datos iniciales y configurar polling
  useEffect(() => {
    loadInitialData();

    // Polling cada 3 segundos para simular tiempo real
    const intervalId = setInterval(() => {
      refreshTripData();
    }, 3000);

    return () => clearInterval(intervalId);
  }, []);

  // Cargar datos iniciales desde localStorage y API
  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      // Cargar desde localStorage como cache
      const savedCurrentTrip = localStorage.getItem("currentTrip");
      const savedTripHistory = localStorage.getItem("tripHistory");
      const savedNotifications = localStorage.getItem("tripNotifications");

      if (savedCurrentTrip) {
        setCurrentTrip(JSON.parse(savedCurrentTrip));
      }

      if (savedTripHistory) {
        setTripHistory(JSON.parse(savedTripHistory));
      }

      if (savedNotifications) {
        setNotifications(JSON.parse(savedNotifications));
      }

      // Cargar conductores conectados desde la API
      await refreshConnectedDrivers();
    } catch (error) {
      console.error("Error loading initial trip data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Refrescar datos desde la API
  const refreshTripData = async () => {
    try {
      // Actualizar conductores conectados cada vez que se refresca
      await refreshConnectedDrivers();

      // TODO: Implementar llamadas reales a la API para otros datos
      // const response = await fetch('/api/trips/current');
      // const data = await response.json();

      console.log("Trip data refreshed");
    } catch (error) {
      console.error("Error refreshing trip data:", error);
    }
  };

  // Crear nueva solicitud de viaje
  const createTripRequest = async (
    origin: Location,
    destination: Location,
    proposedFare: number
  ): Promise<string> => {
    setIsLoading(true);

    try {
      // Calcular ruta y obtener conductores disponibles
      const route = await locationService.calculateRoute(origin, destination);

      // Refrescar conductores conectados desde la API antes de crear el viaje
      await refreshConnectedDrivers();

      // SOLO usar conductores conectados reales - NO MOCKS
      const availableDrivers =
        connectedDrivers.length > 0
          ? await locationService.getAvailableDriversNearFromConnected(
              origin,
              connectedDrivers
            )
          : []; // Si no hay conductores conectados, lista vacía

      console.log("Conductores conectados:", connectedDrivers.length);
      console.log(
        "Conductores disponibles para el viaje:",
        availableDrivers.length
      );

      const newTrip: Trip = {
        id: `trip-${Date.now()}`,
        passengerId: "current-user", // TODO: Obtener del AuthContext
        origin,
        destination,
        proposedFare,
        status: "pending",
        startTime: new Date(),
        distance: route.distance,
        estimatedTime: route.estimatedTime,
        negotiations: [],
        availableDrivers,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Guardar en estado y localStorage
      setCurrentTrip(newTrip);
      localStorage.setItem("currentTrip", JSON.stringify(newTrip));

      // TODO: Enviar a la API
      // await fetch('/api/trips/create', {
      //   method: 'POST',
      //   body: JSON.stringify(newTrip)
      // });

      console.log("Trip request created:", newTrip);
      return newTrip.id;
    } catch (error) {
      console.error("Error creating trip request:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Seleccionar conductor
  const selectDriver = async (tripId: string, driverId: string) => {
    setIsLoading(true);

    try {
      if (!currentTrip || currentTrip.id !== tripId) {
        throw new Error("Trip not found");
      }

      const selectedDriver = currentTrip.availableDrivers.find(
        (d) => d.id === driverId
      );
      if (!selectedDriver) {
        throw new Error("Driver not found");
      }

      const updatedTrip: Trip = {
        ...currentTrip,
        driverId,
        status: "driver-assigned",
        updatedAt: new Date(),
      };

      setCurrentTrip(updatedTrip);
      localStorage.setItem("currentTrip", JSON.stringify(updatedTrip));

      // Crear notificación para el conductor
      const notification: TripNotification = {
        id: `notif-${Date.now()}`,
        tripId,
        recipientId: driverId,
        type: "trip-request",
        title: "Nueva solicitud de viaje",
        message: `Tienes una nueva solicitud de viaje desde ${currentTrip.origin.name} hasta ${currentTrip.destination.name}`,
        data: { proposedFare: currentTrip.proposedFare },
        read: false,
        createdAt: new Date(),
      };

      const updatedNotifications = [...notifications, notification];
      setNotifications(updatedNotifications);
      localStorage.setItem(
        "tripNotifications",
        JSON.stringify(updatedNotifications)
      );

      // TODO: Enviar a la API
      console.log("Driver selected:", selectedDriver);
    } catch (error) {
      console.error("Error selecting driver:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Conductor acepta viaje
  const acceptTrip = async (tripId: string) => {
    setIsLoading(true);

    try {
      if (!currentTrip || currentTrip.id !== tripId) {
        throw new Error("Trip not found");
      }

      const updatedTrip: Trip = {
        ...currentTrip,
        status: "accepted",
        finalFare: currentTrip.proposedFare,
        updatedAt: new Date(),
      };

      setCurrentTrip(updatedTrip);
      localStorage.setItem("currentTrip", JSON.stringify(updatedTrip));

      // Crear notificación para el pasajero
      const notification: TripNotification = {
        id: `notif-${Date.now()}`,
        tripId,
        recipientId: currentTrip.passengerId,
        type: "trip-accepted",
        title: "¡Viaje aceptado!",
        message: `Tu conductor ha aceptado el viaje. Llegará en aproximadamente ${
          currentTrip.availableDrivers.find(
            (d) => d.id === currentTrip.driverId
          )?.estimatedArrival || 5
        } minutos.`,
        read: false,
        createdAt: new Date(),
      };

      const updatedNotifications = [...notifications, notification];
      setNotifications(updatedNotifications);
      localStorage.setItem(
        "tripNotifications",
        JSON.stringify(updatedNotifications)
      );

      console.log("Trip accepted");
    } catch (error) {
      console.error("Error accepting trip:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Conductor rechaza viaje
  const rejectTrip = async (tripId: string, reason?: string) => {
    setIsLoading(true);

    try {
      if (!currentTrip || currentTrip.id !== tripId) {
        throw new Error("Trip not found");
      }

      const updatedTrip: Trip = {
        ...currentTrip,
        status: "cancelled",
        cancelReason: reason || "Rechazado por el conductor",
        endTime: new Date(),
        updatedAt: new Date(),
      };

      // Mover a historial
      const updatedHistory = [...tripHistory, updatedTrip];
      setTripHistory(updatedHistory);
      setCurrentTrip(null);

      localStorage.setItem("tripHistory", JSON.stringify(updatedHistory));
      localStorage.removeItem("currentTrip");

      // Crear notificación para el pasajero
      const notification: TripNotification = {
        id: `notif-${Date.now()}`,
        tripId,
        recipientId: currentTrip.passengerId,
        type: "trip-rejected",
        title: "Viaje no disponible",
        message:
          "El conductor no puede tomar tu viaje en este momento. Intenta con otro conductor.",
        read: false,
        createdAt: new Date(),
      };

      const updatedNotifications = [...notifications, notification];
      setNotifications(updatedNotifications);
      localStorage.setItem(
        "tripNotifications",
        JSON.stringify(updatedNotifications)
      );

      console.log("Trip rejected");
    } catch (error) {
      console.error("Error rejecting trip:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Hacer contraoferta
  const makeCounterOffer = async (
    tripId: string,
    amount: number,
    message?: string
  ) => {
    setIsLoading(true);

    try {
      if (!currentTrip || currentTrip.id !== tripId) {
        throw new Error("Trip not found");
      }

      const negotiation = {
        from: "driver" as const,
        amount,
        timestamp: new Date(),
        message,
      };

      const updatedTrip: Trip = {
        ...currentTrip,
        negotiations: [...currentTrip.negotiations, negotiation],
        updatedAt: new Date(),
      };

      setCurrentTrip(updatedTrip);
      localStorage.setItem("currentTrip", JSON.stringify(updatedTrip));

      // Crear notificación para el pasajero
      const notification: TripNotification = {
        id: `notif-${Date.now()}`,
        tripId,
        recipientId: currentTrip.passengerId,
        type: "counter-offer",
        title: "Contraoferta recibida",
        message: `El conductor propone $${amount.toFixed(2)} para tu viaje`,
        data: { amount, message },
        read: false,
        createdAt: new Date(),
      };

      const updatedNotifications = [...notifications, notification];
      setNotifications(updatedNotifications);
      localStorage.setItem(
        "tripNotifications",
        JSON.stringify(updatedNotifications)
      );

      console.log("Counter offer made:", amount);
    } catch (error) {
      console.error("Error making counter offer:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Aceptar contraoferta
  const acceptCounterOffer = async (tripId: string) => {
    setIsLoading(true);

    try {
      if (!currentTrip || currentTrip.id !== tripId) {
        throw new Error("Trip not found");
      }

      const lastNegotiation =
        currentTrip.negotiations[currentTrip.negotiations.length - 1];
      if (!lastNegotiation) {
        throw new Error("No counter offer found");
      }

      const updatedTrip: Trip = {
        ...currentTrip,
        status: "accepted",
        finalFare: lastNegotiation.amount,
        updatedAt: new Date(),
      };

      setCurrentTrip(updatedTrip);
      localStorage.setItem("currentTrip", JSON.stringify(updatedTrip));

      console.log("Counter offer accepted");
    } catch (error) {
      console.error("Error accepting counter offer:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Iniciar viaje
  const startTrip = async (tripId: string) => {
    setIsLoading(true);

    try {
      if (!currentTrip || currentTrip.id !== tripId) {
        throw new Error("Trip not found");
      }

      const updatedTrip: Trip = {
        ...currentTrip,
        status: "in-progress",
        updatedAt: new Date(),
      };

      setCurrentTrip(updatedTrip);
      localStorage.setItem("currentTrip", JSON.stringify(updatedTrip));

      console.log("Trip started");
    } catch (error) {
      console.error("Error starting trip:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Completar viaje
  const completeTrip = async (tripId: string) => {
    setIsLoading(true);

    try {
      if (!currentTrip || currentTrip.id !== tripId) {
        throw new Error("Trip not found");
      }

      const updatedTrip: Trip = {
        ...currentTrip,
        status: "completed",
        endTime: new Date(),
        updatedAt: new Date(),
      };

      // Mover a historial
      const updatedHistory = [...tripHistory, updatedTrip];
      setTripHistory(updatedHistory);
      setCurrentTrip(null);

      localStorage.setItem("tripHistory", JSON.stringify(updatedHistory));
      localStorage.removeItem("currentTrip");

      console.log("Trip completed");
    } catch (error) {
      console.error("Error completing trip:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Cancelar viaje
  const cancelTrip = async (tripId: string, reason: string) => {
    setIsLoading(true);

    try {
      if (!currentTrip || currentTrip.id !== tripId) {
        throw new Error("Trip not found");
      }

      const updatedTrip: Trip = {
        ...currentTrip,
        status: "cancelled",
        cancelReason: reason,
        endTime: new Date(),
        updatedAt: new Date(),
      };

      // Mover a historial
      const updatedHistory = [...tripHistory, updatedTrip];
      setTripHistory(updatedHistory);
      setCurrentTrip(null);

      localStorage.setItem("tripHistory", JSON.stringify(updatedHistory));
      localStorage.removeItem("currentTrip");

      console.log("Trip cancelled:", reason);
    } catch (error) {
      console.error("Error cancelling trip:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Marcar notificación como leída
  const markNotificationAsRead = (notificationId: string) => {
    const updatedNotifications = notifications.map((notif) =>
      notif.id === notificationId ? { ...notif, read: true } : notif
    );
    setNotifications(updatedNotifications);
    localStorage.setItem(
      "tripNotifications",
      JSON.stringify(updatedNotifications)
    );
  };

  // Limpiar todas las notificaciones
  const clearAllNotifications = () => {
    setNotifications([]);
    localStorage.removeItem("tripNotifications");
  };

  // Obtener viaje por ID
  const getTripById = (tripId: string): Trip | null => {
    if (currentTrip?.id === tripId) return currentTrip;
    return tripHistory.find((trip) => trip.id === tripId) || null;
  };

  // Obtener cantidad de notificaciones no leídas
  const getUnreadNotificationCount = (): number => {
    return notifications.filter((notif) => !notif.read).length;
  };

  // Refrescar conductores conectados desde la API
  const refreshConnectedDrivers = async () => {
    try {
      console.log("🔄 Refreshing connected drivers from API...");

      const response = await fetch("/api/drivers/status");
      console.log("📨 GET Response status:", response.status);

      const result = await response.json();
      console.log("📨 GET Response data:", result);

      if (result.success) {
        console.log("✅ Setting connected drivers:", result.drivers.length);
        setConnectedDrivers(result.drivers);
        console.log("📊 Connected drivers updated:", result.drivers);
      } else {
        console.error("❌ Error fetching connected drivers:", result.message);
      }
    } catch (error) {
      console.error("❌ Error refreshing connected drivers:", error);
    }
  };

  // Conectar conductor
  const connectDriver = async (
    driverId: string,
    location: Location
  ): Promise<void> => {
    try {
      console.log("🚗 Connecting driver with ID:", driverId);
      console.log("📍 Location:", location);

      // Usar API real para conectar conductor
      const token = localStorage.getItem("token");
      console.log("🎫 Token exists:", !!token);

      if (!token) {
        throw new Error("No hay token de autenticación");
      }

      console.log("📡 Making API call to /api/drivers/status...");

      const response = await fetch("/api/drivers/status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: "connect",
          location: location,
        }),
      });

      console.log("📨 Response status:", response.status);
      const result = await response.json();
      console.log("📨 Response data:", result);

      if (!result.success) {
        throw new Error(result.message || "Error conectando conductor");
      }

      // Actualizar estado local
      console.log("🔄 Refreshing connected drivers...");
      await refreshConnectedDrivers();

      console.log("✅ Driver connected successfully:", driverId);
    } catch (error) {
      console.error("❌ Error connecting driver:", error);
      throw error;
    }
  };

  // Desconectar conductor
  const disconnectDriver = async (driverId: string): Promise<void> => {
    try {
      console.log("Disconnecting driver with ID:", driverId);

      // Usar API real para desconectar conductor
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No hay token de autenticación");
      }

      const response = await fetch("/api/drivers/status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: "disconnect",
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Error desconectando conductor");
      }

      // Actualizar estado local
      await refreshConnectedDrivers();

      console.log("Driver disconnected successfully:", driverId);
    } catch (error) {
      console.error("Error disconnecting driver:", error);
      throw error;
    }
  };

  // Actualizar ubicación del conductor
  const updateDriverLocation = async (
    driverId: string,
    location: Location
  ): Promise<void> => {
    try {
      // Para actualizaciones de ubicación, usar API similar al connect
      const token = localStorage.getItem("token");
      if (!token) {
        console.warn("No hay token para actualizar ubicación");
        return;
      }

      const response = await fetch("/api/drivers/status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: "connect", // Reutilizar connect para actualizar ubicación
          location: location,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Actualizar estado local
        await refreshConnectedDrivers();
      }
    } catch (error) {
      console.error("Error updating driver location:", error);
    }
  };

  // Obtener conductores conectados
  const getConnectedDrivers = (): ConnectedDriver[] => {
    return connectedDrivers.filter((driver) => driver.isOnline);
  };

  // Función auxiliar para obtener datos mock de conductores
  const getMockDriverData = (driverId: string) => {
    const mockDrivers = [
      {
        id: "current-driver",
        name: "Juan Pérez",
        email: "juan@taxi.com",
        rating: 4.9,
        vehicleInfo: {
          make: "Toyota",
          model: "Camry",
          color: "Azul",
          plate: "TXI-001",
        },
      },
      {
        id: "driver-001",
        name: "Carlos Ruiz",
        email: "carlos@taxi.com",
        rating: 4.8,
        vehicleInfo: {
          make: "Toyota",
          model: "Corolla",
          color: "Blanco",
          plate: "ABC-123",
        },
      },
      {
        id: "driver-002",
        name: "María González",
        email: "maria@taxi.com",
        rating: 4.9,
        vehicleInfo: {
          make: "Nissan",
          model: "Sentra",
          color: "Gris",
          plate: "XYZ-789",
        },
      },
      {
        id: "driver-003",
        name: "Roberto López",
        email: "roberto@taxi.com",
        rating: 4.7,
        vehicleInfo: {
          make: "Honda",
          model: "Civic",
          color: "Negro",
          plate: "DEF-456",
        },
      },
    ];

    return mockDrivers.find((d) => d.id === driverId);
  };

  const value: TripContextType = {
    // Estado
    currentTrip,
    tripHistory,
    notifications,
    connectedDrivers,
    isLoading,

    // Acciones de viaje
    createTripRequest,
    selectDriver,
    acceptTrip,
    rejectTrip,
    makeCounterOffer,
    acceptCounterOffer,
    startTrip,
    completeTrip,
    cancelTrip,

    // Acciones de notificaciones
    markNotificationAsRead,
    clearAllNotifications,

    // Acciones de conductores
    connectDriver,
    disconnectDriver,
    updateDriverLocation,
    getConnectedDrivers,
    refreshConnectedDrivers,

    // Utilidades
    getTripById,
    getUnreadNotificationCount,
    refreshTripData,
  };

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
}

export function useTrip() {
  const context = useContext(TripContext);
  if (context === undefined) {
    throw new Error("useTrip must be used within a TripProvider");
  }
  return context;
}
